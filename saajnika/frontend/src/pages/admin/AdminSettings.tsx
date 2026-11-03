import React, { useState, useEffect } from 'react';
import api, { clearApiCache } from '../../services/api';
import { 
  Sliders, ShieldCheck, Mail, Phone, MapPin, Truck, 
  RotateCcw, FileText, CheckCircle2, AlertCircle, Save, RefreshCw, Sparkles
} from 'lucide-react';

interface StoreSettingsData {
  brand_name: string;
  brand_tagline: string;
  store_announcement: string;
  contact_email: string;
  contact_phone: string;
  atelier_address: string;
  free_shipping_threshold: string;
  standard_shipping_charge: string;
  shipping_policy: string;
  returns_exchange_policy: string;
  terms_of_service: string;
  privacy_policy: string;
  atelier_story: string;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
  brand_name: 'SAAJNIKA',
  brand_tagline: 'Curated Contemporary Fashion & Heirlooms',
  store_announcement: 'COMPLIMENTARY DOMESTIC COURIER ON ORDERS OVER ₹3,999 | PRIVATE SALON PREVIEW',
  contact_email: 'concierge@saajnika.com',
  contact_phone: '+91 (011) 4892-0199',
  atelier_address: 'The Dhan Mill, 100 Feet Road, Chhatarpur, New Delhi 110074',
  free_shipping_threshold: '3999',
  standard_shipping_charge: '250',
  shipping_policy: `All Saajnika creations are inspected by hand and packaged in custom museum-grade dust sleeves and archival boxes.

• Standard Domestic Courier: 3-5 business days across Tier 1 metros; 5-7 business days for regional pin codes.
• Express White-Glove Dispatch: Dispatched within 24 hours from our Chhatarpur Atelier.
• Transit Insurance: Every shipment is 100% insured against loss or transit damage until physical delivery and signature.`,
  returns_exchange_policy: `At Saajnika, our bespoke and limited-edition garments are created with exacting care. We gladly accept returns and size exchanges within 7 calendar days of delivery.

• Items must be unwashed, unworn, with tamper-evident ribbons and security tags attached in original packaging.
• Complimentary reverse courier pickup will be scheduled at your convenience upon approval.
• Store credit or full refund to the original payment method is processed within 48 hours of atelier inspection.`,
  terms_of_service: `By visiting the Saajnika boutique portal and purchasing our garments, you agree to our terms of craftmanship, intellectual property, and fair client engagement. All textile prints, embroidery patterns, and visual media are proprietary to Saajnika Atelier Pvt. Ltd.`,
  privacy_policy: `Saajnika treats client confidentiality with utmost discretion. We do not sell or monetize client browsing habits or personal details. Payment credentials are tokenized through RBI-authorized payment gateways and are never stored on our local infrastructure.`,
  atelier_story: `Born from a passion for India's rich artisanal heritage and clean, contemporary drape silhouettes, Saajnika bridges the timeless legacy of Varanasi master-weavers with modern cosmopolitan grace.`
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettingsData>(DEFAULT_SETTINGS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'shipping' | 'policies'>('general');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsRefreshing(true);
      setErrorMsg(null);
      const res = await api.get('/cms/settings/');
      const raw = res.data;
      const rawList = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : [];

      const loaded: Partial<StoreSettingsData> = {};
      if (rawList.length > 0) {
        rawList.forEach((item: { key: string; value: string }) => {
          if (item.key && item.key in DEFAULT_SETTINGS) {
            // @ts-ignore
            loaded[item.key] = item.value;
          }
        });
      } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        // In case API returns direct dictionary
        Object.keys(raw).forEach((k) => {
          if (k in DEFAULT_SETTINGS && typeof raw[k] === 'string') {
            // @ts-ignore
            loaded[k] = raw[k];
          }
        });
      }

