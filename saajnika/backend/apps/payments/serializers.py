from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order_number', 'provider', 'transaction_id',
            'razorpay_order_id', 'razorpay_payment_id', 'status',
            'amount', 'currency', 'created_at', 'verified_at'
        ]
