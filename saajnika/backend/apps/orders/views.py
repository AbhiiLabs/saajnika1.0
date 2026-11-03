from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.cart.models import Cart
from apps.coupons.models import Coupon, CouponUsage
from apps.catalog.models import ProductVariant
from apps.inventory.models import Inventory, InventoryMovement
from apps.audit.models import AuditLog

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('user', 'coupon').prefetch_related('items').order_by('-created_at')
    serializer_class = OrderSerializer
    lookup_field = 'order_number'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['order_number', 'guest_email', 'shipping_address__full_name', 'shipping_address__phone']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            # Guest lookup by session/order number will be handled in specific action
            return Order.objects.none()
        if user.is_staff or user.role == 'ADMIN':
            return Order.objects.all().select_related('user', 'coupon').prefetch_related('items').order_by('-created_at')
        return Order.objects.filter(user=user).select_related('user', 'coupon').prefetch_related('items').order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def create_checkout_order(self, request):
        """
        Creates an authoritative Order from the cart or direct payload.
        Ensures atomic inventory checks and locks against overselling.
        """
        data = request.data
        shipping_address = data.get('shipping_address')
        if not shipping_address or not shipping_address.get('full_name') or not shipping_address.get('pincode'):
            return Response({'error': 'A complete shipping address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        items_data = data.get('items', [])
        if not items_data:
            # Fallback to current user cart
            if request.user.is_authenticated:
                cart = Cart.objects.filter(user=request.user).first()
                if cart:
                    items_data = [
                        {'variant_id': str(item.variant.id), 'quantity': item.quantity}
                        for item in cart.items.all()
                    ]

        if not items_data:
            return Response({'error': 'Cannot create order with an empty shopping bag.'}, status=status.HTTP_400_BAD_REQUEST)

        coupon_code = data.get('coupon_code')
        coupon = None
        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code.strip().upper(), is_active=True).first()

        try:
            with transaction.atomic():
                subtotal = Decimal('0.00')
                validated_items = []

                # Select and lock variants to prevent race-condition overselling
                for item_input in items_data:
                    variant_id = item_input.get('variant_id')
                    try:
                        quantity = int(item_input.get('quantity', 1))
                    except (ValueError, TypeError):
                        return Response({'error': 'Invalid quantity specified.'}, status=status.HTTP_400_BAD_REQUEST)

                    if quantity <= 0:
                        return Response({'error': 'Item quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

                    variant = ProductVariant.objects.select_for_update().get(id=variant_id, is_active=True)
                    if variant.stock_quantity < quantity:
                        return Response({
                            'error': f"Insufficient stock for {variant.product.name} ({variant.size}/{variant.color_name}). Only {variant.stock_quantity} remaining."
                        }, status=status.HTTP_400_BAD_REQUEST)

                    item_total = variant.final_price * quantity
                    subtotal += item_total
                    validated_items.append({
                        'variant': variant,
                        'quantity': quantity,
                        'unit_price': variant.final_price,
                        'total_price': item_total,
                        'image_url': variant.product.primary_image,
                    })

                # Calculate discount
                discount_amount = Decimal('0.00')
                if coupon:
                    is_valid, msg = coupon.is_valid(user=request.user, order_subtotal=subtotal)
                    if is_valid:
                        discount_amount = coupon.calculate_discount(subtotal)

                # Shipping fee calculation (Free above ₹3,999)
                shipping_fee = Decimal('0.00') if subtotal >= Decimal('3999.00') else Decimal('250.00')
                tax_amount = Decimal('0.00') # GST included in apparel prices per Indian luxury standard
                total_amount = max(Decimal('0.00'), subtotal - discount_amount + shipping_fee)

                # Create Order
                order = Order.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    guest_email=request.user.email if request.user.is_authenticated else shipping_address.get('email'),
                    guest_phone=shipping_address.get('phone'),
                    status=Order.Status.CREATED,
                    subtotal=subtotal,
                    discount_amount=discount_amount,
                    shipping_fee=shipping_fee,
                    tax_amount=tax_amount,
                    total_amount=total_amount,
                    coupon=coupon,
                    shipping_address=shipping_address,
                    customer_notes=data.get('customer_notes', '')
                )

                # Create Order Items and deduct inventory safely
                for v_item in validated_items:
                    variant = v_item['variant']
                    qty = v_item['quantity']

                    OrderItem.objects.create(
                        order=order,
                        variant=variant,
                        product_name=variant.product.name,
                        sku=variant.sku,
                        size=variant.size,
                        color=variant.color_name,
                        unit_price=v_item['unit_price'],
                        quantity=qty,
                        total_price=v_item['total_price'],
                        image_url=v_item['image_url']
                    )

                    # Deduct stock
                    variant.stock_quantity -= qty
                    variant.save()

                    # Record Inventory Movement if inventory record exists
                    inv, _ = Inventory.objects.get_or_create(variant=variant, defaults={'stock_quantity': variant.stock_quantity})
                    inv.stock_quantity = variant.stock_quantity
                    inv.save()

                    InventoryMovement.objects.create(
                        inventory=inv,
                        change_type=InventoryMovement.MovementType.PURCHASE,
                        quantity=-qty,
                        reason=f"Order #{order.order_number}",
                        reference_id=order.order_number,
                        created_by=request.user if request.user.is_authenticated else None
                    )

                if coupon:
                    coupon.times_used += 1
                    coupon.save()
                    CouponUsage.objects.create(
                        coupon=coupon,
                        user=request.user if request.user.is_authenticated else None,
                        order_id=order.id,
                        discount_applied=discount_amount
                    )

                # Clear user cart if exists
                if request.user.is_authenticated:
                    Cart.objects.filter(user=request.user).delete()

                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_order(self, request, order_number=None):
        order = get_object_or_404(Order, order_number=order_number)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_order(self, request, order_number=None):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        reason = request.data.get('reason', 'Customer requested cancellation')

        if not order.can_transition_to(Order.Status.CANCELLED):
            return Response({'error': f"Cannot cancel order in status '{order.get_status_display()}'."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order.status = Order.Status.CANCELLED
            order.cancel_reason = reason
            order.save()

            # Restore inventory
            for item in order.items.all():
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                    item.variant.save()
                    inv, _ = Inventory.objects.get_or_create(variant=item.variant)
                    inv.stock_quantity = item.variant.stock_quantity
                    inv.save()
                    InventoryMovement.objects.create(
                        inventory=inv,
                        change_type=InventoryMovement.MovementType.RETURN,
                        quantity=item.quantity,
                        reason=f"Order cancellation #{order.order_number}",
                        reference_id=order.order_number,
                        created_by=request.user
                    )

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, order_number=None):
        order = get_object_or_404(Order, order_number=order_number)
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if not new_status or new_status not in dict(Order.Status.choices):
            return Response({'error': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if not order.can_transition_to(new_status) and not request.user.is_superuser:
            return Response({'error': f"Disallowed transition from {order.status} to {new_status}"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = new_status
        if notes:
            order.internal_admin_notes = f"{order.internal_admin_notes or ''}\n[{request.user.email}]: {notes}".strip()
        order.save()

        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action='ORDER_STATUS_UPDATE',
            entity_type='Order',
            entity_id=str(order.id),
            details={'from': old_status, 'to': new_status, 'order_number': order.order_number}
        )

        return Response(OrderSerializer(order).data)
