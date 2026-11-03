import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.accounts.models import User

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage'
        FIXED = 'FIXED', 'Fixed Amount'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="e.g. 15 for 15% or 500 for ₹500")
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=100)
    per_user_limit = models.PositiveIntegerField(default=1)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self, user=None, order_subtotal=Decimal('0')):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is currently inactive."
        if now < self.valid_from or now > self.valid_to:
            return False, "This coupon has expired or is not yet active."
        if self.times_used >= self.usage_limit:
            return False, "Coupon usage limit has been reached."
        if order_subtotal < self.min_order_value:
            return False, f"Minimum order value of ₹{self.min_order_value} required for this coupon."

        if user and user.is_authenticated:
            user_usages = self.usages.filter(user=user).count()
            if user_usages >= self.per_user_limit:
                return False, "You have already used this coupon maximum allowed times."

        return True, "Valid"

    def calculate_discount(self, order_subtotal):
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (order_subtotal * self.discount_value) / Decimal('100')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
            return discount
        else:
            return min(self.discount_value, order_subtotal)

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"


class CouponUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order_id = models.UUIDField(null=True, blank=True)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.coupon.code} used by {self.user} - ₹{self.discount_applied}"
