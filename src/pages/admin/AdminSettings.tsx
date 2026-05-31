import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: 'Kalakriti',
    storeEmail: 'kalakriticreations80@gmail.com',
    instagramUrl: 'https://instagram.com/creations.kalakriti',
    facebookUrl: '#',
    twitterUrl: '#',
    contactInfo: 'Email us at kalakriticreations80@gmail.com',
    shippingPolicy: 'Our standard shipping policy...',
    returnsPolicy: 'Our standard returns and exchanges policy...',
    heroTitle: 'Handcrafted Elegance For Every Occasion',
    heroSubtitle: 'Authentic Indian artistry woven into timeless handcrafted jewelry.',
    footerAbout: 'Handcrafted elegance for every occasion. We bring you the finest collection of traditional and modern Indian jewelry.',
    flatShippingRate: 80,
    freeShippingThreshold: 1500
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'public');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, formData);
      } else {
        await setDoc(docRef, formData);
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Store Config</h1>
        <p className="text-text-light text-[15px]">Manage your public pages content.</p>
      </div>

      <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-8">
        
        <div className="space-y-6 pb-6 border-b border-black/5">
          <h2 className="font-serif text-[20px] font-bold text-ink">General Store Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Store Email</label>
              <input
                type="email"
                name="storeEmail"
                value={formData.storeEmail}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Instagram Link</label>
              <input
                type="text"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Facebook Link</label>
              <input
                type="text"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Twitter Link</label>
              <input
                type="text"
                name="twitterUrl"
                value={formData.twitterUrl}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-6 border-b border-black/5">
          <h2 className="font-serif text-[20px] font-bold text-ink">Homepage Details</h2>
          
          <div>
            <label className="block text-[14px] font-bold text-ink mb-1">Hero Title</label>
            <p className="text-[12px] text-text-light mb-2">Main headline on the homepage.</p>
            <input
              type="text"
              name="heroTitle"
              value={formData.heroTitle}
              onChange={handleChange}
              className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-ink mb-1">Hero Subtitle</label>
            <p className="text-[12px] text-text-light mb-2">Secondary text placed beneath the headline.</p>
            <textarea
              name="heroSubtitle"
              value={formData.heroSubtitle}
              onChange={handleChange}
              rows={2}
              className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
            />
          </div>
        </div>

        <div className="space-y-6 pb-6 border-b border-black/5">
          <h2 className="font-serif text-[20px] font-bold text-ink">Footer Details</h2>
          <div>
            <label className="block text-[14px] font-bold text-ink mb-1">About Text</label>
            <p className="text-[12px] text-text-light mb-2">Short paragraph displayed on the left side of the footer.</p>
            <textarea
              name="footerAbout"
              value={formData.footerAbout}
              onChange={handleChange}
              rows={3}
              className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-[20px] font-bold text-ink">Store Legal Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Standard Flat Shipping Rate (₹)</label>
              <p className="text-[12px] text-text-light mb-2">Flat rate applied to orders below free shipping threshold.</p>
              <input
                type="number"
                name="flatShippingRate"
                value={formData.flatShippingRate}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-ink mb-1">Free Shipping Threshold (₹)</label>
              <p className="text-[12px] text-text-light mb-2">Orders above this value will have zero shipping charges.</p>
              <input
                type="number"
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold}
                onChange={handleChange}
                className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[14px] font-bold text-ink mb-1">Contact Us Content</label>
            <p className="text-[12px] text-text-light mb-2">Displayed on the Contact Us page.</p>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              rows={5}
              className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
            />
          </div>

        <div>
          <label className="block text-[14px] font-bold text-ink mb-2">Shipping Policy</label>
          <p className="text-[12px] text-text-light mb-2">Displayed on the Shipping Policy page.</p>
          <textarea
            name="shippingPolicy"
            value={formData.shippingPolicy}
            onChange={handleChange}
            rows={5}
            className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
          />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-ink mb-2">Returns & Exchanges</label>
          <p className="text-[12px] text-text-light mb-2">Displayed on the Returns & Exchanges page.</p>
          <textarea
            name="returnsPolicy"
            value={formData.returnsPolicy}
            onChange={handleChange}
            rows={5}
            className="w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
          />
        </div>
        </div>

        <div className="pt-4 border-t border-black/5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-maroon hover:bg-maroon-dark text-white font-semibold px-6 py-2 rounded-[8px] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};
