import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  X, 
  SlidersHorizontal, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Search as SearchIcon, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import { safeArray, cachedGet } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/catalog/ProductCard';
import { QuickViewModal } from '../components/catalog/QuickViewModal';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../data/seedData';

// Indian Category Options matching Myntra's taxonomy
const categoryFilters = [
  { label: 'All Silhouettes', value: '' },
  { label: 'Kurtas & Suits Ensembles', value: 'kurtas-suits' },
  { label: 'Sarees & Handloom Drapes', value: 'sarees' },
  { label: 'Contemporary Ethnic', value: 'contemporary-ethnic' },
  { label: 'Festive Heirlooms & Anarkalis', value: 'festive-heirlooms' },
  { label: 'Private Salon Co-ords', value: 'private-salon-coords' },
  { label: 'Artisanal Dupattas & Shawls', value: 'artisanal-dupattas' },
  { label: 'Everyday Handloom Luxury', value: 'everyday-luxury' },
  { label: 'Ethnic Jackets & Capes', value: 'jackets' },
];

// Price segments tailored for Indian shoppers
const priceSegments = [
  { label: 'All Price Ranges', value: '' },
  { label: 'Under ₹5,000 (Budget Luxury)', value: 'under_5k' },
  { label: '₹5,000 - ₹10,000 (Festive Wear)', value: '5k_to_10k' },
  { label: '₹10,000 - ₹20,000 (Occasion & Heirlooms)', value: '10k_to_20k' },
  { label: 'Above ₹20,000 (Pure Bridal Silk)', value: 'above_20k' },
];

// Standard Indian sizing with bust inch guides
const sizeOptions = [
  { label: 'XS', sub: 'Bust 32"' },
  { label: 'S', sub: 'Bust 34"' },
  { label: 'M', sub: 'Bust 36"' },
  { label: 'L', sub: 'Bust 38"' },
  { label: 'XL', sub: 'Bust 40"' },
  { label: 'FREE', sub: 'One Size' },
];

// Indian Heritage Fabrics
const fabricOptions = [
  { label: 'Banarasi Silk', value: 'Banarasi' },
  { label: 'Chanderi Silk Cotton', value: 'Chanderi' },
  { label: 'Pure Handloom Linen', value: 'Linen' },
  { label: 'Tissue Organza', value: 'Organza' },
  { label: 'Mulberry Raw Silk', value: 'Silk' },
  { label: 'Silk Velvet & Zardozi', value: 'Velvet' },
];

