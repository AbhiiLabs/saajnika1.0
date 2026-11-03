from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.catalog.models import ProductVariant

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def _get_or_create_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            # Merge session cart if exists
            session_key = request.headers.get('X-Session-Key')
            if session_key:
                guest_cart = Cart.objects.filter(session_key=session_key).first()
                if guest_cart and guest_cart != cart:
                    for g_item in guest_cart.items.all():
                        item, created = CartItem.objects.get_or_create(
                            cart=cart,
                            variant=g_item.variant,
                            defaults={'quantity': g_item.quantity, 'unit_price': g_item.unit_price}
                        )
                        if not created:
                            item.quantity += g_item.quantity
                            item.save()
                    guest_cart.delete()
            return cart
        else:
            session_key = request.headers.get('X-Session-Key')
            if not session_key:
                session_key = request.session.session_key or 'anon_guest'
            cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
            return cart

    def list(self, request):
        cart = self._get_or_create_cart(request)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self._get_or_create_cart(request)
        variant_id = request.data.get('variant_id')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid quantity specified.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({'error': 'Quantity must be positive.'}, status=status.HTTP_400_BAD_REQUEST)

        variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)

        if variant.stock_quantity < quantity:
            return Response({
                'error': f'Only {variant.stock_quantity} units available for {variant.size}/{variant.color_name}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={'quantity': quantity, 'unit_price': variant.final_price}
        )

        if not created:
            new_qty = item.quantity + quantity
            if new_qty > variant.stock_quantity:
                return Response({
                    'error': f'Cannot add more than {variant.stock_quantity} units in total.'
                }, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = new_qty
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart = self._get_or_create_cart(request)
        item_id = request.data.get('item_id')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid quantity specified.'}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(CartItem, id=item_id, cart=cart)

        if quantity <= 0:
            item.delete()
        else:
            if item.variant.stock_quantity < quantity:
                return Response({
                    'error': f'Only {item.variant.stock_quantity} units available.'
                }, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self._get_or_create_cart(request)
        item_id = request.data.get('item_id')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self._get_or_create_cart(request)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)
