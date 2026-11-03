import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, CheckCircle2, Clock, Truck, Package, Check,
  AlertCircle, ArrowRight, CornerDownLeft
} from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { formatDate } from '../utils/date';
import { optimizeImageUrl } from '../utils/image';

const TIMELINE_STEPS = [
  { key: 'CREATED', label: 'Order Placed' },
  { key: 'PAID', label: 'Payment Verified' },
  { key: 'PROCESSING', label: 'Tailored at Atelier' },
  { key: 'PACKED', label: 'Heirloom Packaged' },
  { key: 'SHIPPED', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrder = searchParams.get('order') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(queryOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrderDetails = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await api.get(`/orders/${num.trim()}/`);
      setOrder(res.data);
    } catch (err: any) {
      // In case guest lookup requires track_order endpoint
      try {
        const guestRes = await api.post(`/orders/${num.trim()}/track_order/`);
        setOrder(guestRes.data);
      } catch {
        setError('No order found with this identifier. Please verify and try again.');
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrder) {
      setOrderNumberInput(queryOrder);
      fetchOrderDetails(queryOrder);
    }
  }, [queryOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ order: orderNumberInput.trim() });
      fetchOrderDetails(orderNumberInput.trim());
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you wish to cancel this atelier order?')) return;
    try {
      const res = await api.post(`/orders/${order.order_number}/cancel_order/`, {
        reason: 'Customer initiated cancellation from tracking page',
      });
      setOrder(res.data);
      setActionSuccess('Order successfully cancelled.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cancellation request could not be completed.');
    }
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderOfStates = ['CREATED', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = orderOfStates.indexOf(currentStatus);
    const stepIndex = orderOfStates.indexOf(stepKey);

    if (currentStatus === 'CANCELLED') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Client Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal">
            Atelier Dispatch & Order Tracking
          </h1>
          <p className="text-xs font-sans text-[#766F68]">
            Enter your unique Saajnika Order Identifier (e.g. SJ-XXXXXX) to monitor real-time fulfillment.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex mb-12 shadow-sm">
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            placeholder="Enter Order # (e.g. SJ-XXXXXX)"
            className="w-full bg-white border border-[#E8E2D9] px-4 py-3 text-xs uppercase font-sans focus:outline-none focus:border-[#1A1817]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1A1817] text-white text-[11px] font-sans tracking-[0.16em] uppercase px-6 py-3 hover:bg-[#966355] transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-[#A43E38]/10 border border-[#A43E38]/20 text-[#A43E38] text-xs font-sans mb-8 text-center">
            {error}
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 bg-[#3D6B52]/10 border border-[#3D6B52]/20 text-[#3D6B52] text-xs font-sans mb-8 text-center">
            {actionSuccess}
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="bg-white border border-[#E8E2D9] p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D9] gap-4">
              <div>
                <span className="text-[10px] font-sans tracking-widest text-[#766F68] uppercase block">Order Identifier</span>
                <h2 className="font-mono text-xl sm:text-2xl text-[#1A1817] font-semibold">{order.order_number}</h2>
                <span className="text-xs font-sans text-[#766F68]">
                  Placed on {formatDate(order.created_at, 'long')}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-sans tracking-widest text-[#766F68] uppercase block">Current Phase</span>
                <span className={`inline-block mt-1 px-3 py-1 text-xs font-sans tracking-wider uppercase font-medium ${
                  order.status === 'CANCELLED'
                    ? 'bg-[#A43E38]/10 text-[#A43E38]'
                    : order.status === 'DELIVERED'
                    ? 'bg-[#3D6B52]/10 text-[#3D6B52]'
                    : 'bg-[#966355]/10 text-[#966355]'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Timeline Bar */}
            {order.status !== 'CANCELLED' ? (
              <div className="py-6">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const status = getStepStatus(step.key, order.status);
                    return (
                      <div key={step.key} className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans transition-all ${
                          status === 'completed'
                            ? 'bg-[#1A1817] text-white'
                            : 'bg-[#F5F1EB] text-[#766F68] border border-[#E8E2D9]'
                        }`}>
                          {status === 'completed' ? <Check size={14} /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-sans ${status === 'completed' ? 'font-medium text-[#1A1817]' : 'text-[#766F68]'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#A43E38]/10 border border-[#A43E38]/20 text-xs font-sans text-[#A43E38] text-center">
                This order was cancelled. {order.cancel_reason && `Reason: ${order.cancel_reason}`}
              </div>
            )}

            {/* Items Purchased List */}
            <div className="pt-6 border-t border-[#E8E2D9] space-y-4">
              <h4 className="text-xs font-sans tracking-[0.2em] uppercase text-[#1A1817] font-semibold">
                Silhouettes in This Shipment
              </h4>
              <div className="divide-y divide-[#E8E2D9]">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center space-x-3">
                      {item.image_url && (
                        <img
                          src={optimizeImageUrl(item.image_url, 120, 75)}
                          alt=""
                          className="w-12 h-16 object-cover border border-[#E8E2D9]"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div>
                        <div className="font-serif text-sm text-[#1A1817]">{item.product_name}</div>
                        <div className="text-[11px] text-[#766F68]">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-[#1A1817]">
                      ₹{Number(item.total_price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frozen Address & Financial Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#E8E2D9] text-xs font-sans">
              <div>
                <h5 className="text-[10px] tracking-widest uppercase text-[#766F68] font-semibold mb-2">
                  Destination Address
                </h5>
                <p className="text-[#231F1D] leading-relaxed">
                  {order.shipping_address?.full_name}<br />
                  {order.shipping_address?.address_line1}<br />
                  {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}<br />
                  Phone: {order.shipping_address?.phone}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] tracking-widest uppercase text-[#766F68] font-semibold mb-2">
                  Payment Summary
                </h5>
                <div className="space-y-1 text-[#766F68]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-[#966355]">
                      <span>Privilege Discount:</span>
                      <span>-₹{Number(order.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Courier Transit:</span>
                    <span>{Number(order.shipping_fee) === 0 ? 'Complimentary' : `₹${order.shipping_fee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif text-[#1A1817] pt-2 border-t border-[#E8E2D9]">
                    <span>Total Amount:</span>
                    <span>₹{Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligible Actions (Cancel, Return) */}
            {['CREATED', 'PAYMENT_PENDING', 'PAID'].includes(order.status) && (
              <div className="pt-6 border-t border-[#E8E2D9] flex justify-end">
                <button
                  onClick={handleCancelOrder}
                  className="text-xs font-sans text-[#A43E38] hover:underline"
                >
                  Request Order Cancellation
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
