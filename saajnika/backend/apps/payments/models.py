import uuid
from django.db import models
from apps.orders.models import Order

class Payment(models.Model):
    class Provider(models.TextChoices):
        RAZORPAY = 'RAZORPAY', 'Razorpay'
        COD = 'COD', 'Cash on Delivery'
        SANDBOX = 'SANDBOX', 'Saajnika Private Boutique Sandbox'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    provider = models.CharField(max_length=30, choices=Provider.choices, default=Provider.RAZORPAY)

    transaction_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')

    error_code = models.CharField(max_length=100, blank=True, null=True)
    error_description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Payment #{self.id} for Order {self.order.order_number} ({self.status}) - ₹{self.amount}"


class PaymentWebhookEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_id = models.CharField(max_length=150, unique=True, db_index=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    error_log = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Webhook {self.event_id} ({self.event_type}) - Processed: {self.is_processed}"
