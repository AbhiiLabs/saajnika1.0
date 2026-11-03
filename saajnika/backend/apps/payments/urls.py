from django.urls import path
from .views import RazorpayPaymentView, RazorpayVerifyView, RazorpayWebhookView

urlpatterns = [
    path('razorpay/create/', RazorpayPaymentView.as_view(), name='razorpay-create'),
    path('razorpay/verify/', RazorpayVerifyView.as_view(), name='razorpay-verify'),
    path('razorpay/webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
]
