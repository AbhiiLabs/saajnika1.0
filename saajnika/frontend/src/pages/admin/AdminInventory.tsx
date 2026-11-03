import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, ArrowUpDown, Plus, Minus } from 'lucide-react';
import api from '../../services/api';

export const AdminInventory: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('Atelier Batch Restock');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/stock/');
      setInventoryList(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.post(`/stock/${selectedItem.id}/adjust_stock/`, {
        quantity: adjustQty,
        reason: adjustReason,
      });
      setSelectedItem(null);
      fetchInventory();
      alert('Stock successfully adjusted and audit logged.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="pb-4 border-b border-[#E8E2D9]">
        <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] font-medium block">
          Warehouse & Atelier Logistics
        </span>
        <h1 className="font-serif text-3xl text-[#1A1817]">Inventory & Stock Control</h1>
      </div>

      {inventoryList.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-2">
          <Layers size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Stock Records</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            Inventory is clean. Stock SKU tracking and warehouse adjustment logs will be generated automatically as silhouettes and size variants are created.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] shadow-sm overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                <th className="p-4">SKU Code</th>
                <th className="p-4">Silhouette Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Color</th>
                <th className="p-4">Available Units</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]">
              {inventoryList.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4 font-mono font-medium">{inv.sku}</td>
                  <td className="p-4 font-serif text-sm text-[#1A1817]">{inv.product_name}</td>
                  <td className="p-4 font-medium">{inv.size}</td>
                  <td className="p-4">{inv.color}</td>
                  <td className="p-4 font-medium">{inv.available_quantity}</td>
                  <td className="p-4">
                    {inv.is_low_stock ? (
                      <span className="bg-[#A43E38]/10 text-[#A43E38] px-2 py-0.5 text-[10px] uppercase font-medium flex items-center gap-1 w-max">
                        <AlertTriangle size={12} /> Low Stock ({inv.available_quantity})
                      </span>
                    ) : (
                      <span className="bg-[#3D6B52]/10 text-[#3D6B52] px-2 py-0.5 text-[10px] uppercase font-medium">
                        Healthy Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedItem(inv)}
                      className="text-[#966355] hover:underline font-medium"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedItem(null)} />
            <div className="relative bg-[#FAF8F5] max-w-md w-full p-6 border border-[#E8E2D9] shadow-2xl space-y-4">
              <h3 className="font-serif text-xl text-[#1A1817]">Adjust Variant Inventory</h3>
              <p className="text-xs font-sans text-[#766F68]">
                {selectedItem.product_name} ({selectedItem.sku})
              </p>

              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">
                    Quantity Delta (Positive to add, Negative to reduce)
                  </label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    required
                    className="w-full border border-[#E8E2D9] p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">
                    Reason for Movement *
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    required
                    className="w-full border border-[#E8E2D9] p-2 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 border">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#1A1817] text-white px-5 py-2 uppercase tracking-widest text-[10px]">
                    Confirm Movement
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
