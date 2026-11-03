import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, ChevronRight, Eye, AlertCircle } from 'lucide-react';
import api, { clearApiCache } from '../../services/api';
import { Order } from '../../types';
import { formatDate, formatDateTime } from '../../utils/date';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/orders/', { params });
      setOrders(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching admin orders', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders(true);
    };

    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    // Continuous 8-second polling to capture newly submitted client orders immediately
    const pollTimer = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      clearInterval(pollTimer);
    };
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      const res = await api.post(`/orders/${selectedOrder.order_number}/update_status/`, {
        status: newStatus,
        notes: statusNotes,
      });
      setSelectedOrder(res.data);
      clearApiCache();
      fetchOrders();
      setStatusNotes('');
      alert('Order status successfully updated.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="pb-4 border-b border-[#E8E2D9]">
        <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] font-medium block">
          Operations & Fulfillment
        </span>
        <h1 className="font-serif text-3xl text-[#1A1817]">Order Management</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-[#E8E2D9]">
        <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order # or Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#E8E2D9] px-3 py-2 text-xs font-sans focus:outline-none"
          />
          <button type="submit" className="bg-[#1A1817] text-white px-3 py-2 text-xs uppercase tracking-wider">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 text-xs font-sans w-full sm:w-auto">
          <span className="text-[#766F68] uppercase text-[10px] tracking-wider">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#E8E2D9] p-2 bg-white text-xs"
          >
            <option value="">All Orders</option>
            <option value="CREATED">Created</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-2">
          <CheckCircle2 size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Orders to Fulfill</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            The fulfillment queue is clean. Live orders and shipping logistics will populate here immediately upon customer checkout.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] shadow-sm overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                <th className="p-4">Order ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Placed</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4 font-mono font-medium text-[#1A1817]">{ord.order_number}</td>
                  <td className="p-4">{ord.customer_name || 'Guest'}</td>
                  <td className="p-4 text-[#766F68]">{ord.shipping_address?.city}, {ord.shipping_address?.state}</td>
                  <td className="p-4 font-medium">₹{Number(ord.total_amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-medium ${
                      ord.status === 'DELIVERED' ? 'bg-[#3D6B52]/10 text-[#3D6B52]' :
                      ord.status === 'CANCELLED' ? 'bg-[#A43E38]/10 text-[#A43E38]' :
                      'bg-[#966355]/10 text-[#966355]'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#766F68] whitespace-nowrap">
                    {formatDateTime(ord.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setNewStatus(ord.status);
                      }}
                      className="text-[#966355] hover:underline font-medium flex items-center space-x-1 ml-auto"
                    >
                      <span>Manage</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-[#FAF8F5] max-w-2xl w-full p-8 border border-[#E8E2D9] shadow-2xl space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-[#E8E2D9]">
                <div>
                  <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] block">
                    Order Details
                  </span>
                  <h3 className="font-mono text-2xl text-[#1A1817] font-semibold">{selectedOrder.order_number}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-xs">Close</button>
              </div>

              {/* Items in this order */}
              <div className="space-y-2">
                <h4 className="text-xs font-sans tracking-wider uppercase font-semibold text-[#1A1817]">Items Ordered</h4>
                <div className="divide-y divide-[#E8E2D9] bg-white p-3 border border-[#E8E2D9]">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between text-xs font-sans">
                      <div>
                        <span className="font-medium text-[#1A1817]">{item.product_name}</span>
                        <div className="text-[11px] text-[#766F68]">{item.size} • {item.color} • Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium">₹{Number(item.total_price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status Form */}
              <div className="bg-white p-4 border border-[#E8E2D9] space-y-3">
                <h4 className="text-xs font-sans tracking-wider uppercase font-semibold text-[#1A1817]">
                  Transition Fulfillment Phase
                </h4>
                <div className="flex gap-4 items-center">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-[#E8E2D9] p-2 text-xs bg-white w-1/2"
                  >
                    <option value="CREATED">CREATED</option>
                    <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-5 py-2 hover:bg-[#966355] disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Internal audit note (e.g. Courier tracking assigned)"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full border border-[#E8E2D9] p-2 text-xs bg-white mt-2"
                />
              </div>

              {/* Shipping address details */}
              <div className="text-xs font-sans text-[#766F68] space-y-1">
                <strong>Recipient: </strong> {selectedOrder.shipping_address?.full_name} ({selectedOrder.shipping_address?.phone})<br />
                {selectedOrder.shipping_address?.address_line1}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
