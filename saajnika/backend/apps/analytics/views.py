from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from apps.orders.models import Order
from apps.accounts.models import User
from apps.catalog.models import Product, ProductVariant
from apps.inventory.models import Inventory

class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Revenue metrics
        paid_orders = Order.objects.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING, Order.Status.PACKED, Order.Status.SHIPPED, Order.Status.DELIVERED])
        total_revenue = paid_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Orders counts
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status__in=[Order.Status.CREATED, Order.Status.PAYMENT_PENDING, Order.Status.PROCESSING]).count()
        delivered_orders = Order.objects.filter(status=Order.Status.DELIVERED).count()

        # Customer metrics
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()

        # Catalog & Inventory metrics
        active_products = Product.objects.filter(is_active=True).count()
        low_stock_variants = ProductVariant.objects.filter(is_active=True, stock_quantity__lte=3, stock_quantity__gt=0).count()
        out_of_stock_variants = ProductVariant.objects.filter(is_active=True, stock_quantity=0).count()

        # 30-Day Revenue Trend
        revenue_trend = (
            paid_orders.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('total_amount'), orders=Count('id'))
            .order_by('date')
        )

        trend_data = [
            {
                'date': item['date'].strftime('%b %d'),
                'revenue': float(item['revenue']),
                'orders': item['orders']
            }
            for item in revenue_trend
        ]

        # Status distribution
        status_dist = (
            Order.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent 5 Orders
        recent_orders = [
            {
                'order_number': o.order_number,
                'customer': o.user.get_full_name() if o.user else o.shipping_address.get('full_name', 'Guest'),
                'amount': float(o.total_amount),
                'status': o.status,
                'status_display': o.get_status_display(),
                'created_at': o.created_at.strftime('%d %b, %H:%M')
            }
            for o in Order.objects.all().order_by('-created_at')[:6]
        ]

        return Response({
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'delivered_orders': delivered_orders,
            'total_customers': total_customers,
            'active_products': active_products,
            'low_stock_variants': low_stock_variants,
            'out_of_stock_variants': out_of_stock_variants,
            'revenue_trend': trend_data,
            'status_distribution': list(status_dist),
            'recent_orders': recent_orders,
        })
