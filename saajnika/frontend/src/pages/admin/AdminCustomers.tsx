import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronRight, X, Phone, Mail, ShoppingBag, MapPin } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/date';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/customers/', {
        params: search ? { search } : {},
      });
      setCustomers(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    const handleUpdate = () => {
      fetchCustomers();
    };
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const openCustomerDrawer = async (cust: any) => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/auth/admin/customers/${cust.id}/`);
      setSelectedCustomer(res.data);
    } catch {
      alert('Could not fetch customer details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (custId: number) => {
    try {
      await api.post(`/auth/admin/customers/${custId}/toggle_status/`);
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.user.id === custId) {
        setSelectedCustomer((prev: any) => ({
          ...prev,
          user: { ...prev.user, is_active: !prev.user.is_active },
        }));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Patron Management
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817]">Customer Directory</h1>
        </div>
      </div>

      {/* Search */}
      <div className="flex bg-white p-4 border border-[#E8E2D9] max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-sans focus:outline-none"
        />
        <button
          onClick={fetchCustomers}
          className="bg-[#1A1817] text-white px-4 py-2 text-xs uppercase tracking-wider"
        >
          Search
        </button>
      </div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-2">
          <Users size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Registered Patrons</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            The customer directory is clean. Registered shoppers and checkout patron profiles will be listed here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] shadow-sm overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Loyalty Tier</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4">
                    <div className="font-medium text-[#1A1817]">{c.name}</div>
                    <div className="text-[11px] text-[#766F68]">{c.email}</div>
                  </td>
                  <td className="p-4">{c.phone || '—'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E2D9] text-[10px] uppercase text-[#966355]">
                      {c.loyalty_tier}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{c.total_orders}</td>
                  <td className="p-4 font-serif text-sm">₹{c.total_spend.toLocaleString()}</td>
                  <td className="p-4 text-[#766F68]">{c.date_joined}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-medium ${c.is_active ? 'bg-[#3D6B52]/10 text-[#3D6B52]' : 'bg-[#A43E38]/10 text-[#A43E38]'}`}>
                      {c.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openCustomerDrawer(c)}
                      className="text-[#966355] hover:underline font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className="text-xs text-[#766F68] hover:text-[#A43E38]"
                    >
                      {c.is_active ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-[#FAF8F5] p-8 overflow-y-auto space-y-6">
              
              <div className="flex justify-between items-start border-b border-[#E8E2D9] pb-4">
                <div>
                  <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] block">
                    Patron Profile
                  </span>
                  <h3 className="font-serif text-2xl text-[#1A1817]">
                    {selectedCustomer.user.first_name} {selectedCustomer.user.last_name}
                  </h3>
                  <div className="text-xs text-[#766F68] mt-0.5">{selectedCustomer.user.email}</div>
                </div>
                <button onClick={() => setSelectedCustomer(null)}><X size={18} /></button>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 border border-[#E8E2D9]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#766F68] block">Total Orders</span>
                  <span className="font-serif text-2xl text-[#1A1817]">{selectedCustomer.total_orders}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#766F68] block">Lifetime Value</span>
                  <span className="font-serif text-2xl text-[#1A1817]">₹{selectedCustomer.total_spend.toLocaleString()}</span>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-2">
                <h4 className="text-xs font-sans tracking-widest uppercase font-semibold text-[#1A1817]">
                  Delivery Addresses ({selectedCustomer.addresses?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.addresses?.map((addr: any) => (
                    <div key={addr.id} className="bg-white p-3 border border-[#E8E2D9] text-xs">
                      <div className="font-medium">{addr.full_name} ({addr.address_type})</div>
                      <p className="text-[#766F68] mt-0.5">
                        {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <div className="text-[11px] mt-1 text-[#231F1D]">{addr.phone}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-2">
                <h4 className="text-xs font-sans tracking-widest uppercase font-semibold text-[#1A1817]">
                  Recent Orders
                </h4>
                <div className="divide-y divide-[#E8E2D9] bg-white border border-[#E8E2D9]">
                  {selectedCustomer.recent_orders?.map((ord: any) => (
                    <div key={ord.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-mono font-medium">{ord.order_number}</div>
                        <div className="text-[10px] text-[#766F68]">{formatDate(ord.created_at, 'medium')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{Number(ord.total_amount).toLocaleString()}</div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#F5F1EB]">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
