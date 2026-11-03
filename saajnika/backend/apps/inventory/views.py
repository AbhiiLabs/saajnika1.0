from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Inventory, InventoryMovement

class InventoryMovementSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = InventoryMovement
        fields = ['id', 'change_type', 'quantity', 'reason', 'reference_id', 'created_by_email', 'created_at']


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    size = serializers.CharField(source='variant.size', read_only=True)
    color = serializers.CharField(source='variant.color_name', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    movements = InventoryMovementSerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'product_name', 'sku', 'size', 'color',
            'stock_quantity', 'reserved_quantity', 'available_quantity',
            'low_stock_threshold', 'is_low_stock', 'updated_at', 'movements'
        ]


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().select_related('variant', 'variant__product')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        inventory = self.get_object()
        delta = int(request.data.get('quantity', 0))
        reason = request.data.get('reason', 'Manual Admin Adjustment')

        if delta == 0:
            return Response({'error': 'Quantity delta cannot be zero.'}, status=status.HTTP_400_BAD_REQUEST)

        new_stock = inventory.stock_quantity + delta
        if new_stock < 0:
            return Response({'error': 'Stock quantity cannot drop below zero.'}, status=status.HTTP_400_BAD_REQUEST)

        inventory.stock_quantity = new_stock
        inventory.save()

        # Sync variant stock_quantity
        inventory.variant.stock_quantity = new_stock
        inventory.variant.save()

        InventoryMovement.objects.create(
            inventory=inventory,
            change_type=InventoryMovement.MovementType.ADJUSTMENT,
            quantity=delta,
            reason=reason,
            created_by=request.user
        )

        return Response(InventorySerializer(inventory).data)
