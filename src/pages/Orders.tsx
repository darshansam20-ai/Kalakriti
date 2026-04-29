import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
}

export const Orders: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthReady, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'processing': return <Package size={16} className="text-blue-600" />;
      case 'shipped': return <Truck size={16} className="text-purple-600" />;
      case 'delivered': return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-bg min-h-screen py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-maroon/30 border-t-maroon rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-12">
          <h1 className="font-serif text-[36px] md:text-[42px] text-ink font-bold mb-4">
            Your Orders
          </h1>
          <p className="text-text-light text-[15px]">
            Track and manage your recent purchases.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-[16px] border border-black/5">
            <Package size={48} className="mx-auto text-black/10 mb-6" />
            <p className="text-text-light text-[16px] mb-6">You haven't placed any orders yet.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-maroon text-white font-semibold px-8 py-3 rounded-[30px] text-[14px] uppercase tracking-wide hover:bg-maroon-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden"
              >
                <div className="bg-accent-soft px-6 py-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Order ID</p>
                    <p className="text-[14px] font-mono text-ink">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Date</p>
                    <p className="text-[14px] text-ink">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                <div>
                  <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Total</p>
                  <p className="text-[14px] font-bold text-maroon">₹{((order as any).totalAmount || order.total || 0).toLocaleString('en-IN')}</p>
                </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      <span className="mr-2">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Tracking Info */}
                  {(order as any).carrier && (order as any).trackingNumber && (
                    <div className="mb-6 p-4 bg-accent-soft rounded-[8px] border border-black/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Carrier</p>
                        <p className="text-[14px] font-bold text-ink">{(order as any).carrier}</p>
                      </div>
                      <div>
                        <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Tracking Number</p>
                        <p className="text-[14px] font-mono text-ink">{(order as any).trackingNumber}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[12px] uppercase tracking-wider text-text-light font-medium mb-1">Track Order</p>
                        <a 
                           href={`https://www.google.com/search?q=${(order as any).carrier}+tracking+${(order as any).trackingNumber}`} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="text-[14px] font-bold text-maroon hover:underline flex items-center"
                        >
                           Track Package
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-[8px] bg-[#f9f9f9] mix-blend-multiply border border-black/5" />
                        <div className="flex-grow">
                          <h4 className="text-[14px] font-medium text-ink line-clamp-1">{item.title}</h4>
                          <p className="text-[13px] text-text-light">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-bold text-ink">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
