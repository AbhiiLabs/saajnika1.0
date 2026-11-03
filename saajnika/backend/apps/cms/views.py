from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import HomepageBanner, StoreSetting, NewsletterSubscriber

class HomepageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageBanner
        fields = '__all__'


class StoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = ['key', 'value', 'description']


class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email or '@' not in email:
            return Response({'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.save()

        return Response({
            'success': True,
            'message': 'Welcome to the Saajnika Salon. You have been granted private editorial privileges and seasonal previews.'
        })


class HomepageBannerViewSet(viewsets.ModelViewSet):
    queryset = HomepageBanner.objects.all().order_by('display_order', '-created_at')
    serializer_class = HomepageBannerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StoreSettingViewSet(viewsets.ModelViewSet):
    queryset = StoreSetting.objects.all()
    serializer_class = StoreSettingSerializer
    lookup_field = 'key'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def bulk_update(self, request):
        settings_dict = request.data
        updated = {}
        for key, val in settings_dict.items():
            s, _ = StoreSetting.objects.update_or_create(key=key, defaults={'value': str(val)})
            updated[s.key] = s.value
        return Response({'status': 'success', 'settings': updated})
