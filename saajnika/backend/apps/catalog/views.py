import os
import uuid
from django.conf import settings
from rest_framework import viewsets, permissions, filters, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Product, ProductImage, ProductVariant
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    AdminProductCreateUpdateSerializer
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by('display_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('display_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants')
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'description', 'short_description', 'collection_name']
    ordering_fields = ['base_price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        category_slug = self.request.query_params.get('category')
        if category_slug:
            # Map intuitive Indian fashion categories to products gracefully
            if category_slug in ('sarees', 'saree', 'sarism'):
                qs = qs.filter(Q(category__slug='the-silk-edit') | Q(name__icontains='saree') | Q(name__icontains='sari') | Q(description__icontains='saree'))
            elif category_slug in ('kurtas-suits', 'kurtas', 'kurtis'):
                qs = qs.filter(Q(category__slug='contemporary-ethnic') | Q(name__icontains='kurta') | Q(name__icontains='anarkali') | Q(name__icontains='angrakha'))
            elif category_slug in ('dupattas', 'dupattas-shawls', 'shawls'):
                qs = qs.filter(Q(category__slug='artisanal-dupattas') | Q(name__icontains='dupatta') | Q(name__icontains='shawl'))
            elif category_slug in ('coords', 'co-ords', 'co-ord-sets'):
                qs = qs.filter(Q(category__slug='private-salon-coords') | Q(name__icontains='co-ord') | Q(name__icontains='set'))
            elif category_slug in ('jackets', 'capes', 'jackets-coats'):
                qs = qs.filter(Q(name__icontains='jacket') | Q(name__icontains='cape') | Q(description__icontains='overlay'))
            elif category_slug in ('lehengas', 'lehenga-cholis', 'anarkalis'):
                qs = qs.filter(Q(name__icontains='lehenga') | Q(name__icontains='anarkali') | Q(category__slug='festive-heirlooms'))
            else:
                qs = qs.filter(Q(category__slug=category_slug) | Q(category__parent__slug=category_slug))

        collection = self.request.query_params.get('collection')
        if collection:
            qs = qs.filter(collection_name__iexact=collection)

        # Price range preset or explicit min/max
        price_range = self.request.query_params.get('price_range')
        if price_range == 'under_5k':
            qs = qs.filter(base_price__lte=5000)
        elif price_range == '5k_to_10k':
            qs = qs.filter(base_price__gte=5000, base_price__lte=10000)
        elif price_range == '10k_to_20k':
            qs = qs.filter(base_price__gte=10000, base_price__lte=20000)
        elif price_range == 'above_20k':
            qs = qs.filter(base_price__gte=20000)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(base_price__gte=min_price)
        if max_price:
            qs = qs.filter(base_price__lte=max_price)

        size = self.request.query_params.get('size')
        if size:
            sizes = [s.strip() for s in size.split(',') if s.strip()]
            if len(sizes) == 1:
                qs = qs.filter(variants__size=sizes[0], variants__stock_quantity__gt=0).distinct()
            elif len(sizes) > 1:
                qs = qs.filter(variants__size__in=sizes, variants__stock_quantity__gt=0).distinct()

        color = self.request.query_params.get('color')
        if color:
            qs = qs.filter(variants__color_name__iexact=color, variants__stock_quantity__gt=0).distinct()

        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            qs = qs.filter(is_featured=True)

        new_arrival = self.request.query_params.get('new_arrival')
        if new_arrival and new_arrival.lower() in ('true', '1'):
            qs = qs.filter(is_new_arrival=True)

        on_sale = self.request.query_params.get('on_sale')
        if on_sale and on_sale.lower() in ('true', '1'):
            qs = qs.filter(sale_price__isnull=False, sale_price__gt=0)

        fabric = self.request.query_params.get('fabric')
        if fabric:
            qs = qs.filter(Q(fabric_and_care__icontains=fabric) | Q(description__icontains=fabric) | Q(name__icontains=fabric))

        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() in ('true', '1'):
            qs = qs.filter(variants__stock_quantity__gt=0).distinct()

        return qs


class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category').prefetch_related('images', 'variants').order_by('-created_at')
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AdminProductCreateUpdateSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False, methods=['post'], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_image(self, request):
        # Support both 'images' and 'image' keys, as single or multiple files
        files = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not files:
            file_obj = request.FILES.get('image') or request.FILES.get('file')
            if file_obj:
                files = [file_obj]

        if not files:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
        bucket_name = os.getenv('SUPABASE_STORAGE_BUCKET', 'products')

        supabase_client = None
        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                supabase_client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"[Supabase Storage Init Warning]: {e}")

        uploaded_results = []

        for file_obj in files:
            ext = os.path.splitext(file_obj.name)[1].lower() or '.jpg'
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            file_uploaded = False

            # 1. Attempt Supabase CDN Storage
            if supabase_client:
                try:
                    file_bytes = file_obj.read()
                    content_type = file_obj.content_type or 'image/jpeg'
                    supabase_client.storage.from_(bucket_name).upload(
                        path=unique_filename,
                        file=file_bytes,
                        file_options={'content-type': content_type, 'upsert': 'true'}
                    )
                    public_url = supabase_client.storage.from_(bucket_name).get_public_url(unique_filename)
                    uploaded_results.append({
                        'image_url': public_url,
                        'filename': file_obj.name,
                        'storage': 'supabase'
                    })
                    file_uploaded = True
                except Exception as e:
                    print(f"[Supabase Storage Upload Error for {file_obj.name}]: {e}")
                    file_obj.seek(0)

            # 2. Local media storage fallback
            if not file_uploaded:
                upload_dir = os.path.join(settings.MEDIA_ROOT, 'products')
                os.makedirs(upload_dir, exist_ok=True)
                save_path = os.path.join(upload_dir, unique_filename)

                with open(save_path, 'wb+') as destination:
                    for chunk in file_obj.chunks():
                        destination.write(chunk)

                media_url = f"/media/products/{unique_filename}"
                uploaded_results.append({
                    'image_url': media_url,
                    'filename': file_obj.name,
                    'storage': 'local'
                })

        return Response({
            'success': True,
            'image_url': uploaded_results[0]['image_url'] if uploaded_results else None,
            'filename': uploaded_results[0]['filename'] if uploaded_results else None,
            'images': uploaded_results,
            'count': len(uploaded_results),
            'storage': uploaded_results[0]['storage'] if uploaded_results else 'unknown'
        })
