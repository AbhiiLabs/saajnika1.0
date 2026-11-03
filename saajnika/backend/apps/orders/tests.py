from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, Address
from apps.catalog.models import Category, Product, ProductVariant
from apps.coupons.models import Coupon
from apps.orders.models import Order
from django.utils import timezone
from datetime import timedelta

class OrderAndCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testcustomer@saajnika.com',
            password='TestPassword123!',
            first_name='Pooja',
            last_name='Mehta'
        )
        self.category = Category.objects.create(name='Luxury Silk', slug='luxury-silk')
        self.product = Product.objects.create(
            name='Maheshwari Kurta',
            sku='MKT-01',
            category=self.category,
            base_price=Decimal('6000.00'),
            short_description='Short desc',
            description='Detailed craft'
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='MKT-01-S-IVR',
            size='S',
            color_name='Ivory',
            color_hex='#FFFFFF',
            stock_quantity=5
        )
        self.coupon = Coupon.objects.create(
            code='FESTIVE10',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('10.00'),
            min_order_value=Decimal('3000.00'),
            valid_from=timezone.now() - timedelta(days=1),
            valid_to=timezone.now() + timedelta(days=30),
            usage_limit=100,
            is_active=True
        )

    def test_create_order_atomic_and_stock_deduction(self):
        payload = {
            'shipping_address': {
                'full_name': 'Pooja Mehta',
                'phone': '9876543210',
                'address_line1': '104 Lotus Towers',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400050',
                'email': 'testcustomer@saajnika.com'
            },
            'items': [
                {'variant_id': str(self.variant.id), 'quantity': 2}
            ],
            'coupon_code': 'FESTIVE10'
        }

        response = self.client.post('/api/orders/create_checkout_order/', payload, format='json')
        self.assertEqual(response.status_code, 201)

        # Verify order total: 2 * 6000 = 12000, 10% coupon = 1200, shipping = 0 (over 3999) -> total = 10800
        order_num = response.data['order_number']
        order = Order.objects.get(order_number=order_num)
        self.assertEqual(order.subtotal, Decimal('12000.00'))
        self.assertEqual(order.discount_amount, Decimal('1200.00'))
        self.assertEqual(order.total_amount, Decimal('10800.00'))

        # Check stock deduction
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 3)

    def test_prevent_overselling(self):
        payload = {
            'shipping_address': {
                'full_name': 'Pooja Mehta',
                'phone': '9876543210',
                'address_line1': '104 Lotus Towers',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400050',
            },
            'items': [
                {'variant_id': str(self.variant.id), 'quantity': 10} # Only 5 in stock!
            ]
        }

        response = self.client.post('/api/orders/create_checkout_order/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Insufficient stock', response.data['error'])
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 5) # Unchanged!
