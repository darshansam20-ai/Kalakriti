import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Package, Clock, CheckCircle, Truck, XCircle, Search, MapPin } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleTrackingUpdate = async (orderId: string, carrier: string, trackingNumber: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { carrier, trackingNumber });
      setOrders(orders.map(o => o.id === orderId ? { ...o, carrier, trackingNumber } : o));
      alert("Tracking info updated successfully.");
    } catch (error) {
      console.error("Error updating tracking info:", error);
      alert("Failed to update tracking info");
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

  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.userId.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Orders</h1>
          <p className="text-text-light text-[15px]">View and update customer orders.</p>
        </div>
        <div className="relative w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-[8px] focus:outline-none focus:border-maroon"
          />
        </div>
      </div>

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Shipping</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                  <td className="p-4 text-[14px] font-mono text-ink">
                    {order.orderId || order.id}
                    <div className="text-[11px] text-text-light mt-1">User: {order.userName || order.userId}</div>
                    {order.userEmail && <div className="text-[11px] text-text-light">{order.userEmail}</div>}
                  </td>
                  <td className="p-4 text-[14px] text-text-light">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-[13px] text-text-light">
                    {order.shippingAddress ? (
                      <div className="flex flex-col gap-1">
                        <span title={order.shippingAddress.description}>{order.shippingAddress.description}</span>
                        {order.shippingAddress.lat && order.shippingAddress.lng ? (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${order.shippingAddress.lat},${order.shippingAddress.lng}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center text-maroon hover:underline text-[12px] mt-1"
                          >
                            <MapPin size={12} className="mr-1" /> View on Map
                          </a>
                        ) : (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress.description)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center text-maroon hover:underline text-[12px] mt-1"
                          >
                            <MapPin size={12} className="mr-1" /> Search on Map
                          </a>
                        )}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="p-4 text-[14px] font-bold text-maroon">₹{(order.totalAmount || order.total)?.toLocaleString('en-IN') || 0}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-[13px] border border-black/10 rounded p-1 bg-white focus:outline-none focus:border-maroon"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget as HTMLFormElement);
                          handleTrackingUpdate(order.id, formData.get('carrier') as string, formData.get('trackingNumber') as string);
                        }}
                        className="flex flex-col gap-1 mt-2"
                      >
                        <input name="carrier" defaultValue={order.carrier || ''} placeholder="Carrier" className="text-[12px] border border-black/10 rounded p-1 w-full" />
                        <input name="trackingNumber" defaultValue={order.trackingNumber || ''} placeholder="Tracking No." className="text-[12px] border border-black/10 rounded p-1 w-full" />
                        <button type="submit" className="text-[10px] bg-ink text-white px-2 py-1 rounded hover:bg-maroon transition-colors self-start w-full">Update Tracking</button>
                      </form>
                    </div>
                  </td>
                </tr>
                {(order.items && order.items.length > 0) && (
                  <tr className="border-b-[4px] border-black/10 bg-surface">
                    <td colSpan={6} className="p-4">
                      <div className="text-[13px] font-medium text-ink mb-2">Order Items:</div>
                      <div className="flex flex-wrap gap-4">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-accent-soft p-2 rounded-[8px] border border-black/5">
                            <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-[4px] mix-blend-multiply bg-[#f9f9f9]" />
                            <div>
                              <p className="text-[13px] font-medium text-ink whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={item.title}>{item.title}</p>
                              <p className="text-[12px] text-text-light">Size: {item.size} | Qty: {item.quantity}</p>
                              <p className="text-[13px] font-bold text-maroon">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-light">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