      if (Object.keys(loaded).length > 0) {
        setSettings(prev => ({ ...prev, ...loaded }));
      }
    } catch (err: any) {
      console.warn('Utilizing fallback cached settings:', err);
      // Keep loaded/default settings so user always sees information
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleChange = (field: keyof StoreSettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.post('/cms/settings/bulk_update/', settings);
      clearApiCache();
      setSuccessMsg('Store configurations and policies have been successfully synchronized.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#966355] uppercase block mb-1">
            Global Atelier Configuration
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817]">Store Settings & Policies</h1>
          <p className="text-xs font-sans text-[#766F68] mt-1">
            Manage announcement banners, concierge contacts, domestic courier thresholds, and legal policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isRefreshing}
            className="border border-[#E8E2D9] bg-white px-4 py-2 text-xs font-sans tracking-wider uppercase text-[#1A1817] hover:border-[#1A1817] flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#966355]' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Reload Server Data'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1A1817] text-white px-6 py-2 text-xs font-sans tracking-widest uppercase hover:bg-[#332F2C] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            <span>{saving ? 'Synchronizing...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 bg-[#F2F7F4] border border-[#CDE3D5] text-[#2C5E3B] text-xs font-sans flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-[#FBF2F2] border border-[#F0D5D5] text-[#A43E38] text-xs font-sans flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#E8E2D9] space-x-8 text-xs font-sans tracking-widest uppercase">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-[#966355] text-[#1A1817]'
              : 'border-transparent text-[#766F68] hover:text-[#1A1817]'
          }`}
        >
          <Sliders size={14} />
          <span>General & Concierge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'shipping'
              ? 'border-[#966355] text-[#1A1817]'
              : 'border-transparent text-[#766F68] hover:text-[#1A1817]'
          }`}
        >
          <Truck size={14} />
          <span>Logistics & Shipping Fees</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-[#966355] text-[#1A1817]'
              : 'border-transparent text-[#766F68] hover:text-[#1A1817]'
          }`}
        >
          <FileText size={14} />
          <span>Policies & Legal Terms</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* TAB 1: GENERAL & CONCIERGE */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            
            {/* Live Announcement Bar Editor */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-[#1A1817] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#966355]" />
                  <span>Top Boutique Announcement Bar</span>
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-[#966355] bg-[#F5EFEB] px-2 py-0.5">
                  Live on all pages
                </span>
              </div>
              <p className="text-xs font-sans text-[#766F68]">
                Displayed in the dark marquee strip above the global navigation bar.
              </p>
              <div>
                <input
                  type="text"
                  value={settings.store_announcement}
                  onChange={(e) => handleChange('store_announcement', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2.5 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                  placeholder="e.g. COMPLIMENTARY DOMESTIC COURIER ON ORDERS OVER ₹3,999"
                />
              </div>

              {/* Live Preview Box */}
              <div className="bg-[#1A1817] text-[#FAF8F5] px-4 py-2 text-[10px] font-sans tracking-[0.2em] uppercase text-center border-l-2 border-[#C5A880]">
                Preview: {settings.store_announcement || 'Empty announcement'}
              </div>
            </div>

            {/* Brand Identity */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-4">
              <h3 className="font-serif text-lg text-[#1A1817]">Brand Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.brand_name}
                    onChange={(e) => handleChange('brand_name', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1">
                    Brand Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.brand_tagline}
                    onChange={(e) => handleChange('brand_tagline', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                  />
                </div>
              </div>
            </div>

            {/* Concierge & Support Details */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-4">
              <h3 className="font-serif text-lg text-[#1A1817]">Concierge & Atelier Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1 flex items-center gap-1">
                    <Mail size={12} />
                    <span>Concierge Email</span>
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1 flex items-center gap-1">
                    <Phone size={12} />
                    <span>Concierge Phone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={settings.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1 flex items-center gap-1">
                  <MapPin size={12} />
                  <span>Physical Atelier & Showroom Address</span>
                </label>
                <textarea
                  rows={2}
                  value={settings.atelier_address}
                  onChange={(e) => handleChange('atelier_address', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
                />
              </div>
            </div>

            {/* Atelier Story */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-4">
              <h3 className="font-serif text-lg text-[#1A1817]">The Atelier Story & Heritage Note</h3>
              <p className="text-xs font-sans text-[#766F68]">
                Featured in footer dossiers and boutique provenance certificates.
              </p>
              <textarea
                rows={4}
                value={settings.atelier_story}
                onChange={(e) => handleChange('atelier_story', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D9] px-4 py-2 text-xs font-sans text-[#1A1817] focus:outline-none focus:border-[#966355]"
              />
            </div>

          </div>
        )}

        {/* TAB 2: SHIPPING & LOGISTICS */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-6">
              <div>
                <h3 className="font-serif text-lg text-[#1A1817]">Domestic Delivery Rates & Thresholds</h3>
                <p className="text-xs font-sans text-[#766F68] mt-1">
                  Configure checkout logic and cart drawer progress indicators.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#E8E2D9] p-4 bg-[#FAF8F5]">
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1">
                    Free Domestic Shipping Threshold (₹)
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 text-xs text-[#766F68]">₹</span>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                      className="w-full bg-white border border-[#E8E2D9] pl-8 pr-4 py-2 text-sm font-sans font-medium text-[#1A1817] focus:outline-none focus:border-[#966355]"
                    />
                  </div>
                  <p className="text-[11px] font-sans text-[#766F68] mt-2">
                    Carts with total equal to or exceeding this amount will automatically qualify for complimentary insured courier.
                  </p>
                </div>

                <div className="border border-[#E8E2D9] p-4 bg-[#FAF8F5]">
                  <label className="block text-[10px] font-sans tracking-wider uppercase text-[#766F68] mb-1">
                    Standard Domestic Shipping Charge (₹)
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-2.5 text-xs text-[#766F68]">₹</span>
                    <input
                      type="number"
                      value={settings.standard_shipping_charge}
                      onChange={(e) => handleChange('standard_shipping_charge', e.target.value)}
                      className="w-full bg-white border border-[#E8E2D9] pl-8 pr-4 py-2 text-sm font-sans font-medium text-[#1A1817] focus:outline-none focus:border-[#966355]"
                    />
                  </div>
                  <p className="text-[11px] font-sans text-[#766F68] mt-2">
                    Fee applied when the customer's cart is below the free shipping threshold.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-[#E8E2D9] space-y-4">
              <h3 className="font-serif text-lg text-[#1A1817]">Domestic Dispatch Guarantees</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-[#766F68]">
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D9]">
                  <span className="font-medium text-[#1A1817] block mb-1">Tier 1 Metros</span>
                  <span>Estimated 3-5 business days via BlueDart Air / Delhivery Express.</span>
                </div>
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D9]">
                  <span className="font-medium text-[#1A1817] block mb-1">Regional Pin Codes</span>
                  <span>Estimated 5-7 business days with OTP-verified secure delivery.</span>
                </div>
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D9]">
                  <span className="font-medium text-[#1A1817] block mb-1">Atelier Packaging</span>
                  <span>Museum-grade archival boxes with anti-tarnish tissue wrapping.</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: POLICIES & LEGAL */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            
            {/* Shipping Policy */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-3">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-[#966355]" />
                <h3 className="font-serif text-lg text-[#1A1817]">Shipping & Transit Policy</h3>
              </div>
              <textarea
                rows={6}
                value={settings.shipping_policy}
                onChange={(e) => handleChange('shipping_policy', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D9] p-4 text-xs font-sans text-[#1A1817] leading-relaxed focus:outline-none focus:border-[#966355]"
              />
            </div>

            {/* Returns & Exchanges */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-3">
              <div className="flex items-center space-x-2">
                <RotateCcw size={16} className="text-[#966355]" />
                <h3 className="font-serif text-lg text-[#1A1817]">Returns & Size Exchange Policy</h3>
              </div>
              <textarea
                rows={6}
                value={settings.returns_exchange_policy}
                onChange={(e) => handleChange('returns_exchange_policy', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D9] p-4 text-xs font-sans text-[#1A1817] leading-relaxed focus:outline-none focus:border-[#966355]"
              />
            </div>

            {/* Terms of Service */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-3">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-[#966355]" />
                <h3 className="font-serif text-lg text-[#1A1817]">Terms of Service</h3>
              </div>
              <textarea
                rows={5}
                value={settings.terms_of_service}
                onChange={(e) => handleChange('terms_of_service', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D9] p-4 text-xs font-sans text-[#1A1817] leading-relaxed focus:outline-none focus:border-[#966355]"
              />
            </div>

            {/* Privacy Policy */}
            <div className="bg-white p-6 border border-[#E8E2D9] space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#966355]" />
                <h3 className="font-serif text-lg text-[#1A1817]">Privacy Policy & Data Security</h3>
              </div>
              <textarea
                rows={5}
                value={settings.privacy_policy}
                onChange={(e) => handleChange('privacy_policy', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D9] p-4 text-xs font-sans text-[#1A1817] leading-relaxed focus:outline-none focus:border-[#966355]"
              />
            </div>

          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-6 border-t border-[#E8E2D9] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1A1817] text-white px-8 py-3 text-xs font-sans tracking-widest uppercase hover:bg-[#332F2C] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            <span>{saving ? 'Synchronizing with Database...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
