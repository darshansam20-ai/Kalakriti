import React, { useState, useEffect } from 'react';
import { Package, Users, Star, Truck } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const [storeName, setStoreName] = useState('Kalakriti');

  const [orders, setOrders] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storeName) {
          setStoreName(docSnap.data().storeName);
        }

        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
        const ordersSnapshot = await getDocs(ordersQuery);
        const fetchedOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUsersCount(usersSnapshot.size);
        
        const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(5));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviews(reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: <Package size={24} className="text-maroon" />, trend: '' },
    { label: 'Total Users', value: usersCount.toString(), icon: <Users size={24} className="text-blue-600" />, trend: '' },
    { label: 'Pending Reviews', value: reviews.length.toString(), icon: <Star size={24} className="text-gold" />, trend: '' },
    { label: 'Active Shipments', value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length.toString(), icon: <Truck size={24} className="text-purple-600" />, trend: '' },
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
        {/* Recent Orders */}
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {orders.length > 0 ? orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-bg rounded-[12px] border border-black/5 flex-wrap gap-2">
                <div>
                  <p className="text-[14px] font-bold text-ink mb-1">#{order.orderId || order.id}</p>
                  <p className="text-[12px] text-text-light">{order.items?.length || 0} items • ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[11px] uppercase tracking-wider font-bold rounded-full">
                  {order.status}
                </span>
              </div>
            )) : <p className="text-[13px] text-text-light text-center py-4">No recent orders found</p>}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="font-serif text-[20px] font-bold text-ink mb-6">Recent Reviews</h2>
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map((review: any) => (
              <div key={review.id} className="flex items-start space-x-4 p-4 bg-bg rounded-[12px] border border-black/5">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className={j < review.rating ? "fill-gold text-gold" : "text-black/10"} />
                  ))}
                </div>
                <div>
                  <p className="text-[13px] text-ink font-medium mb-1">"{review.comment}"</p>
                  <p className="text-[11px] text-text-light">- {review.userName || 'Anonymous'}</p>
                </div>
              </div>
            )) : <p className="text-[13px] text-text-light text-center py-4">No recent reviews found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
