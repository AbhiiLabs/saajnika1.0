import uuid
import random
import string
from django.db import models
from apps.accounts.models import User
from apps.catalog.models import ProductVariant
from apps.coupons.models import Coupon

def generate_order_number():
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SJ-{random_str}"

class Order(models.Model):
    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        PAYMENT_PENDING = 'PAYMENT_PENDING', 'Payment Pending'
        PAID = 'PAID', 'Paid'
        PROCESSING = 'PROCESSING', 'Processing in Atelier'
        PACKED = 'PACKED', 'Packed'
        SHIPPED = 'SHIPPED', 'Dispatched'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        RETURN_REQUESTED = 'RETURN_REQUESTED', 'Return Requested'
        RETURNED = 'RETURNED', 'Returned'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, default=generate_order_number, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    guest_email = models.EmailField(blank=True, null=True)
    guest_phone = models.CharField(max_length=20, blank=True, null=True)

    status = models.CharField(max_length=30, choices=Status.choices, default=Status.CREATED)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    # Immutable snapshot of shipping address taken at purchase time
    shipping_address = models.JSONField(help_text="Frozen snapshot of shipping address at checkout")
    billing_address = models.JSONField(blank=True, null=True)

    customer_notes = models.TextField(blank=True, null=True)
    internal_admin_notes = models.TextField(blank=True, null=True)
    cancel_reason = models.TextField(blank=True, null=True)
    return_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def can_transition_to(self, new_status):
        allowed_transitions = {
            self.Status.CREATED: [self.Status.PAYMENT_PENDING, self.Status.PAID, self.Status.CANCELLED],
            self.Status.PAYMENT_PENDING: [self.Status.PAID, self.Status.CANCELLED],
            self.Status.PAID: [self.Status.PROCESSING, self.Status.CANCELLED, self.Status.REFUNDED],
            self.Status.PROCESSING: [self.Status.PACKED, self.Status.CANCELLED],
            self.Status.PACKED: [self.Status.SHIPPED, self.Status.CANCELLED],
            self.Status.SHIPPED: [self.Status.OUT_FOR_DELIVERY, self.Status.DELIVERED],
            self.Status.OUT_FOR_DELIVERY: [self.Status.DELIVERED],
            self.Status.DELIVERED: [self.Status.RETURN_REQUESTED],
            self.Status.RETURN_REQUESTED: [self.Status.RETURNED, self.Status.DELIVERED],
            self.Status.RETURNED: [self.Status.REFUNDED],
            self.Status.CANCELLED: [],
            self.Status.REFUNDED: [],
        }
        return new_status in allowed_transitions.get(self.status, [])

    def __str__(self):
        return f"Order #{self.order_number} ({self.status}) - ₹{self.total_amount}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)

    # Historical frozen snapshot fields
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    size = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=600, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.size}/{self.color})"
