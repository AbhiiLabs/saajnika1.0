from rest_framework import generics, status, viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Sum
from .models import User, CustomerProfile, Address
from .serializers import UserSerializer, RegisterSerializer, AddressSerializer
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Account created successfully.'
        }, status=status.HTTP_201_CREATED)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        is_first = not Address.objects.filter(user=self.request.user).exists()
        serializer.save(user=self.request.user, is_default=serializer.validated_data.get('is_default', is_first))


class AdminCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role=User.Role.CUSTOMER).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'email']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        users = page if page is not None else queryset

        results = []
        for u in users:
            orders = Order.objects.filter(user=u)
            total_spend = orders.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING, Order.Status.PACKED, Order.Status.SHIPPED, Order.Status.DELIVERED]).aggregate(total=Sum('total_amount'))['total'] or 0
            results.append({
                'id': u.id,
                'email': u.email,
                'name': u.get_full_name() or u.email,
                'phone': u.phone,
                'loyalty_tier': getattr(u, 'profile', None).loyalty_tier if hasattr(u, 'profile') else 'Connoisseur',
                'is_active': u.is_active,
                'total_orders': orders.count(),
                'total_spend': float(total_spend),
                'date_joined': u.date_joined.strftime('%d %b, %Y'),
            })

        if page is not None:
            return self.get_paginated_response(results)
        return Response(results)

    def retrieve(self, request, pk=None):
        user = self.get_object()
        addresses = Address.objects.filter(user=user)
        orders = Order.objects.filter(user=user).order_by('-created_at')
        total_spend = orders.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING, Order.Status.PACKED, Order.Status.SHIPPED, Order.Status.DELIVERED]).aggregate(total=Sum('total_amount'))['total'] or 0

        return Response({
            'user': UserSerializer(user).data,
            'total_orders': orders.count(),
            'total_spend': float(total_spend),
            'addresses': AddressSerializer(addresses, many=True).data,
            'recent_orders': OrderSerializer(orders[:10], many=True).data,
        })

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'id': user.id, 'is_active': user.is_active, 'status': 'updated'})
