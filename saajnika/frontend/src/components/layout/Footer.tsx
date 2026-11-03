import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, X, ShieldCheck, FileText, Truck, RotateCcw } from 'lucide-react';
import api, { cachedGet } from '../../services/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [activePolicy, setActivePolicy] = useState<{ title: string; content: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await api.post('/cms/newsletter/subscribe/', { email });
      setSubscribed(true);
      setMessage(res.data.message || 'Invitation received. Welcome to the Private Salon.');
      setEmail('');
    } catch {
      setSubscribed(true);
      setMessage('Thank you for subscribing to the Saajnika Private Salon.');
      setEmail('');
    }
  };

  const openPolicy = async (policyKey: string, title: string) => {
    try {
      const res = await cachedGet('/cms/settings/');
      const rawList = res.data?.results || res.data || [];
      const item = Array.isArray(rawList)
        ? rawList.find((s: any) => s.key === policyKey)
        : null;
      if (item && item.value) {
        setActivePolicy({ title, content: item.value });
      } else {
        setActivePolicy({ title, content: 'Policy documentation currently maintained by Saajnika Atelier.' });
      }
    } catch {
      setActivePolicy({ title, content: 'Please contact concierge@saajnika.com for complete policy documentation.' });
    }
  };

  return (
    <footer className="bg-[#1A1817] text-[#FAF8F5] pt-10 pb-6 border-t border-[#2C2826]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Manifesto Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-[#2C2826] items-center">
          <div className="lg:col-span-6 space-y-1.5">
            <span className="text-[9px] font-sans tracking-[0.25em] text-[#C5A880] uppercase">
              The Private Salon
            </span>
            <h2 className="font-serif text-lg sm:text-xl text-[#FAF8F5] font-light leading-snug">
              Receive Seasonal Lookbooks & Atelier Invitations
            </h2>
            <p className="text-xs font-sans text-[#A8A199] leading-relaxed max-w-lg">
              Priority access to limited edition textile drops, bespoke sizing consultations, and artisan editorial stories.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            {subscribed ? (
              <div className="bg-[#2C2826] p-2.5 flex items-center space-x-2 border border-[#3E3A37]">
                <CheckCircle2 size={16} className="text-[#C5A880]" />
                <span className="text-xs font-sans text-[#FAF8F5]">{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-1.5">
                <div className="flex border-b border-[#FAF8F5]/30 focus-within:border-[#C5A880] pb-1.5 transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your private email address"
                    className="w-full bg-transparent text-xs text-[#FAF8F5] placeholder-[#766F68] focus:outline-none font-sans"
                    required
                  />
                  <button
                    type="submit"
                    className="text-[10px] font-sans tracking-[0.18em] uppercase text-[#C5A880] hover:text-white flex items-center space-x-1 pl-3 whitespace-nowrap"
                  >
                    <span>Request Invitation</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
                <p className="text-[10px] font-sans text-[#766F68]">
                  By requesting an invitation, you accept our privacy code. You may withdraw at any time.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Multi-column Editorial Site Map */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 py-8 text-xs font-sans">
          {/* Column 1: Brand Proclamation */}
          <div className="col-span-2 space-y-2 pr-6">
            <span className="font-serif text-lg tracking-[0.22em] text-[#FAF8F5] uppercase block">
              SAAJNIKA
            </span>
            <p className="text-[11px] text-[#A8A199] leading-relaxed max-w-sm">
              An independent digital fashion boutique devoted to timeless silhouettes, honest textiles, and the quiet dignity of slow craftsmanship. Designed in New Delhi.
            </p>
            <div className="pt-1 text-[11px] text-[#766F68]">
              Atelier: The Dhan Mill, Chhatarpur, New Delhi 110074
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#C5A880] font-medium">
              Collections
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#A8A199]">
              <li><Link to="/shop?category=contemporary-ethnic" className="hover:text-white transition-colors">Contemporary Ethnic</Link></li>
              <li><Link to="/shop?category=the-silk-edit" className="hover:text-white transition-colors">The Silk Edit</Link></li>
              <li><Link to="/shop?category=everyday-luxury" className="hover:text-white transition-colors">Everyday Luxury</Link></li>
              <li><Link to="/shop?category=festive-heirlooms" className="hover:text-white transition-colors">Festive Heirlooms</Link></li>
              <li><Link to="/shop?new_arrival=true" className="hover:text-white transition-colors">New Season Arrivals</Link></li>
            </ul>
          </div>

          {/* Column 3: Client Care */}
          <div className="space-y-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#C5A880] font-medium">
              Client Concierge
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#A8A199]">
              <li><Link to="/account" className="hover:text-white transition-colors">My Client Account</Link></li>
              <li><Link to="/orders/track" className="hover:text-white transition-colors">Dispatch & Order Tracking</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Bespoke Size Guide</Link></li>
              <li><a href="mailto:concierge@saajnika.com" className="hover:text-white transition-colors">Atelier Care (Email)</a></li>
              <li><a href="tel:+9101148920199" className="hover:text-white transition-colors">+91 (011) 4892-0199</a></li>
            </ul>
          </div>

          {/* Column 4: Standards & Integrity */}
          <div className="space-y-2">
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#C5A880] font-medium">
              The Brand Policy
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#A8A199]">
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('shipping_policy', 'Shipping & Transit Policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Complimentary Domestic Transit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('returns_exchange_policy', 'Returns & Size Exchange Policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  7-Day Private Salon Exchange
                </button>
              </li>
              <li><span className="text-[#A8A199]">Silk Mark Certified Textiles</span></li>
              <li><span className="text-[#A8A199]">Artisan Fair Compensation</span></li>
              <li><span className="text-[#A8A199]">Climate Conscious Packaging</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-4 border-t border-[#2C2826] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#766F68] font-sans">
          <div>
            © {new Date().getFullYear()} SAAJNIKA ATELIER PVT. LTD. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-6 mt-2 sm:mt-0">
            <button
              type="button"
              onClick={() => openPolicy('privacy_policy', 'Privacy Policy & Data Security')}
              className="hover:text-[#A8A199] transition-colors"
            >
              Privacy Charter
            </button>
            <button
              type="button"
              onClick={() => openPolicy('terms_of_service', 'Terms of Service')}
              className="hover:text-[#A8A199] transition-colors"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => openPolicy('shipping_policy', 'Tax & Duties Disclosure')}
              className="hover:text-[#A8A199] transition-colors"
            >
              Tax & Duties Disclosure
            </button>
          </div>
        </div>

        {/* Live Boutique Policy Modal */}
        {activePolicy && (
          <div 
            onClick={() => setActivePolicy(null)}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FAF8F5] text-[#231F1D] max-w-2xl w-full border border-[#E8E2D9] shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 cursor-default"
            >
              <div className="flex items-start justify-between border-b border-[#E8E2D9] pb-4">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.25em] text-[#966355] uppercase block mb-1">
                    Saajnika Atelier Policy
                  </span>
                  <h3 className="font-serif text-2xl text-[#1A1817]">{activePolicy.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  className="p-1.5 text-[#766F68] hover:text-[#1A1817] hover:bg-[#E8E2D9] rounded-none transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 text-xs font-sans leading-relaxed text-[#554F4A] whitespace-pre-line space-y-3">
                {activePolicy.content}
              </div>

              <div className="pt-4 border-t border-[#E8E2D9] flex justify-between items-center text-[11px] font-sans text-[#766F68]">
                <span>Concierge inquiries: concierge@saajnika.com</span>
                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  className="bg-[#1A1817] text-white px-5 py-2 text-xs uppercase tracking-widest font-sans hover:bg-[#332F2C] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </footer>
  );
};
