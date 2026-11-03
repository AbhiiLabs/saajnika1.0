import uuid
from django.db import models
from apps.catalog.models import ProductVariant
from apps.accounts.models import User

class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='inventory')
    stock_quantity = models.PositiveIntegerField(default=10)
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=3)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_quantity(self):
        return max(0, self.stock_quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.low_stock_threshold

    def __str__(self):
        return f"Inventory: {self.variant.sku} (Available: {self.available_quantity})"


class InventoryMovement(models.Model):
    class MovementType(models.TextChoices):
        RESTOCK = 'RESTOCK', 'Restock'
        PURCHASE = 'PURCHASE', 'Customer Purchase'
        RETURN = 'RETURN', 'Customer Return'
        ADJUSTMENT = 'ADJUSTMENT', 'Manual Adjustment'
        RESERVATION = 'RESERVATION', 'Order Reservation'
        RELEASE = 'RELEASE', 'Reservation Release'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='movements')
    change_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField(help_text="Positive for additions, negative for reductions")
    reason = models.CharField(max_length=255)
    reference_id = models.CharField(max_length=100, blank=True, null=True, help_text="Order ID or PO number")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.change_type} {self.quantity} for {self.inventory.variant.sku}"
