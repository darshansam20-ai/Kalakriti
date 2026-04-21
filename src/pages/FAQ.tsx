import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const q = query(collection(db, 'faqs'));
        const snapshot = await getDocs(q);
        const fetchedFaqs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((f: any) => f.isActive);
        setFaqs(fetchedFaqs);
      } catch (error) {
        console.error("Error fetching faqs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
        <h1 className="font-serif text-[36px] font-bold text-ink mb-8 text-center">Frequently Asked Questions</h1>
        
        {loading ? (
          <p className="text-center text-text-light">Loading FAQs...</p>
        ) : (
          <div className="space-y-6">
            {faqs.length > 0 ? faqs.map((faq, index) => (
              <div key={index} className="bg-surface p-6 rounded-[12px] shadow-sm border border-black/5">
                <h3 className="font-serif text-[18px] font-bold text-ink mb-2">{faq.question}</h3>
                <p className="text-[14px] text-text-light leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
              </div>
            )) : (
              <p className="text-center text-text-light">No FAQs available at the moment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
