import uuid
from django.db import models
from apps.orders.models import Order

class Shipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    provider = models.CharField(max_length=50, default='Shiprocket')
    courier_name = models.CharField(max_length=100, default='Bluedart Air Express')
    tracking_number = models.CharField(max_length=100, unique=True)
    tracking_url = models.URLField(max_length=500, blank=True, null=True)
    current_status = models.CharField(max_length=50, default='DISPATCH_PREPARED')
    estimated_delivery = models.DateField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment {self.tracking_number} for Order {self.order.order_number}"