// Indian Luxury Color Palette
const colorOptions = [
  { name: 'Alabaster Ivory', hex: '#F8F6F0', border: '#D9D2C7' },
  { name: 'Royal Crimson', hex: '#9E2A2B', border: '#7A1C1D' },
  { name: 'Emerald Forest', hex: '#2D5A43', border: '#1B3B2B' },
  { name: 'Terracotta Wine', hex: '#844238', border: '#682F27' },
  { name: 'Dusky Rose', hex: '#B5837B', border: '#9A635B' },
  { name: 'Champagne Gold', hex: '#D4AF37', border: '#AA8820' },
  { name: 'Deep Sage', hex: '#4A5B4C', border: '#334035' },
  { name: 'Charcoal Noir', hex: '#23201F', border: '#0F0E0D' },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'category' | 'price' | 'size' | 'fabric' | 'color' | 'more'>('category');

  // Collapsible section state for desktop
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    fabric: true,
    color: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Active Filter States from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentCollection = searchParams.get('collection') || '';
  const currentNewArrival = searchParams.get('new_arrival') || '';
  const currentSort = searchParams.get('ordering') || '-created_at';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentPriceRange = searchParams.get('price_range') || '';
  const currentFabric = searchParams.get('fabric') || '';
  const currentInStock = searchParams.get('in_stock') || '';
  const currentOnSale = searchParams.get('on_sale') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  // Custom price input state
  const [customMin, setCustomMin] = useState(currentMinPrice);
  const [customMax, setCustomMax] = useState(currentMaxPrice);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await cachedGet('/catalog/categories/');
        const cats = safeArray<Category>(res.data);
        if (cats.length > 0) setCategories(cats);
      } catch (err) {
        setCategories(SEED_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentCollection) params.collection = currentCollection;
        if (currentNewArrival) params.new_arrival = 'true';
        if (currentSort) params.ordering = currentSort;
        if (currentSize) params.size = currentSize;
        if (currentColor) params.color = currentColor;
        if (currentFabric) params.fabric = currentFabric;
        if (currentInStock) params.in_stock = 'true';
        if (currentOnSale) params.on_sale = 'true';
        if (currentPriceRange) params.price_range = currentPriceRange;
        if (currentMinPrice) params.min_price = currentMinPrice;
        if (currentMaxPrice) params.max_price = currentMaxPrice;

        const res = await cachedGet('/catalog/products/', { params });
        const prods = safeArray<Product>(res.data);
        setProducts(prods);
      } catch (err) {
        console.warn('Using embedded boutique products (offline fallback)', err);
        setProducts(SEED_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

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
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // If setting price_range, clear custom min/max
    if (key === 'price_range') {
      newParams.delete('min_price');
      newParams.delete('max_price');
      setCustomMin('');
      setCustomMax('');
    }
    setSearchParams(newParams);
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('price_range');
    if (customMin) newParams.set('min_price', customMin);
    else newParams.delete('min_price');
    if (customMax) newParams.set('max_price', customMax);
    else newParams.delete('max_price');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setCustomMin('');
    setCustomMax('');
  };

  const hasActiveFilters = Boolean(
    currentCategory || 
    currentSearch || 
    currentCollection || 
    currentSize || 
    currentColor || 
    currentPriceRange || 
    currentNewArrival || 
    currentFabric || 
    currentInStock || 
    currentOnSale ||
    currentMinPrice ||
    currentMaxPrice
  );

  // Helper for active badge display text
  const getActiveFilterLabel = (key: string, val: string) => {
    if (key === 'category') {
      const match = categoryFilters.find(c => c.value === val);
      return match ? match.label : val;
    }
    if (key === 'price_range') {
      const match = priceSegments.find(p => p.value === val);
      return match ? match.label.split('(')[0].trim() : val;
    }
    if (key === 'size') return `Size: ${val}`;
    if (key === 'fabric') return `Fabric: ${val}`;
    if (key === 'color') return `Color: ${val}`;
    if (key === 'search') return `Search: "${val}"`;
    if (key === 'in_stock') return 'Ready to Ship';
    if (key === 'new_arrival') return 'New Arrivals';
    if (key === 'on_sale') return 'On Sale';
    if (key === 'min_price') return `Min ₹${Number(val).toLocaleString()}`;
    if (key === 'max_price') return `Max ₹${Number(val).toLocaleString()}`;
    return val;
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D]">
      
      {/* Editorial Header Banner */}
      <div className="border-b border-[#E8E2D9] bg-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-sans tracking-[0.18em] uppercase text-[#966355] font-semibold mb-1">
              <Link to="/" className="hover:underline text-[#766F68]">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:underline text-[#766F68]">Women</Link>
              <span>/</span>
              <span>{currentCategory ? currentCategory.replace('-', ' ') : 'All Collections'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal">
              {currentCategory 
                ? categoryFilters.find(c => c.value === currentCategory)?.label || 'Curated Silhouettes'
                : 'Women\'s Indian & Fusion Collection'}
            </h1>
          </div>
          <p className="text-xs font-sans text-[#766F68] max-w-md leading-relaxed hidden md:block">
            Hand-reeled mulberry silks, delicate chanderis, and gossamer organzas tailored with French seams and pure zari borders.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Controls Bar (Mobile Refine Trigger, Results Count, Sorting) */}
        <div className="bg-white border border-[#E8E2D9] p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          
          {/* Mobile Filter Trigger Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 text-xs font-sans tracking-[0.15em] uppercase font-semibold text-white bg-[#1A1817] py-2.5 px-4 shadow-sm hover:bg-[#966355] transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span>Filters & Sort {hasActiveFilters && '●'}</span>
          </button>

          {/* Result Count and Active Filters Prompt */}
          <div className="flex items-center space-x-3 text-xs font-sans text-[#766F68]">
            <span>
              Showing <strong className="text-[#1A1817] text-sm">{products.length}</strong> handcrafted silhouettes
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="hidden sm:inline-flex items-center space-x-1 text-[#A43E38] hover:underline font-medium text-xs ml-3"
              >
                <RotateCcw size={12} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-sans text-[#766F68] uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('ordering', e.target.value)}
              className="bg-[#FAF8F5] border border-[#E8E2D9] text-xs font-sans py-2 px-3 focus:outline-none focus:border-[#1A1817] text-[#231F1D] font-medium"
            >
              <option value="-created_at">Newest First</option>
              <option value="base_price">Price: Low to High (₹)</option>
              <option value="-base_price">Price: High to Low (₹)</option>
              <option value="name">Silhouettes A to Z</option>
            </select>
          </div>

        </div>

        {/* ACTIVE FILTER TAGS CHIPS BAR (Like Myntra) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3.5 border border-[#E8E2D9]">
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#766F68] mr-2">
              Active Filters:
            </span>

            {currentCategory && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('category', currentCategory)}</span>
                <button onClick={() => updateFilter('category', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentPriceRange && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('price_range', currentPriceRange)}</span>
                <button onClick={() => updateFilter('price_range', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentMinPrice && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('min_price', currentMinPrice)}</span>
                <button onClick={() => updateFilter('min_price', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentMaxPrice && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('max_price', currentMaxPrice)}</span>
                <button onClick={() => updateFilter('max_price', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentSize && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('size', currentSize)}</span>
                <button onClick={() => updateFilter('size', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentFabric && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('fabric', currentFabric)}</span>
                <button onClick={() => updateFilter('fabric', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentColor && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>{getActiveFilterLabel('color', currentColor)}</span>
                <button onClick={() => updateFilter('color', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentInStock && (
              <span className="inline-flex items-center space-x-1.5 bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] px-3 py-1 text-xs font-sans font-medium rounded-none">
                <Zap size={12} className="text-[#2D6A4F]" />
                <span>Ready to Ship</span>
                <button onClick={() => updateFilter('in_stock', '')} className="text-[#2D6A4F] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentNewArrival && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>New Arrivals</span>
                <button onClick={() => updateFilter('new_arrival', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            {currentSearch && (
              <span className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] text-[#1A1817] border border-[#D9D2C7] px-3 py-1 text-xs font-sans rounded-none">
                <span>Search: "{currentSearch}"</span>
                <button onClick={() => updateFilter('search', '')} className="text-[#766F68] hover:text-[#A43E38]"><X size={12} /></button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-[#A43E38] hover:underline font-semibold ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Catalog Main Layout (Sidebar + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP FILTER SIDEBAR (MYNTRA-INSPIRED INDIAN SHOPPING FILTERS) */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 border border-[#E8E2D9] h-fit sticky top-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
              <span className="text-xs font-sans tracking-[0.2em] uppercase font-bold text-[#1A1817]">
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-sans text-[#A43E38] uppercase tracking-wider font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Quick Fast Dispatch & Highlights */}
            <div className="space-y-2 pb-4 border-b border-[#E8E2D9]">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-sans">
                <input
                  type="checkbox"
                  checked={Boolean(currentInStock)}
                  onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-[#966355] border-[#D9D2C7] focus:ring-0 rounded-none cursor-pointer"
                />
                <span className="flex items-center space-x-1 text-[#2D6A4F] font-semibold">
                  <Zap size={13} />
                  <span>Ready to Ship (In Stock)</span>
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-sans">
                <input
                  type="checkbox"
                  checked={Boolean(currentNewArrival)}
                  onChange={(e) => updateFilter('new_arrival', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-[#966355] border-[#D9D2C7] focus:ring-0 rounded-none cursor-pointer"
                />
                <span className="text-[#231F1D]">New Season Arrivals</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-sans">
                <input
                  type="checkbox"
                  checked={Boolean(currentOnSale)}
                  onChange={(e) => updateFilter('on_sale', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-[#966355] border-[#D9D2C7] focus:ring-0 rounded-none cursor-pointer"
                />
                <span className="text-[#A43E38] font-medium">Special Offers & Sale</span>
              </label>
            </div>

            {/* 1. CATEGORIES FILTER */}
            <div className="border-b border-[#E8E2D9] pb-5">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-bold text-[#1A1817]"
              >
                <span>Categories</span>
                {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.category && (
                <div className="mt-3.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categoryFilters.map((cat) => {
                    const isSelected = currentCategory === cat.value;
                    return (
                      <label
                        key={cat.value}
                        className="flex items-center space-x-2.5 cursor-pointer group text-xs font-sans py-0.5"
                      >
                        <input
                          type="radio"
                          name="category_filter"
                          checked={isSelected}
                          onChange={() => updateFilter('category', cat.value)}
                          className="w-4 h-4 text-[#1A1817] border-[#D9D2C7] focus:ring-0 cursor-pointer"
                        />
                        <span className={`group-hover:text-[#966355] transition-colors ${
                          isSelected ? 'font-semibold text-[#1A1817]' : 'text-[#5A5551]'
                        }`}>
                          {cat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. PRICE SEGMENT (INR) */}
            <div className="border-b border-[#E8E2D9] pb-5">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-bold text-[#1A1817]"
              >
                <span>Price (₹ INR)</span>
                {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.price && (
                <div className="mt-3.5 space-y-2">
                  {priceSegments.map((seg) => {
                    const isSelected = currentPriceRange === seg.value && !currentMinPrice && !currentMaxPrice;
                    return (
                      <label
                        key={seg.value}
                        className="flex items-center space-x-2.5 cursor-pointer group text-xs font-sans py-0.5"
                      >
                        <input
                          type="radio"
                          name="price_filter"
                          checked={isSelected}
                          onChange={() => updateFilter('price_range', seg.value)}
                          className="w-4 h-4 text-[#1A1817] border-[#D9D2C7] focus:ring-0 cursor-pointer"
                        />
                        <span className={`group-hover:text-[#966355] transition-colors ${
                          isSelected ? 'font-semibold text-[#1A1817]' : 'text-[#5A5551]'
                        }`}>
                          {seg.label}
                        </span>
                      </label>
                    );
                  })}

                  {/* Custom Min-Max Price Inputs */}
                  <form onSubmit={handleApplyCustomPrice} className="mt-3 pt-3 border-t border-[#F0EBE3] flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-1/2 bg-[#FAF8F5] border border-[#E8E2D9] text-[11px] p-1.5 text-[#1A1817] focus:outline-none focus:border-[#1A1817]"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      className="w-1/2 bg-[#FAF8F5] border border-[#E8E2D9] text-[11px] p-1.5 text-[#1A1817] focus:outline-none focus:border-[#1A1817]"
                    />
                    <button
                      type="submit"
                      className="bg-[#1A1817] text-white text-[10px] font-sans tracking-widest uppercase px-2.5 py-2 hover:bg-[#966355] transition-colors"
                    >
                      Go
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 3. INDIAN SIZING */}
            <div className="border-b border-[#E8E2D9] pb-5">
              <button
                onClick={() => toggleSection('size')}
                className="w-full flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-bold text-[#1A1817]"
              >
                <span>Size (Indian Fit)</span>
                {openSections.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.size && (
                <div className="mt-3.5 grid grid-cols-3 gap-2">
                  {sizeOptions.map((sz) => {
                    const isSelected = currentSize === sz.label;
                    return (
                      <button
                        key={sz.label}
                        onClick={() => updateFilter('size', isSelected ? '' : sz.label)}
                        className={`p-2 text-center border transition-all ${
                          isSelected
                            ? 'border-[#1A1817] bg-[#1A1817] text-white'
                            : 'border-[#E8E2D9] bg-white text-[#231F1D] hover:border-[#966355]'
                        }`}
                      >
                        <div className="text-xs font-bold font-sans">{sz.label}</div>
                        <div className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-[#766F68]'}`}>
                          {sz.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. HERITAGE FABRICS */}
            <div className="border-b border-[#E8E2D9] pb-5">
              <button
                onClick={() => toggleSection('fabric')}
                className="w-full flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-bold text-[#1A1817]"
              >
                <span>Fabric & Weave</span>
                {openSections.fabric ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.fabric && (
                <div className="mt-3.5 space-y-2">
                  {fabricOptions.map((fab) => {
                    const isSelected = currentFabric === fab.value;
                    return (
                      <label
                        key={fab.value}
                        className="flex items-center space-x-2.5 cursor-pointer group text-xs font-sans py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => updateFilter('fabric', isSelected ? '' : fab.value)}
                          className="w-4 h-4 text-[#1A1817] border-[#D9D2C7] focus:ring-0 rounded-none cursor-pointer"
                        />
                        <span className={`group-hover:text-[#966355] transition-colors ${
                          isSelected ? 'font-semibold text-[#1A1817]' : 'text-[#5A5551]'
                        }`}>
                          {fab.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. COLOR PALETTE */}
            <div>
              <button
                onClick={() => toggleSection('color')}
                className="w-full flex items-center justify-between text-xs font-sans tracking-[0.18em] uppercase font-bold text-[#1A1817]"
              >
                <span>Color Palette</span>
                {openSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.color && (
                <div className="mt-3.5 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {colorOptions.map((col) => {
                    const isSelected = currentColor === col.name;
                    return (
                      <button
                        key={col.name}
                        onClick={() => updateFilter('color', isSelected ? '' : col.name)}
                        className={`w-full flex items-center space-x-2.5 p-1 rounded-none text-left text-xs font-sans transition-colors ${
                          isSelected ? 'bg-[#FAF7F2] font-semibold text-[#1A1817]' : 'hover:bg-[#FAF8F5] text-[#5A5551]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border shrink-0 inline-block shadow-xs"
                          style={{ backgroundColor: col.hex, borderColor: col.border }}
                        />
                        <span className="flex-1 truncate">{col.name}</span>
                        {isSelected && <Check size={12} className="text-[#1A1817]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="space-y-3 bg-white p-3 border border-[#E8E2D9]">
                    <div className="aspect-[3/4] bg-[#E8E2D9]" />
                    <div className="h-4 bg-[#E8E2D9] w-3/4" />
                    <div className="h-3 bg-[#E8E2D9] w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E8E2D9] p-8 space-y-5">
                <div className="w-12 h-12 mx-auto bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#966355]">
                  <SearchIcon size={22} />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1817]">No silhouettes match your chosen filters</h3>
                <p className="text-xs font-sans text-[#766F68] max-w-sm mx-auto leading-relaxed">
                  Try adjusting or resetting your filter criteria to view our handloom chanderi, mulberry silks, and ethnic coordinates.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase px-8 py-3 hover:bg-[#966355] transition-colors shadow-sm"
                >
                  View All Silhouettes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
                {products.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={idx < 4}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* MOBILE 2-COLUMN FILTER DRAWER (LIKE MYNTRA / AJIO) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-[#1A1817]/60 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
            <div className="w-screen max-w-md bg-[#FAF8F5] flex flex-col shadow-2xl">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D9] bg-white">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={18} className="text-[#1A1817]" />
                  <h3 className="font-serif text-lg text-[#1A1817]">Filters</h3>
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#766F68] hover:text-[#1A1817]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 2-Column Split: Left Tabs, Right Options (Exact Myntra Flow) */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Left Category Tabs */}
                <div className="w-2/5 bg-[#F4EFEB] border-r border-[#E8E2D9] overflow-y-auto text-xs font-sans">
                  {[
                    { id: 'category', label: 'Categories' },
                    { id: 'price', label: 'Price Range' },
                    { id: 'size', label: 'Indian Size' },
                    { id: 'fabric', label: 'Fabric' },
                    { id: 'color', label: 'Color' },
                    { id: 'more', label: 'Availability' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMobileTab(tab.id as any)}
                      className={`w-full text-left px-4 py-3.5 border-b border-[#E8E2D9] transition-colors flex items-center justify-between ${
                        activeMobileTab === tab.id
                          ? 'bg-white font-bold text-[#A43E38] border-l-4 border-l-[#A43E38]'
                          : 'text-[#5A5551] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Right Options Column */}
                <div className="w-3/5 bg-white p-4 overflow-y-auto text-xs font-sans">
                  
                  {/* Category Options */}
                  {activeMobileTab === 'category' && (
                    <div className="space-y-3">
                      {categoryFilters.map((cat) => (
                        <label key={cat.value} className="flex items-center space-x-2.5 cursor-pointer py-1">
                          <input
                            type="radio"
                            name="m_category"
                            checked={currentCategory === cat.value}
                            onChange={() => updateFilter('category', cat.value)}
                            className="w-4 h-4 text-[#1A1817]"
                          />
                          <span className={currentCategory === cat.value ? 'font-bold text-[#A43E38]' : 'text-[#3E3A37]'}>
                            {cat.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Price Options */}
                  {activeMobileTab === 'price' && (
                    <div className="space-y-3">
                      {priceSegments.map((seg) => (
                        <label key={seg.value} className="flex items-center space-x-2.5 cursor-pointer py-1">
                          <input
                            type="radio"
                            name="m_price"
                            checked={currentPriceRange === seg.value}
                            onChange={() => updateFilter('price_range', seg.value)}
                            className="w-4 h-4 text-[#1A1817]"
                          />
                          <span className={currentPriceRange === seg.value ? 'font-bold text-[#A43E38]' : 'text-[#3E3A37]'}>
                            {seg.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Size Options */}
                  {activeMobileTab === 'size' && (
                    <div className="grid grid-cols-2 gap-2">
                      {sizeOptions.map((sz) => (
                        <button
                          key={sz.label}
                          onClick={() => updateFilter('size', currentSize === sz.label ? '' : sz.label)}
                          className={`p-2.5 border text-center ${
                            currentSize === sz.label ? 'bg-[#1A1817] text-white border-[#1A1817]' : 'bg-[#FAF8F5] border-[#E8E2D9]'
                          }`}
                        >
                          <div className="font-bold">{sz.label}</div>
                          <div className="text-[9px] opacity-80">{sz.sub}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Fabric Options */}
                  {activeMobileTab === 'fabric' && (
                    <div className="space-y-3">
                      {fabricOptions.map((fab) => (
                        <label key={fab.value} className="flex items-center space-x-2.5 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={currentFabric === fab.value}
                            onChange={() => updateFilter('fabric', currentFabric === fab.value ? '' : fab.value)}
                            className="w-4 h-4 text-[#1A1817]"
                          />
                          <span className={currentFabric === fab.value ? 'font-bold text-[#A43E38]' : 'text-[#3E3A37]'}>
                            {fab.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Color Options */}
                  {activeMobileTab === 'color' && (
                    <div className="space-y-2">
                      {colorOptions.map((col) => (
                        <button
                          key={col.name}
                          onClick={() => updateFilter('color', currentColor === col.name ? '' : col.name)}
                          className={`w-full flex items-center space-x-2 p-1.5 ${
                            currentColor === col.name ? 'bg-[#FAF7F2] font-bold text-[#1A1817]' : ''
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border shrink-0"
                            style={{ backgroundColor: col.hex, borderColor: col.border }}
                          />
                          <span className="truncate">{col.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Availability Options */}
                  {activeMobileTab === 'more' && (
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2.5 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={Boolean(currentInStock)}
                          onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                          className="w-4 h-4 text-[#1A1817]"
                        />
                        <span className="text-[#2D6A4F] font-semibold">⚡ Ready to Ship (In Stock)</span>
                      </label>
                      <label className="flex items-center space-x-2.5 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={Boolean(currentNewArrival)}
                          onChange={(e) => updateFilter('new_arrival', e.target.checked ? 'true' : '')}
                          className="w-4 h-4 text-[#1A1817]"
                        />
                        <span>New Season Arrivals</span>
                      </label>
                      <label className="flex items-center space-x-2.5 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={Boolean(currentOnSale)}
                          onChange={(e) => updateFilter('on_sale', e.target.checked ? 'true' : '')}
                          className="w-4 h-4 text-[#1A1817]"
                        />
                        <span className="text-[#A43E38] font-medium">Special Offers & Sale</span>
                      </label>
                    </div>
                  )}

                </div>

              </div>

              {/* Drawer Sticky Footer Action Bar */}
              <div className="p-4 border-t border-[#E8E2D9] bg-white flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="w-1/2 border border-[#1A1817] py-3 text-xs tracking-widest uppercase font-semibold text-[#1A1817] hover:bg-[#FAF8F5]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 bg-[#1A1817] text-white py-3 text-xs tracking-widest uppercase font-semibold hover:bg-[#966355]"
                >
                  Apply ({products.length})
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
