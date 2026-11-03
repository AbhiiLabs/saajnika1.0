from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import Shipment
from apps.orders.models import Order

class ShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id', 'order_number', 'provider', 'courier_name',
            'tracking_number', 'tracking_url', 'current_status',
            'estimated_delivery', 'shipped_at', 'delivered_at'
        ]


class PincodeCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pincode):
        pincode_clean = str(pincode).strip()
        if len(pincode_clean) != 6 or not pincode_clean.isdigit():
            return Response({
                'serviceable': False,
                'message': 'Please enter a valid 6-digit Indian PIN code.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Indian logistics zone estimation logic
        first_digit = int(pincode_clean[0])
        # Metro / North / West fast transit
        delivery_days = 3 if first_digit in [1, 2, 4] else (4 if first_digit in [3, 5, 6] else 5)
        est_date = timezone.now().date() + timedelta(days=delivery_days)

        return Response({
            'serviceable': True,
            'pincode': pincode_clean,
            'estimated_delivery_days': delivery_days,
            'estimated_delivery_date': est_date.strftime('%d %B, %Y'),
            'courier_partner': 'Bluedart Express Courier',
            'cod_available': True,
            'message': f"Guaranteed delivery by {est_date.strftime('%a, %d %b')}. Complimentary insurance included."
        })


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related('order').order_by('-created_at')
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def create_dispatch(self, request):
        order_number = request.data.get('order_number')
        courier_name = request.data.get('courier_name', 'Bluedart Express')
        tracking_number = request.data.get('tracking_number')

        order = Order.objects.get(order_number=order_number)
        if not tracking_number:
            import random
            tracking_number = f"BLD{random.randint(100000000, 999999999)}"

        shipment, _ = Shipment.objects.update_or_create(
            order=order,
            defaults={
                'provider': 'Shiprocket',
                'courier_name': courier_name,
                'tracking_number': tracking_number,
                'tracking_url': f"https://track.shiprocket.in/?tracking_id={tracking_number}",
                'current_status': 'DISPATCHED_IN_TRANSIT',
                'shipped_at': timezone.now(),
                'estimated_delivery': timezone.now().date() + timedelta(days=3)
            }
        )

        order.status = Order.Status.SHIPPED
        order.save()

        return Response(ShipmentSerializer(shipment).data)
