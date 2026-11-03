import uuid
from django.db import models

class HomepageBanner(models.Model):
    class BannerType(models.TextChoices):
        HERO = 'HERO', 'Hero Main Editorial'
        EDITORIAL = 'EDITORIAL', 'Editorial Story & Craft'
        FEATURED_GRID = 'FEATURED_GRID', 'Featured Grid Tile'
        ANNOUNCEMENT = 'ANNOUNCEMENT', 'Top Announcement Bar'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    banner_type = models.CharField(max_length=30, choices=BannerType.choices, default=BannerType.HERO)
    kicker = models.CharField(max_length=100, blank=True, null=True, help_text="Small uppercase label, e.g. 'COLLECTION 04 / WINTER SOLSTICE'")
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, null=True)
    cta_text = models.CharField(max_length=100, default='DISCOVER THE EDIT')
    cta_link = models.CharField(max_length=255, default='/shop')
    image_url = models.URLField(max_length=600)
    secondary_image_url = models.URLField(max_length=600, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"[{self.banner_type}] {self.title}"


class StoreSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"


class NewsletterSubscriber(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email
