import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Trash2, MessageSquare, Star } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { products } = useProducts();

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'));
      const snapshot = await getDocs(q);
      const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      
      // Sort to show pending first, then newest
      fetchedReviews.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: newStatus });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    } catch (error) {
      console.error("Error updating review status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        setReviews(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : productId;
  };

  if (loading) return <div className="p-8">Loading reviews...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-bold text-ink mb-2">Manage Reviews</h1>
        <p className="text-text-light text-[15px]">Approve, reject, or delete customer reviews.</p>
      </div>

      <div className="bg-surface rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-soft border-b border-black/5 text-[12px] uppercase tracking-wider text-text-light">
              <th className="p-4 font-medium w-1/4">Product</th>
              <th className="p-4 font-medium w-1/2">Review</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-black/5 hover:bg-bg/50 transition-colors">
                <td className="p-4 align-top">
                  <p className="text-[14px] font-medium text-ink">{getProductName(review.productId)}</p>
                  <p className="text-[12px] text-text-light truncate w-32 md:w-auto" title={review.userId}>User: {review.userId.substring(0, 8)}...</p>
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-center text-maroon mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? "fill-maroon" : "text-black/10 fill-transparent"} />
                    ))}
                    <span className="ml-2 text-[12px] text-text-light">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[13px] text-text-light mt-1 flex items-start">
                    <MessageSquare size={14} className="mr-2 mt-0.5 flex-shrink-0 opacity-50" />
                    {review.comment || <span className="italic opacity-50">No comment</span>}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt="review attachment" className="w-12 h-12 object-cover rounded shadow-sm border border-black/5" referrerPolicy="no-referrer" />
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 align-top">
                  <select 
                    value={review.status}
                    onChange={(e) => handleStatusChange(review.id, e.target.value)}
                    className={`text-[12px] border rounded-[6px] px-2 py-1 focus:outline-none font-semibold uppercase tracking-wider ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 focus:border-green-400' : 
                      review.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 focus:border-red-400' :
                      'bg-orange-100 text-orange-800 border-orange-200 focus:border-orange-400'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-4 text-right align-top">
                  <button onClick={() => handleDelete(review.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-light">No reviews found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
