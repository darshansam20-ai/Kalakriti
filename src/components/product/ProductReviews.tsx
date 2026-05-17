import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import { Star, Upload, MessageSquare, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export const ProductReviews: React.FC<{ productId: string }> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        
        // Sort by createdAt descending locally since composite index might be needed otherwise
        fetchedReviews.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        });

        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        return getDownloadURL(snapshot.ref);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      alert("Please select a valid rating.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.uid,
        userName: user.displayName || 'Customer',
        rating,
        comment,
        images,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      alert("Review submitted successfully! It will appear once approved.");
      setRating(5);
      setComment('');
      setImages([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-black/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-[28px] font-bold text-ink">Customer Reviews</h2>
        <button 
          onClick={() => {
            if (!user) {
              alert("Please log in to write a review.");
              return;
            }
            setShowForm(!showForm);
          }}
          className="bg-maroon text-white px-6 py-2 rounded-[30px] font-medium text-[14px] uppercase tracking-wide hover:bg-maroon-dark transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12 bg-surface p-6 rounded-[16px] border border-black/5"
            onSubmit={handleSubmit}
          >
            <h3 className="font-serif text-[20px] font-bold mb-4 text-ink">Write Your Review</h3>
            
            <div className="mb-6">
              <label className="block text-[14px] font-medium text-text-light mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star size={24} className={star <= rating ? "fill-gold text-gold" : "text-black/10"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-medium text-text-light mb-2">Review Comment</label>
              <textarea 
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think about this product..."
                rows={4}
                className="w-full border border-black/10 rounded-[8px] px-4 py-3 text-[14px] focus:outline-none focus:border-maroon"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-medium text-text-light mb-2">Add Photos (Optional)</label>
              <div className="flex gap-4 flex-wrap">
                {images.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-[8px] overflow-hidden border border-black/10">
                    <img src={url} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 border-2 border-dashed border-black/20 rounded-[8px] flex flex-col items-center justify-center text-text-light hover:border-maroon hover:text-maroon transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="text-[10px] font-medium">Uploading...</span>
                  ) : (
                    <>
                      <Upload size={20} className="mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">Upload</span>
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                  multiple
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="bg-ink text-white px-8 py-3 rounded-[30px] font-medium text-[14px] uppercase tracking-wide hover:bg-maroon transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {loading ? (
          <p className="text-text-light">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-[16px] border border-black/5">
            <MessageSquare size={40} className="mx-auto text-black/10 mb-4" strokeWidth={1} />
            <p className="text-[15px] text-text-light">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="pb-6 border-b border-black/5 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-ink flex items-center gap-2">
                    {review.userName || 'Customer'}
                    <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center">
                      Verified
                    </span>
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "fill-gold text-gold" : "text-black/10"} />
                    ))}
                    <span className="ml-2 text-[12px] text-text-light">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[14px] text-ink mt-3">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Review attachment" className="w-20 h-20 object-cover rounded-[8px] border border-black/5 cursor-pointer hover:opacity-90" referrerPolicy="no-referrer" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
