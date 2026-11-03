import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, Check, ArrowRight, Lock, MapPin, CreditCard,
  Truck, Tag, AlertCircle
} from 'lucide-react';
import api, { clearApiCache } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { optimizeImageUrl } from '../utils/image';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { user, addresses, addAddress, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [addressForm, setAddressForm] = useState<Address>({
    full_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    address_type: 'HOME',
  });

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [customerNotes, setCustomerNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      if (def?.id) {
        setSelectedAddressId(def.id);
        setAddressForm(def);
      }
    }
  }, [addresses]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl text-[#1A1817]">Your shopping bag is empty</h2>
        <p className="text-xs font-sans text-[#766F68] mt-2">
          Please add silhouettes to your shopping bag before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  const handleAddressSelect = (addr: Address) => {
    if (addr.id) {
      setSelectedAddressId(addr.id);
      setAddressForm(addr);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    const res = await applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.error || 'Invalid code');
    }
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    setCheckoutError('');

    try {
      // Step 1: Create Order atomically on backend
      const orderPayload = {
        shipping_address: {
          ...addressForm,
          email: user?.email || 'guest@saajnika.com',
        },
        items: items.map((i) => ({
          variant_id: i.variant,
          quantity: i.quantity,
        })),
        coupon_code: coupon?.code || null,
        customer_notes: customerNotes,
      };

      const orderRes = await api.post('/orders/create_checkout_order/', orderPayload);
      const createdOrder = orderRes.data;

      // Step 2: Handle Payment
      if (paymentMethod === 'RAZORPAY') {
        // Create Razorpay Order
        const rzpRes = await api.post('/payments/razorpay/create/', {
          order_number: createdOrder.order_number,
        });

        // Trigger Sandbox verification / mock signature in dev or Razorpay checkout
        const verifyRes = await api.post('/payments/razorpay/verify/', {
          order_number: createdOrder.order_number,
          razorpay_order_id: rzpRes.data.razorpay_order_id,
          razorpay_payment_id: `pay_${Date.now().toString(36)}`,
          razorpay_signature: 'sandbox_mock_signature',
        });

        if (verifyRes.data.verified) {
          clearApiCache();
          await clearCart();
          navigate(`/order-confirmation/${createdOrder.order_number}`);
          return;
        }
      } else {
        // Cash on delivery
        clearApiCache();
        await clearCart();
        navigate(`/order-confirmation/${createdOrder.order_number}`);
        return;
      }
    } catch (err: any) {
      setCheckoutError(err.response?.data?.error || 'Order processing failed. Please check variant stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Header */}
        <div className="text-center mb-10 pb-6 border-b border-[#E8E2D9]">
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
            Private Boutique Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal mt-1">
            Secure Delivery & Order Details
          </h1>
          <div className="flex items-center justify-center space-x-2 text-[11px] font-sans text-[#766F68] mt-2">
            <Lock size={12} className="text-[#3D6B52]" />
            <span>256-Bit SSL Encrypted Transaction</span>
          </div>
        </div>

        {checkoutError && (
          <div className="mb-6 p-4 bg-[#A43E38]/10 border border-[#A43E38]/20 text-[#A43E38] text-xs font-sans flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{checkoutError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left 7 Columns: Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Address Section */}
            <div className="bg-white p-6 sm:p-8 border border-[#E8E2D9]">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9] mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1A1817] text-white text-[10px] font-sans flex items-center justify-center">1</span>
                  <h3 className="font-serif text-xl text-[#1A1817]">Delivery Address</h3>
                </div>
                {isAuthenticated && addresses.length > 0 && (
                  <button
                    onClick={() => setSelectedAddressId('new')}
                    className="text-xs font-sans text-[#966355] hover:underline"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses Picker */}
              {isAuthenticated && addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr)}
                      className={`p-3.5 border cursor-pointer text-xs font-sans transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#1A1817] bg-[#F5F1EB]'
                          : 'border-[#E8E2D9] hover:border-[#966355]'
                      }`}
                    >
                      <div className="flex justify-between items-start font-medium text-[#1A1817]">
                        <span>{addr.full_name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#966355]">{addr.address_type}</span>
                      </div>
                      <p className="text-[#766F68] mt-1 line-clamp-2">
                        {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <div className="mt-1 text-[#231F1D]">{addr.phone}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Address Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="sm:col-span-2">
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>

                <div>
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>

                <div>
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    House / Flat No., Building, Street *
                  </label>
                  <input
                    type="text"
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>

                <div>
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>

                <div>
                  <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
                  />
                </div>
              </div>

              {/* Special Atelier Tailoring / Delivery Instruction */}
              <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
                <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                  Atelier Notes or Sizing Requests (Optional)
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please leave at door, request 1-inch extra sleeve margin..."
                  className="w-full border border-[#E8E2D9] p-2.5 text-xs font-sans focus:outline-none focus:border-[#1A1817]"
                />
              </div>

            </div>

            {/* 2. Payment Method Section */}
            <div className="bg-white p-6 sm:p-8 border border-[#E8E2D9]">
              <div className="flex items-center space-x-2 pb-4 border-b border-[#E8E2D9] mb-6">
                <span className="w-5 h-5 rounded-full bg-[#1A1817] text-white text-[10px] font-sans flex items-center justify-center">2</span>
                <h3 className="font-serif text-xl text-[#1A1817]">Payment Gateway</h3>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-[#1A1817] bg-[#F5F1EB]'
                      : 'border-[#E8E2D9] hover:border-[#966355]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="accent-[#1A1817]"
                    />
                    <div>
                      <span className="text-sm font-sans font-medium text-[#1A1817] block">
                        Razorpay Secure Gateway
                      </span>
                      <span className="text-xs font-sans text-[#766F68]">
                        Credit/Debit Card, Netbanking, UPI, Cred & EMI
                      </span>
                    </div>
                  </div>
                  <CreditCard size={20} className="text-[#766F68]" />
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#1A1817] bg-[#F5F1EB]'
                      : 'border-[#E8E2D9] hover:border-[#966355]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#1A1817]"
                    />
                    <div>
                      <span className="text-sm font-sans font-medium text-[#1A1817] block">
                        Cash on Delivery
                      </span>
                      <span className="text-xs font-sans text-[#766F68]">
                        Pay at your doorstep upon courier handover
                      </span>
                    </div>
                  </div>
                  <Truck size={20} className="text-[#766F68]" />
                </label>
              </div>

            </div>

          </div>

          {/* Right 5 Columns: Order Summary & Confirmation */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 border border-[#E8E2D9] space-y-6">
              
              <h3 className="font-serif text-xl text-[#1A1817] pb-3 border-b border-[#E8E2D9]">
                Order Summary ({items.length} items)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#E8E2D9] max-h-72 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex space-x-3">
                    <img
                      src={optimizeImageUrl(item.primary_image, 140, 75)}
                      alt={item.product_name}
                      className="w-14 h-18 object-cover bg-[#F5F1EB] border border-[#E8E2D9]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1 text-xs font-sans">
                      <h4 className="font-serif text-sm text-[#1A1817] line-clamp-1">{item.product_name}</h4>
                      <div className="text-[11px] text-[#766F68] mt-0.5">
                        {item.size} • {item.color_name} • Qty: {item.quantity}
                      </div>
                      <div className="mt-1 font-medium text-[#1A1817]">
                        ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privilege Coupon Input */}
              <div className="pt-4 border-t border-[#E8E2D9]">
                {coupon ? (
                  <div className="bg-[#F5F1EB] p-3 flex items-center justify-between text-xs font-sans border border-[#E8E2D9]">
                    <div className="flex items-center space-x-2">
                      <Tag size={14} className="text-[#966355]" />
                      <span>Code <strong>{coupon.code}</strong> applied (-₹{discountAmount})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-[#A43E38] hover:underline text-[11px]">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Privilege Code (e.g. SAAJNIKA10)"
                      className="w-full border border-[#E8E2D9] p-2.5 text-xs font-sans uppercase focus:outline-none focus:border-[#1A1817]"
                    />
                    <button
                      type="submit"
                      className="bg-[#1A1817] text-white text-[10px] font-sans tracking-widest uppercase px-4 py-2.5 hover:bg-[#966355] transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-[#A43E38] font-sans mt-1">{couponError}</p>}
              </div>

              {/* Price Calculation Table */}
              <div className="space-y-2 text-xs font-sans text-[#766F68] pt-4 border-t border-[#E8E2D9]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#231F1D] font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#966355]">
                    <span>Atelier Privilege</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Express Courier</span>
                  <span className="text-[#231F1D]">
                    {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-serif text-[#1A1817] pt-3 border-t border-[#E8E2D9]">
                  <span>Total Payable</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                onClick={handleCompleteOrder}
                disabled={loading || !addressForm.full_name || !addressForm.pincode || !addressForm.address_line1}
                className="w-full bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-4 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Processing Order...' : `Pay ₹${finalTotal.toLocaleString()}`}</span>
                <ArrowRight size={14} />
              </button>

              <div className="text-[11px] text-[#766F68] font-sans text-center space-y-1">
                <p>Protected by Saajnika 7-Day Doorstep Exchange Policy.</p>
                <p>Authentic handloom textiles carrying verified Silk Mark provenance.</p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
