import React, { useState, useEffect } from 'react';
import { Save, Image, Check } from 'lucide-react';
import api, { clearApiCache } from '../../services/api';
import { HomepageBanner } from '../../types';

export const AdminCMS: React.FC = () => {
  const [heroBanner, setHeroBanner] = useState<HomepageBanner | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('3999');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchCMS = async () => {
    try {
      const [bannersRes, settingsRes] = await Promise.all([
        api.get('/cms/banners/'),
        api.get('/cms/settings/'),
      ]);

      const banners = bannersRes.data.results || bannersRes.data || [];
      const hero = banners.find((b: HomepageBanner) => b.banner_type === 'HERO') || banners[0];
      setHeroBanner(hero || null);

      const settings = settingsRes.data.results || settingsRes.data || [];
      const ann = settings.find((s: any) => s.key === 'store_announcement');
      if (ann) setAnnouncement(ann.value);
      const freeShip = settings.find((s: any) => s.key === 'free_shipping_threshold');
      if (freeShip) setFreeShippingThreshold(freeShip.value);
    } catch (err) {
      console.error('Error fetching CMS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();

    const handleUpdate = () => {
      fetchCMS();
    };
    window.addEventListener('saajnika:data_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('saajnika:data_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (heroBanner?.id) {
        await api.patch(`/cms/banners/${heroBanner.id}/`, heroBanner);
        clearApiCache();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save CMS banner updates');
    }
  };

  if (loading) return <div className="p-8 text-xs font-sans text-[#766F68]">Loading CMS configuration...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="pb-4 border-b border-[#E8E2D9]">
        <span className="text-[10px] font-sans tracking-widest uppercase text-[#966355] font-medium block">
          Editorial & Brand Experience
        </span>
        <h1 className="font-serif text-3xl text-[#1A1817]">Homepage Banner & Settings</h1>
      </div>

      {saved && (
        <div className="p-3 bg-[#3D6B52]/10 border border-[#3D6B52]/20 text-[#3D6B52] text-xs font-sans flex items-center gap-2">
          <Check size={16} />
          <span>Brand experience changes saved and broadcast live to boutique storefront.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-[#E8E2D9] p-8 shadow-sm space-y-6 text-xs font-sans">
        
        <h3 className="font-serif text-xl text-[#1A1817] pb-2 border-b border-[#E8E2D9]">
          Main Editorial Hero Banner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase text-[10px] text-[#766F68] mb-1">Kicker Label</label>
            <input
              type="text"
              value={heroBanner?.kicker || ''}
              onChange={(e) => setHeroBanner({ ...heroBanner!, kicker: e.target.value })}
              className="w-full border p-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] text-[#766F68] mb-1">Headline *</label>
            <input
              type="text"
              required
              value={heroBanner?.title || ''}
              onChange={(e) => setHeroBanner({ ...heroBanner!, title: e.target.value })}
              className="w-full border p-2 text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block uppercase text-[10px] text-[#766F68] mb-1">Editorial Subheading</label>
          <textarea
            rows={3}
            value={heroBanner?.subtitle || ''}
            onChange={(e) => setHeroBanner({ ...heroBanner!, subtitle: e.target.value })}
            className="w-full border p-2 text-xs bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase text-[10px] text-[#766F68] mb-1">CTA Button Text</label>
            <input
              type="text"
              value={heroBanner?.cta_text || ''}
              onChange={(e) => setHeroBanner({ ...heroBanner!, cta_text: e.target.value })}
              className="w-full border p-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] text-[#766F68] mb-1">Hero Image URL</label>
            <input
              type="url"
              value={heroBanner?.image_url || ''}
              onChange={(e) => setHeroBanner({ ...heroBanner!, image_url: e.target.value })}
              className="w-full border p-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E2D9] flex justify-end">
          <button
            type="submit"
            className="bg-[#1A1817] text-white text-xs font-sans tracking-widest uppercase px-8 py-3 hover:bg-[#966355] transition-colors flex items-center space-x-2"
          >
            <Save size={14} />
            <span>Save Storefront Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
