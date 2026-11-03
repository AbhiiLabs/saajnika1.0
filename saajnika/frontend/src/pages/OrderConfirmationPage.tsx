import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { formatDate, getEstimatedDeliveryString } from '../utils/date';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderNumber}/`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Card */}
        <div className="bg-white p-8 sm:p-12 border border-[#E8E2D9] text-center shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#3D6B52]/10 rounded-full flex items-center justify-center text-[#3D6B52] mx-auto">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>

          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
              Order Confirmed & Atelier Dispatched
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal mt-1">
              Thank You for Your Patronage
            </h1>
            <p className="text-xs font-sans text-[#766F68] mt-2">
              Order Identifier: <strong className="font-mono text-[#1A1817] text-sm">{orderNumber}</strong>
            </p>
          </div>

          <p className="text-xs sm:text-sm font-sans text-[#766F68] max-w-lg mx-auto leading-relaxed">
            Your silhouette is being carefully prepared in our New Delhi atelier. A confirmation invoice with real-time transit tracking updates has been dispatched to your email.
          </p>

          {/* Snapshot Summary */}
          {order && (
            <div className="border-t border-b border-[#E8E2D9] py-6 text-left space-y-4">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#766F68]">Order Date:</span>
                <span className="font-medium text-[#1A1817]">{formatDate(order.created_at, 'full')}</span>
              </div>
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#766F68]">Estimated Transit Arrival:</span>
                <span className="font-medium text-[#3D6B52] flex items-center gap-1.5">
                  <Truck size={14} /> By {getEstimatedDeliveryString(3)} (Complimentary Express)
                </span>
              </div>
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#766F68]">Fulfillment Phase:</span>
                <span className="font-medium text-[#3D6B52] uppercase tracking-wider">{order.status}</span>
              </div>
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#766F68]">Total Paid:</span>
                <span className="font-medium text-[#1A1817]">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs font-sans text-[#766F68]">
                <span>Shipping Destination: </span>
                <span className="text-[#231F1D]">
                  {order.shipping_address?.full_name}, {order.shipping_address?.address_line1}, {order.shipping_address?.city} - {order.shipping_address?.pincode}
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/orders/track?order=${orderNumber}`}
              className="w-full sm:w-auto bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-[#966355] transition-colors"
            >
              Track Atelier Shipment
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto border border-[#E8E2D9] text-[#231F1D] text-xs font-sans tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-[#F5F1EB] transition-colors"
            >
              Continue Exploring
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
