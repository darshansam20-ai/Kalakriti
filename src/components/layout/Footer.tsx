import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [storeData, setStoreData] = useState({
    aboutText: 'Handcrafted elegance for every occasion. We bring you the finest collection of traditional and modern Indian jewelry.',
    storeName: 'Kalakriti',
    storeEmail: 'kalakriticreations80@gmail.com',
    instagramUrl: 'https://instagram.com/creations.kalakriti',
    facebookUrl: '#',
    twitterUrl: '#'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoreData(prev => ({
            ...prev,
            aboutText: data.footerAbout || prev.aboutText,
            storeName: data.storeName || prev.storeName,
            storeEmail: data.storeEmail || prev.storeEmail,
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            facebookUrl: data.facebookUrl || prev.facebookUrl,
            twitterUrl: data.twitterUrl || prev.twitterUrl
          }));
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'newsletter'), {
        email,
        subscribedAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="bg-surface text-ink pt-16 pb-8 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-serif text-[24px] font-bold tracking-[2px] uppercase mb-4 block text-maroon">
              {storeData.storeName}
            </Link>
            <p className="text-text-light text-[14px] leading-relaxed mb-6 whitespace-pre-wrap">
              {storeData.aboutText}
            </p>
            <div className="flex space-x-4">
              <a href={storeData.instagramUrl} target="_blank" rel="noreferrer" className="text-text-light hover:text-maroon transition-colors"><Instagram size={20} /></a>
              <a href={storeData.facebookUrl} target="_blank" rel="noreferrer" className="text-text-light hover:text-maroon transition-colors"><Facebook size={20} /></a>
              <a href={storeData.twitterUrl} target="_blank" rel="noreferrer" className="text-text-light hover:text-maroon transition-colors"><Twitter size={20} /></a>
              <a href={`mailto:${storeData.storeEmail}`} className="text-text-light hover:text-maroon transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-[18px] font-semibold mb-4 text-ink">Shop</h3>
            <ul className="space-y-3 text-[13px] uppercase tracking-wide text-text-light">
              <li><Link to="/shop" className="hover:text-maroon transition-colors">All Jewelry</Link></li>
              <li><Link to="/shop?category=custom-made" className="hover:text-maroon transition-colors">Custom Made</Link></li>
              <li><Link to="/shop?category=necklaces" className="hover:text-maroon transition-colors">Necklaces & Sets</Link></li>
              <li><Link to="/shop?category=earrings" className="hover:text-maroon transition-colors">Earrings</Link></li>
              <li><Link to="/shop?category=bridal-sets" className="hover:text-maroon transition-colors">Bridal Sets</Link></li>
              <li><Link to="/shop?category=silk-thread" className="hover:text-maroon transition-colors">Silk Thread</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-[18px] font-semibold mb-4 text-ink">Customer Care</h3>
            <ul className="space-y-3 text-[13px] uppercase tracking-wide text-text-light">
              <li><Link to="/contact" className="hover:text-maroon transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-maroon transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns-exchanges" className="hover:text-maroon transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-maroon transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-[18px] font-semibold mb-4 text-ink">Newsletter</h3>
            <p className="text-text-light text-[14px] mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            {subscribed ? (
              <p className="text-green-600 font-medium text-[14px]">Thank you for subscribing!</p>
            ) : (
              <form className="flex flex-col space-y-2" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="bg-transparent border border-gold/30 text-ink px-4 py-3 rounded-[30px] focus:outline-none focus:border-maroon text-[13px] placeholder:text-text-light/50"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-3 rounded-[30px] transition-colors text-[13px] uppercase tracking-wide"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="border-t border-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center text-[12px] uppercase tracking-wide text-text-light">
          <p>&copy; {new Date().getFullYear()} {storeData.storeName}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-maroon transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-maroon transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
