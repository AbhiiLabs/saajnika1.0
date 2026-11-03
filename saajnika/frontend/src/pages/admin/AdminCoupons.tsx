import React, { useState, useEffect } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import api, { clearApiCache } from '../../services/api';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '10',
    min_order_value: '3000',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usage_limit: 100,
    is_active: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons/');
      setCoupons(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching coupons', err);
    }
  };

  useEffect(() => {
    fetchCoupons();

    const handleUpdate = () => {
      fetchCoupons();
    };
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/coupons/', {
        ...form,
        code: form.code.toUpperCase(),
      });
      clearApiCache();
      setShowAddModal(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] font-medium block">
            Promotions & Privileges
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817]">Coupon Management</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-5 py-3 hover:bg-[#966355] flex items-center space-x-2"
        >
          <Plus size={14} />
          <span>New Coupon</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-3">
          <Tag size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Privilege Coupons</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            Create promotional codes and privileged discounts with bespoke minimum order values and validity windows.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3.5 hover:bg-[#966355] transition-colors"
            >
              <Plus size={14} />
              <span>Create First Coupon</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] shadow-sm overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Privilege Type</th>
                <th className="p-4">Discount Value</th>
                <th className="p-4">Min Order (₹)</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4 font-mono font-medium text-[#1A1817]">{c.code}</td>
                  <td className="p-4 uppercase text-[10px] text-[#766F68]">{c.discount_type}</td>
                  <td className="p-4 font-medium">
                    {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="p-4">₹{Number(c.min_order_value).toLocaleString()}</td>
                  <td className="p-4">{c.times_used} / {c.usage_limit}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-medium ${c.is_active ? 'bg-[#3D6B52]/10 text-[#3D6B52]' : 'bg-[#A43E38]/10 text-[#A43E38]'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-[#FAF8F5] max-w-md w-full p-6 border border-[#E8E2D9] shadow-2xl space-y-4">
              <h3 className="font-serif text-xl text-[#1A1817]">Create Privilege Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border p-2 uppercase font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full border p-2 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border">Cancel</button>
                  <button type="submit" className="bg-[#1A1817] text-white px-5 py-2 uppercase tracking-widest text-[10px]">
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
