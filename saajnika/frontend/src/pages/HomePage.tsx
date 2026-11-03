import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import api, { safeArray, cachedGet } from '../services/api';
import { Product, Category, HomepageBanner } from '../types';
import { ProductCard } from '../components/catalog/ProductCard';
import { QuickViewModal } from '../components/catalog/QuickViewModal';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_HERO_BANNER } from '../data/seedData';
import { optimizeImageUrl } from '../utils/image';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [heroBanner, setHeroBanner] = useState<HomepageBanner | null>(SEED_HERO_BANNER);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes, bannerRes] = await Promise.all([
          cachedGet('/catalog/products/?featured=true'),
          cachedGet('/catalog/categories/'),
          cachedGet('/cms/banners/'),
        ]);

        const prods = safeArray<Product>(prodRes.data);
        const cats = safeArray<Category>(catRes.data);
        const banners = safeArray<HomepageBanner>(bannerRes.data);

        setFeaturedProducts(prods.length > 0 ? prods : SEED_PRODUCTS);
        if (cats.length > 0) setCategories(cats);

        if (banners.length > 0) {
          const hero = banners.find((b: HomepageBanner) => b.banner_type === 'HERO') || banners[0];
          setHeroBanner(hero || null);
        }
      } catch (err) {
        console.warn('Backend connecting or offline; utilizing embedded boutique seed cache');
        setFeaturedProducts(SEED_PRODUCTS);
        setCategories(SEED_CATEGORIES);
        setHeroBanner(SEED_HERO_BANNER);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Auto-refresh when admin modifies products, banners, or categories
    const handleUpdate = () => fetchHomeData();
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#231F1D]">
      
      {/* =========================================================================
          1. THE FIRST 5 SECONDS — EDITORIAL HERO MASTERPIECE
          No AI-slop gradients. Pure typographic confidence, luxury photography.
      ========================================================================= */}
      <section className="relative border-b border-[#E8E2D9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left 7 Columns: Editorial Headline, Narrative, and Main Image */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              {/* Kicker badge */}
              <div className="flex items-center space-x-3">
                <span className="w-6 h-[1px] bg-[#966355]" />
                <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium">
                  {heroBanner?.kicker || 'COLLECTION 04 / WINTER SOLSTICE'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-light text-[#1A1817] leading-[1.05] tracking-tight">
                {heroBanner?.title || 'Poetry in Pure Weave.'}
              </h1>

              {/* Editorial Subtext */}
              <p className="text-sm sm:text-base font-sans text-[#766F68] max-w-xl leading-relaxed">
                {heroBanner?.subtitle ||
                  'Crafted by master artisan families in Maheshwar and Varanasi. Hand-reeled silks and sculpted organic textiles designed for quiet grace.'}
              </p>

              {/* Call-to-Action Group */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
                <Link
                  to={heroBanner?.cta_link || '/shop'}
                  className="bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase px-8 py-4 hover:bg-[#966355] transition-all duration-300 shadow-sm flex items-center space-x-2 group"
                >
                  <span>{heroBanner?.cta_text || 'Discover The Edit'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/shop?category=the-silk-edit"
                  className="text-xs font-sans tracking-[0.18em] uppercase text-[#231F1D] hover:text-[#966355] py-2 border-b border-[#231F1D] hover:border-[#966355] transition-all"
                >
                  Explore The Atelier →
                </Link>
              </div>

              {/* Provenance Micro-Notes */}
              <div className="pt-6 border-t border-[#E8E2D9] grid grid-cols-3 gap-4 text-xs font-sans text-[#766F68]">
                <div>
                  <strong className="block text-[#1A1817] font-medium font-serif text-sm">100% Handloom</strong>
                  <span>Maheshwari & Chanderi</span>
                </div>
                <div>
                  <strong className="block text-[#1A1817] font-medium font-serif text-sm">Silk Mark</strong>
                  <span>Certified Mulberry Pure</span>
                </div>
                <div>
                  <strong className="block text-[#1A1817] font-medium font-serif text-sm">Limited Edition</strong>
                  <span>Zero Mass Production</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Asymmetrical Editorial Portrait Framing */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F1EB] border border-[#E8E2D9] shadow-sm group">
                <img
                  src={optimizeImageUrl(
                    heroBanner?.image_url ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
                    1000,
                    80
                  )}
                  alt="Saajnika Winter Solstice Campaign"
                  className="w-full h-full object-cover object-top luxury-zoom transition-transform duration-700"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Floating Lookbook Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 border border-[#E8E2D9] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-sans tracking-[0.2em] uppercase text-[#966355] block">
                      Lookbook 01
                    </span>
                    <span className="font-serif text-sm text-[#1A1817] block">
                      The Noor Chanderi Set
                    </span>
                    <span className="text-xs font-sans text-[#766F68]">₹6,990</span>
                  </div>
                  <Link
                    to="/shop?category=contemporary-ethnic"
                    className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#1A1817] hover:text-[#966355] underline"
                  >
                    View Silhouette
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CURATED CHAPTERS / CATEGORY TILES
          Architectural fashion frames with generous whitespace.
      ========================================================================= */}
      <section className="py-20 border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block mb-1">
                Curated Chapters
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-light">
                Shop By Editorial Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-4 md:mt-0 text-xs font-sans tracking-[0.18em] uppercase text-[#1A1817] hover:text-[#966355] flex items-center space-x-1"
            >
              <span>Explore All Silhouettes</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {safeArray(categories).slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative flex flex-col bg-white border border-[#E8E2D9] overflow-hidden"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#F5F1EB]">
                  <img
                    src={optimizeImageUrl(cat.image_url, 480, 75)}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="font-serif text-xl text-[#1A1817] font-normal group-hover:text-[#966355] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-sans text-[#766F68] mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.tagline || cat.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#F5F1EB] flex items-center justify-between text-[11px] font-sans tracking-[0.16em] uppercase text-[#1A1817]">
                    <span>Discover</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. NEW SEASON ARRIVALS — EDITORIAL PRODUCT GRID
      ========================================================================= */}
      <section className="py-20 border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block mb-1">
                The Atelier Drop
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1817] font-light">
                New Season Arrivals
              </h2>
            </div>
            <Link
              to="/shop?new_arrival=true"
              className="mt-4 md:mt-0 text-xs font-sans tracking-[0.18em] uppercase text-[#1A1817] hover:text-[#966355] flex items-center space-x-1"
            >
              <span>View Full Lookbook</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {safeArray(featuredProducts).slice(0, 4).map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 2}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. THE ATELIER MANIFESTO — EDITORIAL SPREAD
          Double-page magazine story celebrating honest craftsmanship.
      ========================================================================= */}
      <section className="py-24 bg-[#FAF8F5] border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#E8E2D9] shadow-sm">
                <img
                  src={optimizeImageUrl("https://images.unsplash.com/photo-1539109136881-3be0616acf4b", 800, 75)}
                  alt="Saajnika Craft & Textile Weaving"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium">
                The Atelier Manifesto
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1817] font-light leading-snug">
                The Architecture of Silk & Linen
              </h2>
              <p className="text-sm font-sans text-[#766F68] leading-relaxed">
                We reject seasonal mass production in favor of enduring silhouettes. Every Saajnika garment begins in historic weaving clusters across Maheshwar, Varanasi, and Chanderi.
              </p>
              <p className="text-sm font-sans text-[#766F68] leading-relaxed">
                Our master weavers hand-reel the fibers, mix botanical dye formulations in small vats, and shape hems with tailored French seams. The result is a garment that retains its poise for decades.
              </p>
              <div className="pt-4">
                <Link
                  to="/shop?category=the-silk-edit"
                  className="inline-block bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase px-8 py-4 hover:bg-[#966355] transition-colors"
                >
                  Discover The Silk Edit
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BOUTIQUE CLIENT GUARANTEES
          Typographic standards replacing generic clipart icons.
      ========================================================================= */}
      <section className="py-16 border-b border-[#E8E2D9] bg-[#F5F1EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
            
            <div className="space-y-2">
              <span className="text-[10px] font-sans tracking-[0.2em] text-[#966355] uppercase block font-medium">
                01 / Bespoke Fit
              </span>
              <h4 className="font-serif text-lg text-[#1A1817]">Complimentary Tailoring Advice</h4>
              <p className="text-xs font-sans text-[#766F68] leading-relaxed">
                Our atelier stylists provide personal sizing and styling guidance prior to dispatch.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans tracking-[0.2em] text-[#966355] uppercase block font-medium">
                02 / Logistics
              </span>
              <h4 className="font-serif text-lg text-[#1A1817]">Insured Express Courier</h4>
              <p className="text-xs font-sans text-[#766F68] leading-relaxed">
                Complimentary domestic courier on all orders over ₹3,999. Fully transit-insured.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans tracking-[0.2em] text-[#966355] uppercase block font-medium">
                03 / Assurance
              </span>
              <h4 className="font-serif text-lg text-[#1A1817]">7-Day Salon Exchange</h4>
              <p className="text-xs font-sans text-[#766F68] leading-relaxed">
                Hassle-free doorstep exchanges if the drape or fit requires adjustment.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans tracking-[0.2em] text-[#966355] uppercase block font-medium">
                04 / Provenance
              </span>
              <h4 className="font-serif text-lg text-[#1A1817]">Certified Pure Handlooms</h4>
              <p className="text-xs font-sans text-[#766F68] leading-relaxed">
                All silks carry verified Silk Mark certification and artisan fair trade origin stamps.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
