import React, { useState, useEffect } from 'react';
import { Package, Users, Star, Truck } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const [storeName, setStoreName] = useState('Kalakriti');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storeName) {
          setStoreName(docSnap.data().storeName);
        }
      } catch (error) {
        console.error("Error fetching admin settings:", error);
      }
    };
    fetchSettings();
  }, []);
  const stats = [
    { label: 'Total Orders', value: '156', icon: <Package size={24} className="text-maroon" />, trend: '+12%' },
    { label: 'Total Users', value: '2,451', icon: <Users size={24} className="text-blue-600" />, trend: '+5%' },
    { label: 'Pending Reviews', value: '24', icon: <Star size={24} className="text-gold" />, trend: '-2%' },
    { label: 'Active Shipments', value: '42', icon: <Truck size={24} className="text-purple-600" />, trend: '+18%' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Dashboard Overview</h1>
        <p className="text-text-light text-[15px]">Welcome to the {storeName} Admin Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-accent-soft rounded-[12px]">
                {stat.icon}
              </div>
              <span className={`text-[13px] font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-[24px] font-bold text-ink mb-1">{stat.value}</h3>
            <p className="text-[13px] uppercase tracking-wide text-text-light font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Placeholder */}
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-bg rounded-[12px] border border-black/5">
                <div>
                  <p className="text-[14px] font-bold text-ink mb-1">#ORD-2024-{i}84</p>
                  <p className="text-[12px] text-text-light">2 items • ₹4,500</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[11px] uppercase tracking-wider font-bold rounded-full">
                  Processing
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews Placeholder */}
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Recent Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-bg rounded-[12px] border border-black/5">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className={j < 4 ? "fill-gold text-gold" : "text-black/10"} />
                  ))}
                </div>
                <div>
                  <p className="text-[13px] text-ink font-medium mb-1">"Beautiful craftsmanship, absolutely love it!"</p>
                  <p className="text-[11px] text-text-light">- Customer {i}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
