from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant
from apps.inventory.models import Inventory

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'tagline', 'description', 'image_url', 'parent', 'display_order', 'is_active', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_primary', 'display_order']


class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'size', 'color_name', 'color_hex',
            'additional_price', 'stock_quantity', 'low_stock_threshold',
            'is_active', 'final_price', 'is_in_stock'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    primary_image = serializers.CharField(read_only=True)
    secondary_image = serializers.CharField(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    available_colors = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category_name', 'category_slug',
            'collection_name', 'base_price', 'sale_price', 'current_price',
            'discount_percent', 'short_description', 'is_featured', 'is_new_arrival',
            'primary_image', 'secondary_image', 'available_colors', 'available_sizes', 'total_stock'
        ]

    def get_available_colors(self, obj):
        variants = obj.variants.filter(is_active=True).values('color_name', 'color_hex').distinct()
        return list(variants)

    def get_available_sizes(self, obj):
        variants = obj.variants.filter(is_active=True, stock_quantity__gt=0).values_list('size', flat=True).distinct()
        return list(variants)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.CharField(read_only=True)
    secondary_image = serializers.CharField(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'collection_name',
            'base_price', 'sale_price', 'current_price', 'discount_percent',
            'short_description', 'description', 'fabric_and_care', 'fit_and_sizing',
            'shipping_and_returns', 'is_featured', 'is_new_arrival', 'is_active',
            'primary_image', 'secondary_image',
            'meta_title', 'meta_description', 'images', 'variants', 'total_stock', 'created_at'
        ]


class AdminProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(child=serializers.DictField(), required=False)
    variants = serializers.ListField(child=serializers.DictField(), required=False)

    class Meta:
        model = Product
        fields = '__all__'

    def to_representation(self, instance):
        return ProductDetailSerializer(instance, context=self.context).data

    def create(self, validated_data):
        images_data = self.context['request'].data.get('images', [])
        variants_data = self.context['request'].data.get('variants', [])
        validated_data.pop('images', None)
        validated_data.pop('variants', None)
        
        product = Product.objects.create(**validated_data)

        for idx, img in enumerate(images_data):
            if img.get('image_url'):
                ProductImage.objects.create(
                    product=product,
                    image_url=img.get('image_url'),
                    alt_text=img.get('alt_text', product.name),
                    is_primary=img.get('is_primary', idx == 0),
                    display_order=img.get('display_order', idx)
                )

        for var in variants_data:
            sku = var.get('sku') or f"{product.sku}-{var.get('size', 'M')}-{var.get('color_name', 'RAW')[:3].upper()}"
            v_obj, _ = ProductVariant.objects.update_or_create(
                product=product,
                size=var.get('size', 'M'),
                color_name=var.get('color_name', 'Ivory White'),
                defaults={
                    'sku': sku,
                    'color_hex': var.get('color_hex', '#F8F6F0'),
                    'additional_price': var.get('additional_price', 0),
                    'stock_quantity': var.get('stock_quantity', 10),
                    'is_active': var.get('is_active', True)
                }
            )
            Inventory.objects.get_or_create(variant=v_obj, defaults={'stock_quantity': v_obj.stock_quantity})

        return product

    def update(self, instance, validated_data):
        images_data = self.context['request'].data.get('images', None)
        variants_data = self.context['request'].data.get('variants', None)
        validated_data.pop('images', None)
        validated_data.pop('variants', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for idx, img in enumerate(images_data):
                if img.get('image_url'):
                    ProductImage.objects.create(
                        product=instance,
                        image_url=img.get('image_url'),
                        alt_text=img.get('alt_text', instance.name),
                        is_primary=img.get('is_primary', idx == 0),
                        display_order=img.get('display_order', idx)
                    )

        if variants_data is not None:
            submitted_ids = [str(v.get('id')) for v in variants_data if v.get('id')]
            if submitted_ids:
                instance.variants.exclude(id__in=submitted_ids).delete()
            else:
                instance.variants.all().delete()

            for var in variants_data:
                var_id = var.get('id')
                sku = var.get('sku') or f"{instance.sku}-{var.get('size', 'M')}-{var.get('color_name', 'RAW')[:3].upper()}"
                size = var.get('size', 'M')
                color_name = var.get('color_name', 'Ivory White')

                v_obj = None
                if var_id:
                    v_obj = ProductVariant.objects.filter(id=var_id, product=instance).first()
                if not v_obj:
                    v_obj = ProductVariant.objects.filter(product=instance, size=size, color_name=color_name).first()

                if v_obj:
                    v_obj.sku = sku
                    v_obj.size = size
                    v_obj.color_name = color_name
                    v_obj.color_hex = var.get('color_hex', v_obj.color_hex)
                    v_obj.additional_price = var.get('additional_price', v_obj.additional_price)
                    v_obj.stock_quantity = var.get('stock_quantity', v_obj.stock_quantity)
                    v_obj.is_active = var.get('is_active', v_obj.is_active)
                    v_obj.save()
                else:
                    v_obj = ProductVariant.objects.create(
                        product=instance,
                        sku=sku,
                        size=size,
                        color_name=color_name,
                        color_hex=var.get('color_hex', '#1A1817'),
                        additional_price=var.get('additional_price', 0),
                        stock_quantity=var.get('stock_quantity', 10),
                        is_active=var.get('is_active', True)
                    )
                inv, _ = Inventory.objects.get_or_create(variant=v_obj)
                inv.stock_quantity = v_obj.stock_quantity
                inv.save()

        return instance
