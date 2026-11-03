import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { optimizeImageUrl } from '../../utils/image';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    subtotal,
    totalItems,
    updateQuantity,
    removeItem,
    freeShippingProgress,
    shippingFee,
    discountAmount,
    finalTotal,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon');
    } else {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1817]/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8E2D9] shadow-2xl flex flex-col animate-fade-in-up transition-all duration-300">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#E8E2D9] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl text-[#1A1817] font-normal">Shopping Bag</span>
              <span className="text-xs font-sans text-[#766F68]">({totalItems} items)</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#231F1D] hover:text-[#966355] transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Complimentary Courier Progress Bar */}
          <div className="bg-[#F5F1EB] px-6 py-3 border-b border-[#E8E2D9]">
            <div className="flex justify-between text-[11px] font-sans text-[#231F1D] mb-1.5">
              <span>
                {subtotal >= 3999 ? (
                  <span className="text-[#3D6B52] font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} /> You have unlocked complimentary express delivery
                  </span>
                ) : (
                  <span>Add ₹{(3999 - subtotal).toLocaleString('en-IN')} more for complimentary delivery</span>
                )}
              </span>
              <span className="font-medium text-[#966355]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#E8E2D9] h-1.5 rounded-none overflow-hidden">
              <div
                className="bg-[#966355] h-full transition-all duration-700 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5F1EB] flex items-center justify-center text-[#766F68] mb-4">
                  <ShoppingBag size={28} strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-2xl text-[#1A1817]">Your bag is empty</h4>
                <p className="text-xs font-sans text-[#766F68] max-w-xs mt-2">
                  Discover our thoughtfully curated silhouettes crafted from pure chanderi and fine handloom silks.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/shop');
                  }}
                  className="mt-6 bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase px-6 py-3 hover:bg-[#966355] transition-colors"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 py-4 border-b border-[#E8E2D9] last:border-b-0"
                >
                  <img
                    src={optimizeImageUrl(item.primary_image, 160, 75)}
                    alt={item.product_name}
                    className="w-20 h-26 object-cover bg-[#F5F1EB] border border-[#E8E2D9]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-base text-[#1A1817] font-normal leading-snug">
                          {item.product_name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#766F68] hover:text-[#A43E38] p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="text-[11px] font-sans text-[#766F68] mt-1 space-x-2">
                        <span>Size: <strong className="text-[#231F1D]">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#231F1D]">{item.color_name}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E8E2D9] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-[#231F1D] hover:bg-[#F5F1EB] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-sans font-medium text-[#231F1D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-[#231F1D] hover:bg-[#F5F1EB] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <span className="font-sans text-sm font-medium text-[#231F1D]">
                        ₹{(Number(item.unit_price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Coupon & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E2D9] bg-white space-y-4">
              
              {/* Coupon Section */}
              {coupon ? (
                <div className="bg-[#F5F1EB] p-3 flex items-center justify-between text-xs font-sans border border-[#E8E2D9]">
                  <div className="flex items-center space-x-2">
                    <Tag size={14} className="text-[#966355]" />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-₹{discountAmount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-[#A43E38] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Privilege Code (e.g. SAAJNIKA10)"
                      className="w-full border border-[#E8E2D9] px-3 py-2 text-xs uppercase font-sans placeholder-[#766F68] focus:outline-none focus:border-[#1A1817]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-[#1A1817] text-[#FAF8F5] text-[10px] font-sans tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#966355] transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-[#A43E38] font-sans">{couponError}</p>
                  )}
                </form>
              )}

              {/* Order Calculations */}
              <div className="space-y-2 text-xs font-sans text-[#766F68] pt-2 border-t border-[#E8E2D9]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#231F1D] font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#966355]">
                    <span>Atelier Privilege Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Courier Transit</span>
                  <span className="text-[#231F1D]">
                    {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif text-[#1A1817] pt-2 border-t border-[#E8E2D9]">
                  <span>Estimated Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-4 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={14} />
              </button>

              <p className="text-[10px] text-center text-[#766F68] font-sans">
                Taxes included. Complies with Saajnika 7-day exchange guarantee.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
