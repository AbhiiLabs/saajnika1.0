from decimal import Decimal
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Coupon, CouponUsage

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_value', 'max_discount_amount', 'valid_from', 'valid_to',
            'usage_limit', 'times_used', 'is_active'
        ]


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.action in ['validate_coupon']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        code = request.data.get('code', '').strip().upper()
        subtotal_str = request.data.get('subtotal', 0)

        try:
            subtotal = Decimal(str(subtotal_str))
        except:
            subtotal = Decimal('0')

        if not code:
            return Response({'valid': False, 'error': 'Coupon code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        coupon = Coupon.objects.filter(code=code).first()
        if not coupon:
            return Response({'valid': False, 'error': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, message = coupon.is_valid(user=request.user, order_subtotal=subtotal)
        if not is_valid:
            return Response({'valid': False, 'error': message}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = coupon.calculate_discount(subtotal)
        return Response({
            'valid': True,
            'code': coupon.code,
            'description': coupon.description,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'discount_amount': discount_amount,
            'message': 'Coupon applied successfully!'
        })
