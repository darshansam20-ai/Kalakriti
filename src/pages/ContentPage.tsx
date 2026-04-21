import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ContentPage: React.FC<{ type: 'contact' | 'shipping' | 'returns', title: string }> = ({ type, title }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (type === 'contact') setContent(data.contactInfo || 'Email us at kalakriticreations80@gmail.com');
          if (type === 'shipping') setContent(data.shippingPolicy || 'Shipping policy content goes here.');
          if (type === 'returns') setContent(data.returnsPolicy || 'Returns & Exchanges policy goes here.');
        } else {
          // Initialize default content if not exists
          const defaults = {
            contactInfo: 'Email us at kalakriticreations80@gmail.com',
            shippingPolicy: 'Our standard shipping policy...',
            returnsPolicy: 'Our standard returns and exchanges policy...'
          };
          await setDoc(docRef, defaults);
          if (type === 'contact') setContent(defaults.contactInfo);
          if (type === 'shipping') setContent(defaults.shippingPolicy);
          if (type === 'returns') setContent(defaults.returnsPolicy);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [type]);

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
        <h1 className="font-serif text-[36px] font-bold text-ink mb-8 text-center">{title}</h1>
        
        {loading ? (
          <p className="text-center text-text-light">Loading...</p>
        ) : (
          <div className="bg-surface p-8 rounded-[16px] shadow-sm border border-black/5">
            <div className="prose prose-sm max-w-none text-text-light whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
