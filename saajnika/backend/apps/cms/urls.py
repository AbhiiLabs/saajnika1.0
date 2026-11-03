from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HomepageBannerViewSet, StoreSettingViewSet, NewsletterSubscribeView

router = DefaultRouter()
router.register(r'banners', HomepageBannerViewSet, basename='banner')
router.register(r'settings', StoreSettingViewSet, basename='setting')

urlpatterns = [
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('', include(router.urls)),
]
