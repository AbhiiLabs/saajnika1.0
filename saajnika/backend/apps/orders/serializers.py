from rest_framework import serializers
from .models import Order, OrderItem
from apps.coupons.models import Coupon

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'variant', 'product_name', 'sku', 'size',
            'color', 'unit_price', 'quantity', 'total_price', 'image_url'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'subtotal', 'discount_amount',
            'shipping_fee', 'tax_amount', 'total_amount', 'coupon_code',
            'shipping_address', 'billing_address', 'customer_notes',
            'cancel_reason', 'return_reason', 'items', 'created_at',
            'updated_at', 'customer_name'
        ]

    def get_customer_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email
        return obj.shipping_address.get('full_name', 'Guest Customer')
