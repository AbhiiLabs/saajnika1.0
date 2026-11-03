from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.catalog.models import Category, Product, ProductVariant
from apps.accounts.models import User

class CatalogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        self.product = Product.objects.create(
            name='Silk Tunic',
            sku='TEST-01',
            category=self.category,
            base_price=Decimal('5000.00'),
            sale_price=Decimal('4500.00'),
            short_description='Test short description',
            description='Test long description'
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='TEST-01-M-BLK',
            size='M',
            color_name='Black',
            color_hex='#000000',
            stock_quantity=10
        )

    def test_get_product_list(self):
        response = self.client.get('/api/catalog/products/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['sku'], 'TEST-01')

    def test_product_filter_by_category(self):
        response = self.client.get('/api/catalog/products/?category=test-category')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)

    def test_product_detail(self):
        response = self.client.get(f'/api/catalog/products/{self.product.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Silk Tunic')
        self.assertEqual(len(response.data['variants']), 1)
