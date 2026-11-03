import uuid
from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    tagline = models.CharField(max_length=255, blank=True, null=True, help_text="Editorial phrase for collections")
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    collection_name = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Winter Solstice, Chanderi Edit")

    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    short_description = models.CharField(max_length=350, help_text="Brief editorial summary")
    description = models.TextField(help_text="Detailed craftsmanship & story")
    fabric_and_care = models.TextField(blank=True, null=True, help_text="Textile composition and care advice")
    fit_and_sizing = models.TextField(blank=True, null=True, help_text="Fit guidance, model stats")
    shipping_and_returns = models.TextField(blank=True, null=True, help_text="Dispatch timeline and returns policy")

    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.CharField(max_length=300, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        return self.sale_price if self.sale_price is not None else self.base_price

    @property
    def discount_percent(self):
        if self.sale_price and self.base_price > self.sale_price:
            return round(((self.base_price - self.sale_price) / self.base_price) * 100)
        return 0

    @property
    def primary_image(self):
        primary = self.images.filter(is_primary=True).first()
        if not primary:
            primary = self.images.first()
        return primary.image_url if primary else None

    @property
    def secondary_image(self):
        images = list(self.images.all()[:2])
        if len(images) > 1:
            return images[1].image_url
        return self.primary_image

    @property
    def total_stock(self):
        return sum(v.stock_quantity for v in self.variants.filter(is_active=True))

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.CharField(max_length=600)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_primary', 'display_order']

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductVariant(models.Model):
    class Size(models.TextChoices):
        XS = 'XS', 'XS (32)'
        S = 'S', 'S (34)'
        M = 'M', 'M (36)'
        L = 'L', 'L (38)'
        XL = 'XL', 'XL (40)'
        XXL = 'XXL', 'XXL (42)'
        FREE = 'FREE', 'One Size / Free Size'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True)
    size = models.CharField(max_length=20, choices=Size.choices, default=Size.M)
    color_name = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=20, default='#1A1817')
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.PositiveIntegerField(default=10)
    low_stock_threshold = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'size', 'color_name')
        ordering = ['size', 'color_name']

    @property
    def final_price(self):
        return self.product.current_price + self.additional_price

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    def __str__(self):
        return f"{self.product.name} - {self.size} / {self.color_name} (Stock: {self.stock_quantity})"
