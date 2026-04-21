import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { Edit2, Trash2, X, Plus, Package } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  updatedAt: string;
}

export const AdminShipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orderId: '',
    trackingNumber: '',
    carrier: '',
    status: 'preparing'
  });

  const fetchShipments = async () => {
    try {
      const q = query(collection(db, 'shipments'));
      const snapshot = await getDocs(q);
      const fetchedShipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
      
      // Sort newest updated first
      fetchedShipments.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      setShipments(fetchedShipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (shipment: Shipment) => {
    setIsEditing(shipment.id);
    setFormData({
      orderId: shipment.orderId,
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ orderId: '', trackingNumber: '', carrier: '', status: 'preparing' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const savePayload = { ...formData, updatedAt: new Date().toISOString() };
    
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'shipments', isEditing), savePayload);
        setShipments(prev => prev.map(s => s.id === isEditing ? { ...s, ...savePayload } : s));
      } else {
        const docRef = await addDoc(collection(db, 'shipments'), savePayload);
        setShipments(prev => [{ id: docRef.id, ...savePayload }, ...prev]);
        
        // Bonus: Update the corresponding order status as well if tracking is added
        if (formData.status !== 'preparing') {
          try {
             await updateDoc(doc(db, 'orders', formData.orderId), { status: formData.status === 'delivered' ? 'delivered' : 'shipped' });
          } catch(err) {
             console.warn("Could not auto-update order status", err);
          }
        }
      }
      resetForm();
    } catch (error) {
      console.error("Error saving shipment:", error);
      alert("Failed to save shipment.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment record?')) {
      try {
        await deleteDoc(doc(db, 'shipments', id));
        setShipments(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Error deleting shipment:", error);
        alert("Failed to delete shipment");
      }
    }
  };

  if (loading) return <div className="p-8">Loading shipments...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Shipments</h1>
          <p className="text-text-light text-[15px]">Track and update order shipping statuses.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-maroon text-white font-medium text-[13px] rounded-[8px] hover:bg-maroon-dark transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add Shipment Details
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-[20px] font-bold text-ink">{isEditing ? 'Edit Shipment' : 'Add New Shipment'}</h2>
            <button onClick={resetForm} className="text-text-light hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Order ID</label>
              <input required type="text" name="orderId" value={formData.orderId} onChange={handleInputChange} disabled={!!isEditing} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px] disabled:bg-black/5 disabled:text-text-light" placeholder="e.g. ord123abc" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Carrier</label>
              <input required type="text" name="carrier" value={formData.carrier} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" placeholder="e.g. DTDC, FedEx, BlueDart" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Tracking Number</label>
              <input required type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-black/10 rounded-[8px] px-3 py-2 text-[14px] bg-white">
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="in-transit">In Transit</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception / Delayed</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-[13px] font-medium text-text-light hover:text-ink transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-maroon text-white text-[13px] font-semibold tracking-wide rounded-[8px] hover:bg-maroon-dark transition-colors">
                {isEditing ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Tracking Info</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Updated</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center text-[14px] font-medium text-ink">
                    <Package size={14} className="mr-2 text-text-light" />
                    {shipment.orderId}
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-[14px] text-ink">{shipment.trackingNumber}</p>
                  <p className="text-[12px] text-text-light">{shipment.carrier}</p>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                    shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'exception' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {shipment.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="p-4 text-[13px] text-text-light">
                  {new Date(shipment.updatedAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => startEdit(shipment)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-2">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(shipment.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-light">No shipment records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
