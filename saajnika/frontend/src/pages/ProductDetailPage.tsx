import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Ruler,
  Check, AlertCircle, ChevronDown, ChevronUp, Share2
} from 'lucide-react';
import api, { safeArray, cachedGet } from '../services/api';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/catalog/ProductCard';
import { SEED_PRODUCTS } from '../data/seedData';
import { optimizeImageUrl } from '../utils/image';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Accordion toggles
  const [openSection, setOpenSection] = useState<'fabric' | 'fit' | 'shipping' | null>('fabric');

  // Pincode Check
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<any>(null);

  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await cachedGet(`/catalog/products/${slug}/`);
        const prodData: Product = res.data;
        setProduct(prodData);
        const initialImg = prodData.primary_image || (prodData.images && prodData.images.length > 0 ? prodData.images[0].image_url : '');
        setSelectedImage(initialImg);

        if (prodData.variants && prodData.variants.length > 0) {
          const firstInStock = prodData.variants.find((v) => v.stock_quantity > 0) || prodData.variants[0];
          setSelectedSize(firstInStock.size);
          setSelectedColor(firstInStock.color_name);
        }

        // Fetch related products in the same category
        if (prodData.category?.slug) {
          const relRes = await cachedGet(`/catalog/products/?category=${prodData.category.slug}`);
          setRelatedProducts(
            safeArray<Product>(relRes.data)
              .filter((p: Product) => p.id !== prodData.id)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.warn('Failed to fetch product from backend; utilizing embedded boutique seed cache', err);
        const fallback = SEED_PRODUCTS.find(p => p.slug === slug) || SEED_PRODUCTS[0];
        if (fallback) {
          setProduct(fallback);
          setSelectedImage(fallback.primary_image);
          if (fallback.variants && fallback.variants.length > 0) {
            setSelectedSize(fallback.variants[0].size);
            setSelectedColor(fallback.variants[0].color_name);
          }
          setRelatedProducts(SEED_PRODUCTS.filter(p => p.id !== fallback.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);

      const handleUpdate = () => {
        fetchProduct();
      };
      window.addEventListener('saajnika:data_updated', handleUpdate);
      window.addEventListener('focus', handleUpdate);

      return () => {
        window.removeEventListener('saajnika:data_updated', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      };
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-[#E8E2D9]" />
        <div className="space-y-4">
          <div className="h-8 bg-[#E8E2D9] w-3/4" />
          <div className="h-4 bg-[#E8E2D9] w-1/3" />
          <div className="h-20 bg-[#E8E2D9] w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="font-serif text-3xl">Silhouette Not Found</h2>
        <Link to="/shop" className="mt-4 inline-block underline text-xs font-sans tracking-widest uppercase">
          Return to Atelier Collections
        </Link>
      </div>
    );
  }

  const activeVariant: ProductVariant | undefined = product.variants?.find(
    (v) => v.size === selectedSize && v.color_name === selectedColor
  ) || product.variants?.[0];

  const handleAddToBag = async (buyNow = false) => {
    if (!activeVariant) return;
    const res = await addItem(activeVariant.id, quantity);
    if (res.success) {
      if (buyNow) {
        navigate('/checkout');
      } else {
        setAddedNotice(true);
        setTimeout(() => setAddedNotice(false), 2000);
      }
    }
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await api.get(`/shipping/pincode/${pincode}/`);
      setPincodeResult(res.data);
    } catch (err: any) {
      setPincodeResult({ serviceable: false, message: 'PIN code not currently serviceable.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const isFavorited = isInWishlist(product.id);
  const currentPrice = Number(product.current_price || product.base_price);
  const basePrice = Number(product.base_price);
  const hasDiscount = product.sale_price && currentPrice < basePrice;

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D]">
      
      {/* Breadcrumb Path */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[11px] font-sans text-[#766F68] flex items-center space-x-2">
        <Link to="/" className="hover:text-[#1A1817]">Atelier</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#1A1817]">Collections</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-[#1A1817]">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#1A1817] truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Gallery Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Vertical Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] scrollbar-none">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-18 h-24 flex-shrink-0 border overflow-hidden transition-all ${
                      selectedImage === img.image_url
                        ? 'border-[#1A1817] ring-1 ring-[#1A1817]'
                        : 'border-[#E8E2D9] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(img.image_url, 160, 70)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image Frame (Portrait 3:4) */}
            <div className="flex-1 aspect-[3/4] bg-[#F5F1EB] border border-[#E8E2D9] overflow-hidden relative shadow-sm">
              <img
                src={optimizeImageUrl(
                  selectedImage || product.primary_image || (product.images && product.images.length > 0 ? product.images[0].image_url : ''),
                  1000,
                  80
                )}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-all duration-300"
                fetchPriority="high"
                decoding="async"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#966355] text-white text-[10px] font-sans tracking-[0.2em] uppercase px-3 py-1">
                  {product.discount_percent}% Atelier Privilege
                </span>
              )}
            </div>

          </div>

          {/* Product Meta & Purchase Actions (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              <span className="text-[11px] font-sans tracking-[0.22em] uppercase text-[#966355] font-medium block">
                {product.category?.name || product.collection_name || 'Saajnika Atelier'}
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-normal leading-tight mt-1">
                {product.name}
              </h1>

              <div className="mt-2 text-xs font-sans text-[#766F68]">
                SKU: <span className="font-mono text-[#231F1D]">{activeVariant?.sku || product.sku}</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-2 flex items-baseline space-x-3">
              <span className="font-sans text-2xl font-medium text-[#1A1817]">
                ₹{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="font-sans text-sm text-[#766F68] line-through">
                  ₹{basePrice.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] font-sans text-[#3D6B52] bg-[#3D6B52]/10 px-2 py-0.5">
                Inclusive of all taxes
              </span>
            </div>

            {/* Narrative / Short Summary */}
            <p className="text-xs sm:text-sm font-sans text-[#766F68] leading-relaxed border-t border-b border-[#E8E2D9] py-4">
              {product.short_description || product.description}
            </p>

            {/* Color Swatch Selection */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div>
                <label className="text-xs font-sans tracking-[0.16em] uppercase text-[#1A1817] font-semibold block mb-2">
                  Artisan Color: <span className="font-normal text-[#766F68]">{selectedColor}</span>
                </label>
                <div className="flex items-center space-x-3">
                  {product.available_colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c.color_name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                        selectedColor === c.color_name ? 'border-[#1A1817] scale-110' : 'border-transparent'
                      }`}
                      title={c.color_name}
                    >
                      <span
                        className="w-full h-full rounded-full block border border-[#D9D2C7]"
                        style={{ backgroundColor: c.color_hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector & Size Guide Link */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-sans tracking-[0.16em] uppercase text-[#1A1817] font-semibold">
                    Select Size
                  </label>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] font-sans text-[#966355] hover:underline flex items-center space-x-1"
                  >
                    <Ruler size={13} />
                    <span>Bespoke Size Chart</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.available_sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-12 h-11 text-xs font-sans border transition-all ${
                        selectedSize === sz
                          ? 'border-[#1A1817] bg-[#1A1817] text-white font-medium'
                          : 'border-[#E8E2D9] bg-white text-[#231F1D] hover:border-[#966355]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator */}
            <div className="text-xs font-sans">
              {activeVariant ? (
                activeVariant.stock_quantity > 0 ? (
                  activeVariant.stock_quantity <= 3 ? (
                    <span className="text-[#966355] flex items-center gap-1.5 font-medium">
                      <AlertCircle size={14} /> Only {activeVariant.stock_quantity} left in our atelier
                    </span>
                  ) : (
                    <span className="text-[#3D6B52] flex items-center gap-1.5 font-medium">
                      <Check size={14} /> In Stock • Ready for immediate courier dispatch
                    </span>
                  )
                ) : (
                  <span className="text-[#A43E38] font-medium">Temporarily out of stock in this size</span>
                )
              ) : null}
            </div>

            {/* Purchase CTA Buttons */}
            <div className="pt-2 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToBag(false)}
                  disabled={!activeVariant?.is_in_stock}
                  className="flex-1 bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-4 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  <span>{addedNotice ? 'Added to Bag ✓' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`px-5 border border-[#E8E2D9] transition-colors ${
                    isFavorited ? 'bg-[#966355] text-white border-[#966355]' : 'bg-white text-[#231F1D] hover:bg-[#F5F1EB]'
                  }`}
                  title="Wishlist"
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>
              </div>

              <button
                onClick={() => handleAddToBag(true)}
                disabled={!activeVariant?.is_in_stock}
                className="w-full border border-[#1A1817] text-[#1A1817] hover:bg-[#1A1817] hover:text-white text-xs font-sans tracking-[0.2em] uppercase py-3.5 transition-colors disabled:opacity-50"
              >
                Instant Buy Now
              </button>
            </div>

            {/* Pincode Serviceability Checker */}
            <div className="pt-4 border-t border-[#E8E2D9]">
              <label className="text-[11px] font-sans tracking-[0.16em] uppercase text-[#231F1D] font-medium block mb-2">
                Estimate Courier Arrival
              </label>
              <form onSubmit={handleCheckPincode} className="flex">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code"
                  className="w-full border border-[#E8E2D9] px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:border-[#1A1817] bg-white"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="bg-[#231F1D] text-white text-[10px] font-sans tracking-widest uppercase px-4 py-2.5 hover:bg-[#966355] transition-colors disabled:opacity-50"
                >
                  {pincodeLoading ? 'Checking...' : 'Check'}
                </button>
              </form>
              {pincodeResult && (
                <div className={`mt-2 text-xs font-sans p-2.5 border ${pincodeResult.serviceable ? 'bg-[#3D6B52]/10 border-[#3D6B52]/20 text-[#3D6B52]' : 'bg-[#A43E38]/10 border-[#A43E38]/20 text-[#A43E38]'}`}>
                  {pincodeResult.message}
                </div>
              )}
            </div>

            {/* Accordion Specification Sections */}
            <div className="pt-4 border-t border-[#E8E2D9] divide-y divide-[#E8E2D9] text-xs font-sans">
              
              {/* Fabric & Care */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'fabric' ? null : 'fabric')}
                  className="w-full py-3.5 flex justify-between items-center text-left uppercase tracking-wider font-medium text-[#1A1817]"
                >
                  <span>Textile Composition & Care</span>
                  {openSection === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === 'fabric' && (
                  <div className="pb-4 text-[#766F68] leading-relaxed">
                    {product.fabric_and_care || '100% Handloom Chanderi Silk Cotton. Dry clean only. Iron on reverse at moderate silk temperature.'}
                  </div>
                )}
              </div>

              {/* Fit & Sizing */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'fit' ? null : 'fit')}
                  className="w-full py-3.5 flex justify-between items-center text-left uppercase tracking-wider font-medium text-[#1A1817]"
                >
                  <span>Silhouette, Fit & Drape</span>
                  {openSection === 'fit' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === 'fit' && (
                  <div className="pb-4 text-[#766F68] leading-relaxed">
                    {product.fit_and_sizing || 'Relaxed tailored drape. Model is 5\'9" and wearing size S. Length: 46 inches.'}
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div>
                <button
                  onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                  className="w-full py-3.5 flex justify-between items-center text-left uppercase tracking-wider font-medium text-[#1A1817]"
                >
                  <span>Atelier Dispatch & 7-Day Exchange</span>
                  {openSection === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSection === 'shipping' && (
                  <div className="pb-4 text-[#766F68] leading-relaxed">
                    {product.shipping_and_returns || 'Dispatches in 24-48 hours. Complimentary domestic courier on orders above ₹3,999. Doorstep size exchange within 7 days.'}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Related Silhouettes Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#E8E2D9]">
            <div className="text-center mb-12">
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] block mb-1">
                The Atelier Suggests
              </span>
              <h3 className="font-serif text-3xl text-[#1A1817]">
                Harmonious Silhouettes
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bespoke Size Chart Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-[#1A1817]/60" onClick={() => setIsSizeGuideOpen(false)} />
            <div className="relative bg-[#FAF8F5] max-w-xl w-full p-8 border border-[#E8E2D9] shadow-2xl">
              <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4">
                <ChevronDown size={20} />
              </button>
              <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355]">Bespoke Measurement</span>
              <h3 className="font-serif text-2xl text-[#1A1817] mt-1 mb-4">Saajnika Sizing Chart</h3>
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E2D9] text-left text-[#766F68]">
                    <th className="py-2">Size</th>
                    <th className="py-2">Bust (in)</th>
                    <th className="py-2">Waist (in)</th>
                    <th className="py-2">Hip (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  <tr><td className="py-2 font-medium">XS (32)</td><td>32 - 34</td><td>26 - 28</td><td>36 - 38</td></tr>
                  <tr><td className="py-2 font-medium">S (34)</td><td>34 - 36</td><td>28 - 30</td><td>38 - 40</td></tr>
                  <tr><td className="py-2 font-medium">M (36)</td><td>36 - 38</td><td>30 - 32</td><td>40 - 42</td></tr>
                  <tr><td className="py-2 font-medium">L (38)</td><td>38 - 40</td><td>32 - 34</td><td>42 - 44</td></tr>
                  <tr><td className="py-2 font-medium">XL (40)</td><td>40 - 42</td><td>34 - 36</td><td>44 - 46</td></tr>
                </tbody>
              </table>
              <p className="text-[11px] font-sans text-[#766F68] mt-4">
                All garments are cut with 2-inch internal seam margins to allow personal tailoring adjustments.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
