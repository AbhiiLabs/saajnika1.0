import React, { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingBag, AlertTriangle, Users, DollarSign,
  ArrowUpRight, Clock, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid
} from 'recharts';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard/');
        setData(res.data);
      } catch (err) {
        // Fallback clean zero metrics if API is temporarily unavailable
        setData({
          total_revenue: 0,
          total_orders: 0,
          pending_orders: 0,
          delivered_orders: 0,
          total_customers: 0,
          active_products: 0,
          low_stock_variants: 0,
          out_of_stock_variants: 0,
          revenue_trend: [],
          status_distribution: [],
          recent_orders: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    const handleUpdate = () => {
      fetchAnalytics();
    };

    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    const pollTimer = setInterval(fetchAnalytics, 15000);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(pollTimer);
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-xs font-sans text-[#766F68]">Loading Atelier analytics...</div>;
  }

  const metrics = [
    {
      label: 'Total Revenue',
      val: `₹${Number(data?.total_revenue || 0).toLocaleString()}`,
      sub: 'Authoritative server verified',
      icon: DollarSign,
      color: 'text-[#3D6B52]',
    },
    {
      label: 'Total Orders',
      val: data?.total_orders || 0,
      sub: `${data?.pending_orders || 0} pending processing`,
      icon: ShoppingBag,
      color: 'text-[#1A1817]',
    },
    {
      label: 'Active Silhouettes',
      val: data?.active_products || 0,
      sub: 'Published in digital store',
      icon: TrendingUp,
      color: 'text-[#966355]',
    },
    {
      label: 'Low Stock Alerts',
      val: data?.low_stock_variants || 0,
      sub: 'Requires atelier replenishment',
      icon: AlertTriangle,
      color: 'text-[#A43E38]',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
          Executive Overview
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal mt-1">
          Atelier Performance Dashboard
        </h1>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 border border-[#E8E2D9] shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-sans tracking-wider uppercase text-[#766F68]">{m.label}</span>
                <Icon size={18} className={m.color} strokeWidth={1.5} />
              </div>
              <div className="mt-4">
                <div className="font-serif text-3xl text-[#1A1817]">{m.val}</div>
                <div className="text-[11px] font-sans text-[#766F68] mt-1">{m.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 border border-[#E8E2D9] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif text-xl text-[#1A1817]">Revenue Trajectory (INR)</h3>
              <p className="text-xs font-sans text-[#766F68]">Actual reconciled purchases over 30-day window</p>
            </div>
          </div>
          {data?.revenue_trend && data.revenue_trend.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#966355" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#966355" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F1EB" />
                  <XAxis dataKey="date" stroke="#766F68" fontSize={11} tickLine={false} />
                  <YAxis stroke="#766F68" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#1A1817', color: '#FAF8F5', border: 'none', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#966355" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-[#E8E2D9] p-6 text-center">
              <span className="font-serif text-lg text-[#1A1817]">No Reconciled Sales Yet</span>
              <p className="text-xs font-sans text-[#766F68] mt-1.5 max-w-sm">
                Your boutique revenue curve will be plotted automatically as patrons complete checkouts.
              </p>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 border border-[#E8E2D9] shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-xl text-[#1A1817]">Order Statuses</h3>
            <p className="text-xs font-sans text-[#766F68]">Distribution across lifecycle</p>
          </div>
          {data?.status_distribution && data.status_distribution.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.status_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F1EB" />
                  <XAxis dataKey="status" stroke="#766F68" fontSize={9} />
                  <YAxis stroke="#766F68" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1817', color: '#FAF8F5', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#1A1817" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-[#E8E2D9] p-6 text-center">
              <span className="font-serif text-base text-[#1A1817]">0 Orders in Queue</span>
              <p className="text-xs font-sans text-[#766F68] mt-1.5">Lifecycle status distribution is currently clean.</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[#E8E2D9]">
          <h3 className="font-serif text-xl text-[#1A1817]">Recent Atelier Orders</h3>
          <span className="text-xs font-sans text-[#766F68]">Live database updates</span>
        </div>

        {data?.recent_orders && data.recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px]">
                  <th className="py-3">Order ID</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Placed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {data.recent_orders.map((ord: any) => (
                  <tr key={ord.order_number} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-mono font-medium text-[#1A1817]">{ord.order_number}</td>
                    <td className="py-3">{ord.customer}</td>
                    <td className="py-3 font-medium">₹{Number(ord.amount).toLocaleString()}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#F5F1EB] text-[#1A1817]">
                        {ord.status_display || ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#766F68]">{ord.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-[#E8E2D9]">
            <span className="font-serif text-lg text-[#1A1817] block">No Orders Placed Yet</span>
            <p className="text-xs font-sans text-[#766F68] mt-1 max-w-sm mx-auto">
              Your store is clean and ready. Customer orders will appear here immediately upon checkout.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
