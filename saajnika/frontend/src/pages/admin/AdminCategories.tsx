import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, FolderTree, ArrowRight } from 'lucide-react';
import api, { clearApiCache } from '../../services/api';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/admin/categories/');
      setCategories(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleUpdate = () => {
      fetchCategories();
    };
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      display_order: categories.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline || '',
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/catalog/admin/categories/${cat.id}/`);
      clearApiCache();
      alert(`Category "${cat.name}" deleted.`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category (it may contain products).');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/catalog/admin/categories/${editingId}/`, form);
        clearApiCache();
        alert('Category updated.');
      } else {
        await api.post('/catalog/admin/categories/', form);
        clearApiCache();
        alert('Category created.');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.name?.[0] || 'Error saving category.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Taxonomy & Navigation
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817]">Categories & Collections</h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-5 py-3 hover:bg-[#966355] transition-colors flex items-center space-x-2"
        >
          <Plus size={14} />
          <span>New Category</span>
        </button>
      </div>

      {/* Category Grid Cards */}
      {categories.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-3">
          <FolderTree size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Categories or Collections Yet</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            Create your taxonomy chapters (e.g., Sarees, Kurtas & Suits, Co-ords) to organize and navigate your digital boutique.
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3.5 hover:bg-[#966355] transition-colors"
            >
              <Plus size={14} />
              <span>Create First Category</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="bg-white border border-[#E8E2D9] shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="relative aspect-[4/5] bg-[#F5F1EB]">
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-mono">
                  Order: {c.display_order}
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#1A1817]">{c.name}</h3>
                  <p className="text-xs font-sans text-[#766F68] line-clamp-2 mt-1">
                    {c.tagline || c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-between text-xs font-sans">
                  <span className="text-[11px] text-[#766F68]">
                    {c.product_count ?? 0} active silhouettes
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1 hover:text-[#966355]"
                      title="Edit Category"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1 text-[#766F68] hover:text-[#A43E38]"
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-[#FAF8F5] max-w-lg w-full p-8 border border-[#E8E2D9] shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="font-serif text-2xl text-[#1A1817]">
                  {isEditing ? `Edit Category: ${form.name}` : 'Create Category'}
                </h3>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Tagline (Editorial phrase)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sculptural silhouettes shaped for quiet grace"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-[#766F68] mb-1">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full border p-2 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-[10px] text-[#766F68] mb-1">Display Order</label>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                      className="w-full border p-2 bg-white"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      />
                      <span>Active in Store</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E2D9]">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border">Cancel</button>
                  <button type="submit" className="bg-[#1A1817] text-white px-6 py-2 uppercase tracking-widest text-[10px]">
                    {isEditing ? 'Save Changes' : 'Create Category'}
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
