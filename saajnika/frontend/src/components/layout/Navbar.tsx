import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWomenMegaMenuOpen, setIsWomenMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { totalItems, openCart, subtotal } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on page route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsWomenMegaMenuOpen(false);
  }, [location.pathname, location.search]);

  // Track scroll state for smooth navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_2px_12px_rgba(26,24,23,0.06)] border-b border-[#E8E2D9]' 
          : 'bg-[#FAF8F5] border-b border-[#E8E2D9]'
      }`}
      onMouseLeave={() => setIsWomenMegaMenuOpen(false)}
    >
      {/* Editorial Announcement Bar */}
      <div className="bg-[#1A1817] text-[#FAF8F5] text-[11px] font-sans tracking-[0.2em] uppercase py-2 px-4 text-center border-b border-[#2C2826] transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
          <span className="opacity-90">COMPLIMENTARY DOMESTIC COURIER OVER ₹3,999</span>
          <span className="opacity-40">•</span>
          <span className="text-[#C5A880] hidden sm:inline font-medium tracking-[0.22em]">
            THE WINTER SOLSTICE EDIT LIVE
          </span>
        </div>
      </div>

      {/* Main Architectural Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 transition-all duration-300">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#231F1D] hover:text-[#966355] transition-colors"
              aria-label="Open Navigation"
            >
              {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Left Editorial Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-7 text-[12px] font-sans tracking-[0.16em] uppercase font-medium text-[#231F1D]">
            {/* WOMEN with Curated Mega Dropdown trigger */}
            <div 
              className="relative py-6"
              onMouseEnter={() => setIsWomenMegaMenuOpen(true)}
            >
              <Link 
                to="/shop" 
                onClick={() => setIsWomenMegaMenuOpen(false)}
                className={`transition-colors py-1 flex items-center space-x-1 ${
                  isWomenMegaMenuOpen 
                    ? 'text-[#966355] font-semibold border-b-2 border-[#966355]' 
                    : 'hover:text-[#966355]'
                }`}
              >
                <span>WOMEN</span>
              </Link>
            </div>

            <Link 
              to="/shop?category=kurtas-suits" 
              className="hover:text-[#966355] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#966355] hover:after:w-full after:transition-all"
            >
              Indian & Fusion
            </Link>

            <Link 
              to="/shop?category=sarees" 
              className="hover:text-[#966355] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#966355] hover:after:w-full after:transition-all"
            >
              Sarees
            </Link>

            <Link 
              to="/shop?new_arrival=true" 
              className="hover:text-[#966355] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#966355] hover:after:w-full after:transition-all"
            >
              New Arrivals
            </Link>

            <Link 
              to="/shop?collection=Winter+Solstice" 
              className="hover:text-[#966355] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#966355] hover:after:w-full after:transition-all"
            >
              Winter Solstice
            </Link>
          </nav>

          {/* Center Brand Wordmark */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link to="/" className="inline-block group py-1">
              <span className="block font-serif text-3xl sm:text-4xl tracking-[0.24em] text-[#1A1817] font-normal uppercase transition-transform duration-300 group-hover:scale-[1.015]">
                SAAJNIKA
              </span>
              <span className="block text-[9px] font-sans tracking-[0.32em] uppercase text-[#766F68] -mt-1 group-hover:text-[#966355] transition-colors">
                Atelier • New Delhi
              </span>
            </Link>
          </div>

          {/* Right Actions: Search, Account, Wishlist, Bag */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-[#231F1D]">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 hover:text-[#966355] transition-colors duration-200"
              title="Search Collections"
              aria-label="Search Collections"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Account / Admin Link */}
            <Link
              to={isAuthenticated ? (isAdmin ? '/admin' : '/account') : '/login'}
              className="p-1.5 hover:text-[#966355] transition-colors duration-200 flex items-center space-x-1.5"
              title={isAuthenticated ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Sign In'}
            >
              <User size={20} strokeWidth={1.5} />
              {isAdmin && (
                <span className="hidden xl:inline text-[9px] tracking-widest uppercase bg-[#1A1817] text-[#FAF8F5] px-1.5 py-0.5 font-sans">
                  Admin
                </span>
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-1.5 hover:text-[#966355] transition-colors duration-200 relative"
              title="Curated Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {totalWishlist > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#966355] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openCart}
              className="p-1.5 hover:text-[#966355] transition-colors duration-200 relative flex items-center space-x-2"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1A1817] text-[#FAF8F5] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                    {totalItems}
                  </span>
                )}
              </div>
              {subtotal > 0 && (
                <span className="hidden md:inline text-[12px] font-sans tracking-wide text-[#766F68]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CURATED WOMEN MEGA MENU (Desktop Dropdown with Brand Palette) */}
      {isWomenMegaMenuOpen && (
        <div 
          className="absolute left-0 right-0 top-full bg-[#FAF8F5] border-b border-[#E8E2D9] shadow-xl transition-all duration-300 z-50 animate-fade-in"
          onMouseEnter={() => setIsWomenMegaMenuOpen(true)}
          onMouseLeave={() => setIsWomenMegaMenuOpen(false)}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-4 gap-8 font-sans">
            
            {/* Column 1: Indian & Fusion Wear */}
            <div className="space-y-4">
              <h4 className="font-serif text-[15px] font-semibold text-[#966355] tracking-[0.1em] uppercase border-b border-[#E8E2D9] pb-2">
                Indian & Fusion Wear
              </h4>
              <ul className="space-y-2 text-[13px] text-[#3E3A37]">
                <li>
                  <Link 
                    to="/shop?category=kurtas-suits" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Kurtas & Suits Ensembles
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=contemporary-ethnic" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Kurtis, Tunics & Angrakhas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=sarees" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Sarees & Handloom Drapes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=festive-heirlooms" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Ethnic Wear & Anarkalis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=lehengas" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Lehenga Cholis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=dupattas" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Dupattas & Artisanal Shawls
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=jackets" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Ethnic Overlays & Jackets
                  </Link>
                </li>
              </ul>

              <div className="pt-3 border-t border-[#E8E2D9] space-y-2">
                <Link 
                  to="/shop?category=artisanal-dupattas" 
                  onClick={() => setIsWomenMegaMenuOpen(false)}
                  className="text-[11px] font-semibold text-[#C5A880] tracking-wider uppercase block hover:text-[#966355] transition-colors"
                >
                  Belts, Potlis & Stoles →
                </Link>
              </div>
            </div>

            {/* Column 2: Western & Co-ords */}
            <div className="space-y-4">
              <h4 className="font-serif text-[15px] font-semibold text-[#966355] tracking-[0.1em] uppercase border-b border-[#E8E2D9] pb-2">
                Western & Co-ords
              </h4>
              <ul className="space-y-2 text-[13px] text-[#3E3A37]">
                <li>
                  <Link 
                    to="/shop?search=dress" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Dresses & Day Angrakhas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=private-salon-coords" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Co-ords & Twin Sets
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=everyday-luxury" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Sculpted Linen Tops & Tunics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?search=tunic" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Trousers, Pants & Culottes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?search=cape" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Shrugs & Velvet Capes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?category=jackets" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Handspun Jackets & Blazers
                  </Link>
                </li>
              </ul>

              <div className="pt-3 border-t border-[#E8E2D9] space-y-2">
                <Link 
                  to="/shop?size=XL" 
                  onClick={() => setIsWomenMegaMenuOpen(false)}
                  className="text-[11px] font-semibold text-[#C5A880] tracking-wider uppercase block hover:text-[#966355] transition-colors"
                >
                  Plus Size & Bespoke Tailoring →
                </Link>
              </div>
            </div>

            {/* Column 3: Indian Heritage Fabrics & Weaves */}
            <div className="space-y-4">
              <h4 className="font-serif text-[15px] font-semibold text-[#966355] tracking-[0.1em] uppercase border-b border-[#E8E2D9] pb-2">
                Fabrics & Crafts
              </h4>
              <ul className="space-y-2 text-[13px] text-[#3E3A37]">
                <li>
                  <Link 
                    to="/shop?fabric=Banarasi" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Pure Banarasi Katan Silk
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?fabric=Chanderi" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Chanderi & Maheshwari Cotton
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?fabric=Linen" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Handspun Khadi & Organic Linen
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?fabric=Organza" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Gossamer Tissue Organza
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?fabric=Silk" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all font-medium"
                  >
                    Mulberry Raw Silk
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?fabric=Velvet" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] hover:translate-x-1.5 inline-block transition-all"
                  >
                    Silk Velvet & Zardozi
                  </Link>
                </li>
              </ul>

              <div className="pt-3 border-t border-[#E8E2D9] space-y-1">
                <span className="text-[11px] text-[#766F68] block">
                  ★ 100% Handloom & Silk Mark Certified
                </span>
              </div>
            </div>

            {/* Column 4: Curated Price Edits & Spotlight */}
            <div className="space-y-4 bg-[#F5F1EB] p-5 border border-[#E8E2D9]">
              <h4 className="font-serif text-[15px] font-semibold text-[#1A1817] tracking-[0.08em] uppercase border-b border-[#E8E2D9] pb-2">
                Curated Indian Edits
              </h4>
              <ul className="space-y-2.5 text-[13px] text-[#3E3A37]">
                <li>
                  <Link 
                    to="/shop?price_range=under_5k" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] block transition-colors font-medium text-[#966355]"
                  >
                    • Silhouettes Under ₹5,000
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?price_range=5k_to_10k" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] block transition-colors font-medium"
                  >
                    • Festive Edits ₹5,000 - ₹10,000
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?price_range=above_10k" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#966355] block transition-colors font-medium"
                  >
                    • Heirloom Silk Above ₹10,000
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop?in_stock=true" 
                    onClick={() => setIsWomenMegaMenuOpen(false)}
                    className="hover:text-[#3D6B52] block transition-colors text-[#3D6B52] font-semibold"
                  >
                    • Ready to Ship (Dispatches in 24h)
                  </Link>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
                <Link 
                  to="/shop?collection=Winter+Solstice" 
                  onClick={() => setIsWomenMegaMenuOpen(false)}
                  className="block bg-[#1A1817] text-[#FAF8F5] text-center py-2.5 text-[11px] font-sans tracking-[0.2em] uppercase hover:bg-[#966355] transition-colors"
                >
                  Explore Winter Solstice
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Live Search Drawer */}
      {isSearchOpen && (
        <div className="bg-[#FAF8F5] border-t border-[#E8E2D9] px-4 py-6 transition-all duration-300 animate-fade-in shadow-inner">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 text-[#766F68]" size={18} strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search silhouettes, pure mulberry silk, chanderi kurtas..."
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] py-3.5 pl-12 pr-28 text-sm text-[#231F1D] placeholder-[#766F68] focus:outline-none focus:border-[#966355] transition-all font-sans"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 bg-[#1A1817] text-[#FAF8F5] text-[11px] font-sans tracking-[0.15em] uppercase px-5 py-2 hover:bg-[#966355] transition-colors"
              >
                Search
              </button>
            </form>
            <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#766F68] font-sans">
              <span className="tracking-wider uppercase text-[#966355] font-medium">Curations:</span>
              <button onClick={() => { setSearchQuery('Chanderi'); navigate('/shop?search=Chanderi'); setIsSearchOpen(false); }} className="hover:text-[#966355] hover:underline transition-colors">Chanderi</button>
              <span>•</span>
              <button onClick={() => { setSearchQuery('Silk Saree'); navigate('/shop?search=Silk'); setIsSearchOpen(false); }} className="hover:text-[#966355] hover:underline transition-colors">Mulberry Silk</button>
              <span>•</span>
              <button onClick={() => { setSearchQuery('Anarkali'); navigate('/shop?search=Anarkali'); setIsSearchOpen(false); }} className="hover:text-[#966355] hover:underline transition-colors">Anarkali</button>
              <span>•</span>
              <button onClick={() => { setSearchQuery('Kalamkari'); navigate('/shop?search=Kalamkari'); setIsSearchOpen(false); }} className="hover:text-[#966355] hover:underline transition-colors">Kalamkari</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-Out Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-t border-[#E8E2D9] px-6 py-6 space-y-6 max-h-[85vh] overflow-y-auto animate-fade-in">
          {/* Quick Category Tabs */}
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#E8E2D9]">
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-[#966355] block mb-2 font-serif text-sm">
                Indian & Fusion Wear
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#231F1D]">
                <Link to="/shop?category=kurtas-suits" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Kurtas & Suits
                </Link>
                <Link to="/shop?category=sarees" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Sarees & Drapes
                </Link>
                <Link to="/shop?category=contemporary-ethnic" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Ethnic Anarkalis
                </Link>
                <Link to="/shop?category=dupattas" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Dupattas & Shawls
                </Link>
                <Link to="/shop?category=lehengas" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Lehenga Cholis
                </Link>
                <Link to="/shop?category=jackets" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Jackets & Capes
                </Link>
              </div>
            </div>

            <div className="pb-3 border-b border-[#E8E2D9]">
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-[#966355] block mb-2 font-serif text-sm">
                Western & Co-ords
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#231F1D]">
                <Link to="/shop?category=private-salon-coords" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Co-ord Twin Sets
                </Link>
                <Link to="/shop?search=dress" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Day Dresses
                </Link>
                <Link to="/shop?category=everyday-luxury" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Linen Tunics
                </Link>
                <Link to="/shop?search=cape" onClick={() => setIsMobileMenuOpen(false)} className="py-1.5 hover:text-[#966355] transition-colors">
                  • Velvet Shrugs
                </Link>
              </div>
            </div>

            <div className="pb-3 border-b border-[#E8E2D9]">
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-[#C5A880] block mb-2 font-serif text-sm">
                Handloom Fabrics & Weaves
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Banarasi Silk', q: 'Banarasi' },
                  { name: 'Chanderi', q: 'Chanderi' },
                  { name: 'Pure Linen', q: 'Linen' },
                  { name: 'Tissue Organza', q: 'Organza' },
                  { name: 'Silk Velvet', q: 'Velvet' },
                ].map((f) => (
                  <Link
                    key={f.q}
                    to={`/shop?fabric=${f.q}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[11px] font-sans bg-white border border-[#E8E2D9] px-2.5 py-1 text-[#231F1D] hover:border-[#966355] hover:text-[#966355] transition-colors"
                  >
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pb-3 border-b border-[#E8E2D9]">
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-[#1A1817] block mb-2">
                Curated Price Segments
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-[#766F68]">
                <Link to="/shop?price_range=under_5k" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-[#966355] font-medium hover:underline">
                  Under ₹5,000
                </Link>
                <Link to="/shop?price_range=5k_to_10k" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-[#966355]">
                  ₹5,000 - ₹10,000
                </Link>
                <Link to="/shop?price_range=above_10k" onClick={() => setIsMobileMenuOpen(false)} className="py-1 hover:text-[#966355]">
                  Above ₹10,000
                </Link>
                <Link to="/shop?in_stock=true" onClick={() => setIsMobileMenuOpen(false)} className="py-1 text-[#3D6B52] font-semibold hover:underline">
                  ⚡ Ready to Ship
                </Link>
              </div>
            </div>

            <div className="space-y-2 text-sm font-serif tracking-wider uppercase text-[#1A1817]">
              <Link to="/shop?new_arrival=true" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1 hover:text-[#966355] transition-colors">
                <span>New Season Arrivals</span>
                <ChevronRight size={14} className="text-[#766F68]" />
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-1 hover:text-[#966355] transition-colors">
                <span>View Complete Collection</span>
                <ChevronRight size={14} className="text-[#766F68]" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] space-y-3 font-sans text-xs uppercase tracking-widest text-[#766F68]">
            <Link to={isAuthenticated ? '/account' : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#966355] transition-colors">
              {isAuthenticated ? `My Account (${user?.email})` : 'Client Sign In'}
            </Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#966355] transition-colors">
              Curated Wishlist ({totalWishlist})
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 font-semibold text-[#966355]">
                Admin Atelier Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
