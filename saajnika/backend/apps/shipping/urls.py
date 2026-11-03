from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PincodeCheckView, ShipmentViewSet

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipment')

urlpatterns = [
    path('pincode/<str:pincode>/', PincodeCheckView.as_view(), name='pincode-check'),
    path('', include(router.urls)),
]
