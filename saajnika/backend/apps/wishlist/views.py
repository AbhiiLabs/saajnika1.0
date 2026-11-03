from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Wishlist, WishlistItem
from apps.catalog.serializers import ProductListSerializer
from apps.catalog.models import Product

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'created_at']


class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        return wishlist

    def list(self, request):
        wishlist = self._get_wishlist(request.user)
        items = wishlist.items.select_related('product', 'product__category').all()
        serializer = WishlistItemSerializer(items, many=True)
        return Response({
            'items': serializer.data,
            'total_items': items.count(),
            'product_ids': list(items.values_list('product_id', flat=True))
        })

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        wishlist = self._get_wishlist(request.user)
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        item = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()
        if item:
            item.delete()
            added = False
        else:
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            added = True

        return Response({
            'added': added,
            'total_items': wishlist.items.count(),
            'product_id': str(product.id)
        })
