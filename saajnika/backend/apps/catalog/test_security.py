from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.catalog.models import Category, Product, ProductVariant
from apps.coupons.models import Coupon
from django.utils import timezone
from datetime import timedelta

class SecurityAndVulnerabilityTests(TestCase):
    """
    Automated security tests for SAAJNIKA Boutique:
    - SQL Injection Defense
    - Cross-Site Scripting (XSS) Sanitization
    - Broken Access Control / Privilege Escalation
    - JWT Tampering Defense
    - Business Logic / Negative Value Injection
    """

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Silk Silhouettes', slug='silk-silhouettes')
        self.product = Product.objects.create(
            name='Chanderi Silk Drape',
            sku='SEC-001',
            category=self.category,
            base_price=Decimal('7500.00'),
            short_description='Pure organic handloom',
            description='Crafted with traditional zari weaves'
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='SEC-001-M-GLD',
            size='M',
            color_name='Antique Gold',
            color_hex='#D4AF37',
            stock_quantity=15
        )
        self.customer = User.objects.create_user(
            email='shopper@saajnika.com',
            password='CustomerSecure2025!',
            first_name='Ananya',
            last_name='Sharma',
            role=User.Role.CUSTOMER
        )
        self.admin = User.objects.create_superuser(
            email='atelier.admin@saajnika.com',
            password='AdminSuperPass2025!'
        )

    # 1. SQL Injection Checks
    def test_sql_injection_in_search_parameter(self):
        """Verify that ORM parameterization neutralizes SQL injection attempts in search."""
        sqli_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE catalog_product; --",
            "1' UNION SELECT null, null, null, null--",
            "' OR 1=1 #",
            "admin' --",
        ]
        for payload in sqli_payloads:
            response = self.client.get(f'/api/catalog/products/?search={payload}')
            # Must return 200 without exposing SQL syntax errors or crashing
            self.assertEqual(response.status_code, 200, f"SQLi probe failed on: {payload}")
            # Ensure no DB error strings are leaked in response
            self.assertNotIn('syntax error', str(response.content).lower())
            self.assertNotIn('psycopg2', str(response.content).lower())
            self.assertNotIn('sqlite3.operationalerror', str(response.content).lower())

    def test_sql_injection_in_category_filter(self):
        """Verify category filtering prevents SQL injection."""
        sqli_payload = "silk-silhouettes' OR 'a'='a"
        response = self.client.get(f'/api/catalog/products/?category={sqli_payload}')
        self.assertEqual(response.status_code, 200)
        # Should return 0 matching products because literal category does not exist
        self.assertEqual(len(response.data.get('results', [])), 0)

    # 2. XSS (Cross-Site Scripting) Checks
    def test_xss_in_user_registration(self):
        """Verify malicious script payloads in registration fields are stored and serialized safely without execution."""
        xss_payload = '<script>alert("XSS-ATTACK")</script>'
        reg_payload = {
            'email': 'xss.test@saajnika.com',
            'first_name': xss_payload,
            'last_name': '<img src=x onerror=alert(1)>',
            'phone': '9876543210',
            'password': 'SecurePassword2025!',
            'password_confirm': 'SecurePassword2025!'
        }
        response = self.client.post('/api/auth/register/', reg_payload, format='json')
        self.assertEqual(response.status_code, 201)
        
        # Verify JSON serialization safely preserves raw text without script execution context
        created_user = User.objects.get(email='xss.test@saajnika.com')
        self.assertEqual(created_user.first_name, xss_payload)
        
        # Fetching profile through API must return standard Content-Type application/json (not text/html)
        self.client.force_authenticate(user=created_user)
        profile_res = self.client.get('/api/auth/profile/')
        self.assertEqual(profile_res.status_code, 200)
        self.assertTrue('application/json' in profile_res['Content-Type'])

    # 3. Access Control & Authorization (IDOR / Privilege Escalation)
    def test_admin_endpoint_forbidden_for_anonymous(self):
        """Unauthenticated requests to admin endpoints must be rejected with 401."""
        response = self.client.get('/api/catalog/admin/products/')
        self.assertEqual(response.status_code, 401)

    def test_admin_endpoint_forbidden_for_regular_customers(self):
        """Regular customer tokens cannot access Atelier Admin CRUD endpoints (403 Forbidden)."""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/catalog/admin/products/')
        self.assertEqual(response.status_code, 403)

    def test_customer_cannot_modify_catalog(self):
        """Non-admin user cannot delete or alter silhouettes."""
        self.client.force_authenticate(user=self.customer)
        del_res = self.client.delete(f'/api/catalog/admin/products/{self.product.id}/')
        self.assertEqual(del_res.status_code, 403)
        self.assertTrue(Product.objects.filter(id=self.product.id).exists())

    # 4. JWT Authentication Security
    def test_tampered_jwt_token_rejected(self):
        """Altered or fabricated JWT signatures must be rejected immediately."""
        fake_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.InVaLiD_SiGnAtUrE_12345"
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {fake_jwt}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data.get('code'), 'token_not_valid')

    # 5. Business Logic & Negative Quantity Protections
    def test_prevent_negative_order_quantity(self):
        """Ensure malicious order items with negative or zero quantities are blocked."""
        payload = {
            'shipping_address': {
                'full_name': 'Test Attacker',
                'phone': '9876543210',
                'address_line1': '104 Secure Lane',
                'city': 'Delhi',
                'state': 'Delhi',
                'pincode': '110001',
            },
            'items': [
                {'variant_id': str(self.variant.id), 'quantity': -5}
            ]
        }
        response = self.client.post('/api/orders/create_checkout_order/', payload, format='json')
        self.assertEqual(response.status_code, 400)

