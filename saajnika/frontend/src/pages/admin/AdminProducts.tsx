import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit3, Trash2, Check, AlertCircle, X, Image as ImageIcon,
  Layers, Star, Eye, Tag, Upload, Loader2, CheckCircle2, Sparkles, RefreshCw
} from 'lucide-react';
import api, { clearApiCache } from '../../services/api';
import { Product, Category, ProductVariant, ProductImage } from '../../types';

const FASHION_PRESETS = [
  { label: 'Banarasi Silk', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Chanderi Linen', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Silk Drape', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Editorial Sari', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Atelier Runway', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85' },
];

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Active Tab inside modal: 'general' | 'images' | 'variants'
  const [modalTab, setModalTab] = useState<'general' | 'images' | 'variants'>('general');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    collection_name: '',
    base_price: '',
    sale_price: '',
    short_description: '',
    description: '',
    fabric_and_care: '',
    fit_and_sizing: '',
    shipping_and_returns: '',
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
  });

  // Multi-image state
  const [images, setImages] = useState<{ id?: string; image_url: string; is_primary: boolean; alt_text?: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);

  // Variants state
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({
    size: 'M',
    color_name: 'Ivory White',
    color_hex: '#F8F6F0',
    stock_quantity: 10,
    additional_price: 0,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/catalog/admin/products/'),
        api.get('/catalog/categories/'),
      ]);
      setProducts(prodRes.data.results || prodRes.data || []);
      const cats = catRes.data.results || catRes.data || [];
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleUpdate = () => {
      fetchProducts();
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
    setEditingProductId(null);
    setModalTab('general');
    setModalErrorMsg(null);
    setModalSuccessMsg(null);
    setFormData({
      name: '',
      sku: `SJ-${Date.now().toString().slice(-4)}`,
      category_id: categories[0]?.id || '',
      collection_name: 'Winter Solstice',
      base_price: '6500',
      sale_price: '',
      short_description: '',
      description: '',
      fabric_and_care: '100% Handloom Silk Cotton. Dry clean only.',
      fit_and_sizing: 'Relaxed tailored drape. Fits true to size.',
      shipping_and_returns: 'Dispatches in 24-48 hours. 7-day exchange.',
      is_featured: false,
      is_new_arrival: true,
      is_active: true,
    });
    setImages([
      {
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        is_primary: true,
      }
    ]);
    setVariants([
      { size: 'S', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', stock_quantity: 8 },
      { size: 'M', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', stock_quantity: 12 },
      { size: 'L', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', stock_quantity: 6 },
    ]);
    setShowModal(true);
  };

  const openEditModal = async (product: Product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setModalTab('general');
    setModalErrorMsg(null);
    setModalSuccessMsg(null);

    try {
      const res = await api.get(`/catalog/admin/products/${product.id}/`);
      const data = res.data;

      setFormData({
        name: data.name,
        sku: data.sku,
        category_id: data.category?.id || categories[0]?.id || '',
        collection_name: data.collection_name || '',
        base_price: data.base_price,
        sale_price: data.sale_price || '',
        short_description: data.short_description || '',
        description: data.description || '',
        fabric_and_care: data.fabric_and_care || '',
        fit_and_sizing: data.fit_and_sizing || '',
        shipping_and_returns: data.shipping_and_returns || '',
        is_featured: data.is_featured,
        is_new_arrival: data.is_new_arrival,
        is_active: data.is_active,
      });

      setImages(data.images?.length ? data.images : [{ image_url: data.primary_image, is_primary: true }]);
      setVariants(data.variants || []);
      setShowModal(true);
    } catch (err) {
      alert('Could not load silhouette details for editing');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}" (${product.sku})? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/catalog/admin/products/${product.id}/`);
      clearApiCache();
      alert(`Silhouette "${product.name}" deleted.`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  // Direct File Upload from Computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setModalErrorMsg(null);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/catalog/admin/products/upload_image/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.image_url) {
        setImages((prev) => [
          ...prev,
          {
            image_url: res.data.image_url,
            is_primary: prev.length === 0,
            alt_text: formData.name || file.name,
          }
        ]);
        setModalSuccessMsg(`Image "${file.name}" uploaded and attached to silhouette.`);
        setTimeout(() => setModalSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setModalErrorMsg(err.response?.data?.error || 'Failed to upload image file. Please verify it is a valid PNG/JPG/WEBP image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Image actions
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        image_url: newImageUrl.trim(),
        is_primary: prev.length === 0,
        alt_text: formData.name,
      }
    ]);
    setNewImageUrl('');
  };

  const handleAddPreset = (url: string) => {
    setImages((prev) => [
      ...prev,
      {
        image_url: url,
        is_primary: prev.length === 0,
        alt_text: formData.name,
      }
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  // Variant actions
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: `${formData.sku}-${newVariant.size}-${newVariant.color_name.slice(0, 3).toUpperCase()}`,
        ...newVariant,
      }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantStockChange = (index: number, stock: number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock_quantity: Math.max(0, stock) } : v))
    );
  };

  // Form submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg(null);
    setModalSuccessMsg(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setModalTab('general');
      setModalErrorMsg('Please specify a silhouette title.');
      return;
    }
    if (!formData.sku.trim()) {
      setModalTab('general');
      setModalErrorMsg('Please specify a unique SKU code.');
      return;
    }
    if (!formData.base_price || Number(formData.base_price) <= 0) {
      setModalTab('general');
      setModalErrorMsg('Please enter a valid base price (greater than 0).');
      return;
    }
    if (!formData.category_id) {
      setModalTab('general');
      setModalErrorMsg('Please select a category for this silhouette.');
      return;
    }

    // Auto-add URL if left in the input field
    let currentImages = [...images];
    if (newImageUrl.trim()) {
      currentImages.push({
        image_url: newImageUrl.trim(),
        is_primary: currentImages.length === 0,
        alt_text: formData.name,
      });
      setImages(currentImages);
      setNewImageUrl('');
    }

    if (currentImages.length === 0) {
      setModalTab('images');
      setModalErrorMsg('Please add or upload at least one garment photo for this silhouette.');
      return;
    }

    if (!currentImages.some(img => img.is_primary)) {
      currentImages[0].is_primary = true;
    }

    setIsSaving(true);

    const payload = {
      ...formData,
      category: formData.category_id,
      sale_price: formData.sale_price ? formData.sale_price : null,
      images: currentImages,
      variants: variants,
    };
    // @ts-ignore
    delete payload.category_id;

    try {
      if (isEditing && editingProductId) {
        await api.put(`/catalog/admin/products/${editingProductId}/`, payload);
        clearApiCache();
        setModalSuccessMsg('Silhouette successfully updated.');
      } else {
        await api.post('/catalog/admin/products/', payload);
        clearApiCache();
        setModalSuccessMsg('New silhouette successfully published.');
      }
      setTimeout(() => {
        setShowModal(false);
        fetchProducts();
      }, 700);
    } catch (err: any) {
      console.error('Failed to save silhouette:', err);
      const errorData = err.response?.data;
      let msg = 'Failed to save silhouette.';
      if (typeof errorData === 'string') {
        msg = errorData;
      } else if (errorData?.error) {
        msg = errorData.error;
      } else if (errorData && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        const val = errorData[firstKey];
        msg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
      }
      setModalErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !categoryFilter || p.category_slug === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Atelier Catalog Center
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817]">Silhouettes & Products</h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-5 py-3 hover:bg-[#966355] transition-colors flex items-center space-x-2"
        >
          <Plus size={14} />
          <span>Add New Silhouette</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-[#E8E2D9]">
        <div className="flex w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#E8E2D9] px-3 py-2 text-xs font-sans focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-sans w-full sm:w-auto">
          <span className="text-[#766F68] uppercase text-[10px] tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-[#E8E2D9] p-2 bg-white text-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E8E2D9] bg-white space-y-3">
          <Layers size={36} className="mx-auto text-[#C5A880]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl text-[#1A1817]">No Silhouettes in Atelier Catalog</h3>
          <p className="text-xs font-sans text-[#766F68] max-w-md mx-auto leading-relaxed">
            Your catalog database is clean. When you're ready, create your first garment silhouette to publish it to the digital boutique.
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-6 py-3.5 hover:bg-[#966355] transition-colors"
            >
              <Plus size={14} />
              <span>Add First Silhouette</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] shadow-sm overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#766F68] uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                <th className="p-4">Drape</th>
                <th className="p-4">Silhouette Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Attributes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-4">
                    <img src={p.primary_image} alt="" className="w-10 h-14 object-cover border border-[#E8E2D9]" />
                  </td>
                  <td className="p-4">
                    <div className="font-serif text-sm font-medium text-[#1A1817]">{p.name}</div>
                    <div className="text-[10px] text-[#766F68]">{p.collection_name || 'Atelier'}</div>
                  </td>
                  <td className="p-4 font-mono font-medium">{p.sku}</td>
                  <td className="p-4 text-[#766F68]">{p.category_name}</td>
                  <td className="p-4">
                    <span className="font-medium text-[#1A1817]">₹{Number(p.current_price).toLocaleString()}</span>
                    {p.sale_price && (
                      <span className="text-[10px] text-[#766F68] line-through block">
                        ₹{Number(p.base_price).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-medium ${
                      p.total_stock === 0 ? 'bg-[#A43E38]/10 text-[#A43E38]' :
                      p.total_stock <= 3 ? 'bg-[#C5A880]/20 text-[#966355]' :
                      'bg-[#3D6B52]/10 text-[#3D6B52]'
                    }`}>
                      {p.total_stock} units
                    </span>
                  </td>
                  <td className="p-4 space-x-1">
                    {p.is_featured && <span className="bg-[#1A1817] text-white text-[9px] px-1.5 py-0.5">Featured</span>}
                    {p.is_new_arrival && <span className="bg-[#966355] text-white text-[9px] px-1.5 py-0.5">New Drop</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-[#1A1817] hover:text-[#966355] hover:bg-[#F5F1EB] transition-colors"
                        title="Edit Silhouette"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 text-[#766F68] hover:text-[#A43E38] hover:bg-[#F5F1EB] transition-colors"
                        title="Delete Silhouette"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          FULL PRODUCT CREATE / EDIT MODAL
          Tabs: 1. General & Story, 2. Multi-Image Gallery, 3. Variants & Stock
      ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-[#FAF8F5] max-w-4xl w-full p-6 sm:p-10 border border-[#E8E2D9] shadow-2xl space-y-6">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#E8E2D9]">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block font-medium">
                    {isEditing ? 'Modify Existing Silhouette' : 'Atelier Creation'}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1817]">
                    {isEditing ? `Edit: ${formData.name}` : 'Create New Silhouette'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 text-[#766F68] hover:text-[#1A1817]">
                  <X size={20} />
                </button>
              </div>

              {/* Sub-Tabs: General / Images / Variants */}
              <div className="flex border-b border-[#E8E2D9] space-x-4 text-xs font-sans uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setModalTab('general')}
                  className={`pb-2 transition-colors relative ${
                    modalTab === 'general' ? 'font-semibold text-[#1A1817] border-b-2 border-[#1A1817]' : 'text-[#766F68]'
                  }`}
                >
                  1. Information & Pricing
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('images')}
                  className={`pb-2 transition-colors relative flex items-center space-x-1.5 ${
                    modalTab === 'images' ? 'font-semibold text-[#1A1817] border-b-2 border-[#1A1817]' : 'text-[#766F68]'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>2. Gallery Photography ({images.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('variants')}
                  className={`pb-2 transition-colors relative flex items-center space-x-1.5 ${
                    modalTab === 'variants' ? 'font-semibold text-[#1A1817] border-b-2 border-[#1A1817]' : 'text-[#766F68]'
                  }`}
                >
                  <Layers size={13} />
                  <span>3. Sizes, Colors & Stock ({variants.length})</span>
                </button>
              </div>

              {/* Status Feedback in Modal */}
              {modalSuccessMsg && (
                <div className="p-3 bg-[#F2F7F4] border border-[#CDE3D5] text-[#2C5E3B] text-xs font-sans flex items-center space-x-2">
                  <CheckCircle2 size={16} />
                  <span>{modalSuccessMsg}</span>
                </div>
              )}
              {modalErrorMsg && (
                <div className="p-3 bg-[#FBF2F2] border border-[#F0D5D5] text-[#A43E38] text-xs font-sans flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{modalErrorMsg}</span>
                </div>
              )}

              {/* Form Content */}
              <form noValidate onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
                
                {/* TAB 1: GENERAL INFORMATION */}
                {modalTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Silhouette Title *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2.5 bg-white text-sm"
                          placeholder="e.g. Aurelia Banarasi Silk Sari"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">SKU Code *</label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2.5 bg-white font-mono text-sm uppercase"
                          placeholder="e.g. SJ-AUR-01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Category *</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Collection Edit</label>
                        <input
                          type="text"
                          value={formData.collection_name}
                          onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                          placeholder="e.g. Winter Solstice"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block uppercase text-[10px] text-[#766F68] mb-1">Base Price (₹) *</label>
                          <input
                            type="number"
                            value={formData.base_price}
                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                            className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                            placeholder="6500"
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] text-[#766F68] mb-1">Sale Price (₹)</label>
                          <input
                            type="number"
                            value={formData.sale_price}
                            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                            className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase text-[10px] text-[#766F68] mb-1">Short Editorial Summary *</label>
                      <textarea
                        rows={2}
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                        placeholder="Brief summary for catalog cards"
                      />
                    </div>

                    <div>
                      <label className="block uppercase text-[10px] text-[#766F68] mb-1">Atelier Story & Craftsmanship</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs"
                        placeholder="Detailed weaving technique, artisan provenance, and silhouette drape..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Fabric & Care</label>
                        <textarea
                          rows={2}
                          value={formData.fabric_and_care}
                          onChange={(e) => setFormData({ ...formData, fabric_and_care: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Fit & Sizing Advice</label>
                        <textarea
                          rows={2}
                          value={formData.fit_and_sizing}
                          onChange={(e) => setFormData({ ...formData, fit_and_sizing: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] text-[#766F68] mb-1">Shipping & Exchange</label>
                        <textarea
                          rows={2}
                          value={formData.shipping_and_returns}
                          onChange={(e) => setFormData({ ...formData, shipping_and_returns: e.target.value })}
                          className="w-full border border-[#E8E2D9] p-2 bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 pt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="accent-[#1A1817]"
                        />
                        <span>Featured on Homepage</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_new_arrival}
                          onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                          className="accent-[#1A1817]"
                        />
                        <span>Flag as New Season Arrival</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="accent-[#1A1817]"
                        />
                        <span>Active for Sale</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: MULTI-IMAGE MANAGEMENT (DIRECT UPLOAD + URL + PRESETS) */}
                {modalTab === 'images' && (
                  <div className="space-y-6">
                    
                    {/* Direct File Upload Zone */}
                    <div className="border-2 border-dashed border-[#D5CDC2] bg-white p-5 text-center space-y-3 hover:border-[#1A1817] transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />
                      <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#966355]">
                          {isUploadingImage ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="bg-[#1A1817] text-white px-5 py-2 text-xs uppercase tracking-wider hover:bg-[#332F2C] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          <Upload size={13} />
                          <span>{isUploadingImage ? 'Uploading Image...' : 'Upload Photo from Computer'}</span>
                        </button>
                        <p className="text-[11px] text-[#766F68] mt-2">
                          Supports PNG, JPG, or WEBP photos. High-resolution editorial portrait shots recommended.
                        </p>
                      </div>
                    </div>

                    {/* Or URL Input */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#766F68] block">Or Attach via Web Image URL</span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/... or CDN link)"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImage();
                            }
                          }}
                          className="w-full border border-[#E8E2D9] p-2.5 bg-white text-xs focus:outline-none focus:border-[#966355]"
                        />
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="bg-[#1A1817] text-white px-5 py-2 uppercase tracking-wider text-[11px] whitespace-nowrap hover:bg-[#332F2C]"
                        >
                          Add Image URL
                        </button>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#766F68] flex items-center gap-1">
                        <Sparkles size={11} className="text-[#966355]" />
                        <span>Or select from curated atelier photography presets:</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {FASHION_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddPreset(p.url)}
                            className="text-[10px] font-sans border border-[#E8E2D9] bg-white px-3 py-1 hover:border-[#1A1817] hover:bg-[#FAF8F5] transition-colors"
                          >
                            + {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Thumbnails Grid */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#766F68] block mb-3">
                        Active Silhouette Gallery ({images.length} photos attached)
                      </span>
                      {images.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-[#E8E2D9] text-[#766F68] text-xs">
                          No images attached yet. Upload a photo from your computer or paste an image URL above.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-[3/4] border border-[#E8E2D9] bg-white p-1.5 flex flex-col justify-between group shadow-sm">
                              <img
                                src={img.image_url}
                                alt=""
                                className="w-full h-4/5 object-cover bg-[#FAF8F5]"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div className="pt-2 flex items-center justify-between text-[10px]">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="primary_img"
                                    checked={img.is_primary}
                                    onChange={() => handleSetPrimaryImage(idx)}
                                    className="accent-[#1A1817]"
                                  />
                                  <span className={img.is_primary ? 'font-bold text-[#1A1817]' : 'text-[#766F68]'}>
                                    {img.is_primary ? '★ Primary' : 'Primary'}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="text-[#A43E38] hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 3: VARIANTS & STOCK */}
                {modalTab === 'variants' && (
                  <div className="space-y-4">
                    {/* Add Variant Bar */}
                    <div className="grid grid-cols-5 gap-2 p-3 bg-[#F5F1EB] border border-[#E8E2D9] items-end">
                      <div>
                        <label className="block uppercase text-[9px] mb-1">Size</label>
                        <select
                          value={newVariant.size}
                          onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                          className="w-full border p-1.5 bg-white text-xs"
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'].map((sz) => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block uppercase text-[9px] mb-1">Color Name</label>
                        <input
                          type="text"
                          value={newVariant.color_name}
                          onChange={(e) => setNewVariant({ ...newVariant, color_name: e.target.value })}
                          className="w-full border p-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[9px] mb-1">Color Hex</label>
                        <input
                          type="text"
                          value={newVariant.color_hex}
                          onChange={(e) => setNewVariant({ ...newVariant, color_hex: e.target.value })}
                          className="w-full border p-1.5 bg-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[9px] mb-1">Stock Units</label>
                        <input
                          type="number"
                          value={newVariant.stock_quantity}
                          onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: Number(e.target.value) })}
                          className="w-full border p-1.5 bg-white text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-[#1A1817] text-white p-1.5 uppercase text-[10px] tracking-wider hover:bg-[#332F2C]"
                      >
                        + Add Variant
                      </button>
                    </div>

                    {/* Variant List Table */}
                    <table className="w-full border border-[#E8E2D9] text-left">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[#766F68] uppercase text-[9px]">
                          <th className="p-3">SKU</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">Color</th>
                          <th className="p-3">Stock Units</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E2D9] bg-white">
                        {variants.map((v, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-mono text-[11px]">{v.sku}</td>
                            <td className="p-3 font-medium">{v.size}</td>
                            <td className="p-3 flex items-center space-x-2">
                              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color_hex }} />
                              <span>{v.color_name}</span>
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={v.stock_quantity}
                                onChange={(e) => handleVariantStockChange(idx, Number(e.target.value))}
                                className="w-16 border p-1 text-center"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-[#A43E38] hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="pt-4 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="border border-[#E8E2D9] px-5 py-2.5 text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1A1817] text-white px-8 py-2.5 text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#966355] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="animate-spin" size={14} /> : null}
                    <span>{isSaving ? 'Synchronizing with Atelier...' : (isEditing ? 'Save Silhouette Changes' : 'Publish Silhouette')}</span>
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
