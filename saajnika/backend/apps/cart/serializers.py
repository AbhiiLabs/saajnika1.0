from rest_framework import serializers
from .models import Cart, CartItem
from apps.catalog.serializers import ProductVariantSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    primary_image = serializers.CharField(source='variant.product.primary_image', read_only=True)
    size = serializers.CharField(source='variant.size', read_only=True)
    color_name = serializers.CharField(source='variant.color_name', read_only=True)
    color_hex = serializers.CharField(source='variant.color_hex', read_only=True)
    stock_quantity = serializers.IntegerField(source='variant.stock_quantity', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'variant', 'product_name', 'product_slug', 'primary_image',
            'size', 'color_name', 'color_hex', 'quantity', 'unit_price',
            'total_price', 'stock_quantity'
        ]
        read_only_fields = ['id', 'unit_price', 'total_price']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'total_items', 'updated_at']
