import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const q = query(collection(db, 'newsletter'), orderBy('subscribedAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscribers(fetched);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  if (loading) return <div className="p-8">Loading subscribers...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Newsletter</h1>
          <p className="text-text-light text-[15px]">View users who subscribed to the newsletter.</p>
        </div>
        <div className="bg-maroon/10 text-maroon px-4 py-2 rounded-full font-bold">
          {subscribers.length} Subscribers
        </div>
      </div>

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Subscribed Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4 font-medium text-[14px] text-ink">{sub.email}</td>
                <td className="p-4 text-[14px] text-text-light">
                  {sub.subscribedAt?.toDate ? sub.subscribedAt.toDate().toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-text-light">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
