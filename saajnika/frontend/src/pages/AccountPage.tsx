import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Plus, Check, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Order, Address } from '../types';
import { formatDate } from '../utils/date';
import { optimizeImageUrl } from '../utils/image';

export const AccountPage: React.FC = () => {
  const { user, logout, addresses, addAddress, fetchAddresses } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({
    full_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone || '',
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'HOME',
    is_default: false,
  });

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await api.get('/orders/');
        setOrders(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to fetch user orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addAddress(newAddr);
    if (success) {
      setShowAddAddress(false);
      setNewAddr({
        full_name: '',
        phone: '',
        address_line1: '',
        city: '',
        state: '',
        pincode: '',
        address_type: 'HOME',
      });
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Welcome Banner */}
        <div className="bg-white border border-[#E8E2D9] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
              Private Client Salon
            </span>
            <h1 className="font-serif text-3xl text-[#1A1817] font-normal">
              Greetings, {user?.first_name || 'Valued Patron'}
            </h1>
            <p className="text-xs font-sans text-[#766F68] mt-1">
              {user?.email} • {user?.profile?.loyalty_tier || 'Atelier Connoisseur'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-xs font-sans text-[#A43E38] hover:underline"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D9] mb-8 text-xs font-sans uppercase tracking-[0.16em]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 transition-colors relative ${
              activeTab === 'orders'
                ? 'font-semibold text-[#1A1817] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1817]'
                : 'text-[#766F68] hover:text-[#1A1817]'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-4 transition-colors relative ${
              activeTab === 'addresses'
                ? 'font-semibold text-[#1A1817] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1817]'
                : 'text-[#766F68] hover:text-[#1A1817]'
            }`}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 transition-colors relative ${
              activeTab === 'profile'
                ? 'font-semibold text-[#1A1817] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1817]'
                : 'text-[#766F68] hover:text-[#1A1817]'
            }`}
          >
            Account Details
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="p-8 text-center text-xs font-sans text-[#766F68]">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-[#E8E2D9] p-12 text-center space-y-4">
                <Package size={32} className="mx-auto text-[#766F68]" strokeWidth={1.5} />
                <h3 className="font-serif text-2xl text-[#1A1817]">No previous orders recorded</h3>
                <p className="text-xs font-sans text-[#766F68] max-w-sm mx-auto">
                  When you acquire a silhouette, your complete dispatch timeline and invoices will appear here.
                </p>
                <Link
                  to="/shop"
                  className="inline-block bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3"
                >
                  Explore Silhouettes
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white border border-[#E8E2D9] p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E2D9] gap-2 text-xs font-sans">
                    <div>
                      <span className="font-mono text-sm font-semibold text-[#1A1817]">
                        Order #{ord.order_number}
                      </span>
                      <span className="text-[#766F68] ml-3">
                        {formatDate(ord.created_at, 'medium')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-medium ${
                        ord.status === 'DELIVERED' ? 'bg-[#3D6B52]/10 text-[#3D6B52]' : 'bg-[#966355]/10 text-[#966355]'
                      }`}>
                        {ord.status}
                      </span>
                      <Link
                        to={`/orders/track?order=${ord.order_number}`}
                        className="text-xs text-[#1A1817] hover:text-[#966355] underline font-medium flex items-center"
                      >
                        <span>Track</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E8E2D9]">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center text-xs font-sans">
                        <div className="flex items-center space-x-3">
                          {item.image_url && (
                            <img
                              src={optimizeImageUrl(item.image_url, 100, 75)}
                              alt=""
                              className="w-10 h-14 object-cover border"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <div>
                            <span className="font-medium text-[#1A1817]">{item.product_name}</span>
                            <div className="text-[11px] text-[#766F68]">
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">₹{Number(item.total_price).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D9] flex justify-between text-xs font-sans">
                    <span className="text-[#766F68]">Total Amount Paid:</span>
                    <span className="font-serif text-sm font-medium text-[#1A1817]">₹{Number(ord.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-[#1A1817]">Saved Delivery Addresses</h3>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-4 py-2 hover:bg-[#966355] transition-colors flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="bg-white border border-[#E8E2D9] p-6 space-y-4 text-xs font-sans">
                <h4 className="font-serif text-base text-[#1A1817]">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#766F68] uppercase text-[10px] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.full_name}
                      onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                      className="w-full border border-[#E8E2D9] p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#766F68] uppercase text-[10px] mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full border border-[#E8E2D9] p-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#766F68] uppercase text-[10px] mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddr.address_line1}
                      onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                      className="w-full border border-[#E8E2D9] p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#766F68] uppercase text-[10px] mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full border border-[#E8E2D9] p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#766F68] uppercase text-[10px] mb-1">PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full border border-[#E8E2D9] p-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="bg-[#1A1817] text-white px-5 py-2 uppercase tracking-widest text-[10px]">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddAddress(false)} className="border px-4 py-2 uppercase tracking-widest text-[10px]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a.id} className="bg-white border border-[#E8E2D9] p-5 text-xs font-sans space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#1A1817]">{a.full_name}</span>
                    {a.is_default && (
                      <span className="text-[10px] bg-[#3D6B52]/10 text-[#3D6B52] px-2 py-0.5">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-[#766F68] leading-relaxed">
                    {a.address_line1}, {a.city}, {a.state} - {a.pincode}
                  </p>
                  <div className="text-[#231F1D]">Phone: {a.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#E8E2D9] p-6 sm:p-8 max-w-xl text-xs font-sans space-y-4">
            <h3 className="font-serif text-xl text-[#1A1817]">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[#766F68] block uppercase text-[10px] mb-1">Email</label>
                <div className="text-sm font-medium">{user?.email}</div>
              </div>
              <div>
                <label className="text-[#766F68] block uppercase text-[10px] mb-1">Name</label>
                <div className="text-sm font-medium">{user?.first_name} {user?.last_name}</div>
              </div>
              <div>
                <label className="text-[#766F68] block uppercase text-[10px] mb-1">Phone</label>
                <div className="text-sm font-medium">{user?.phone || 'Not recorded'}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
