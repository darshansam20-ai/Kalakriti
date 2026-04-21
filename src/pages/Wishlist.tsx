import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export const Wishlist: React.FC = () => {
  const { products } = useProducts();
  const { user, wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="bg-bg min-h-screen py-20 flex flex-col items-center justify-center">
        <Heart size={64} className="text-black/10 mb-6" />
        <h1 className="font-serif text-[32px] font-bold text-ink mb-4">Your Wishlist</h1>
        <p className="text-text-light mb-8 text-[15px]">Please log in to view your wishlist.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-maroon text-white font-semibold px-8 py-3 rounded-[30px] text-[14px] uppercase tracking-wide hover:bg-maroon-dark transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-12">
          <h1 className="font-serif text-[36px] md:text-[42px] text-ink font-bold mb-4">
            Your Wishlist
          </h1>
          <p className="text-text-light text-[15px]">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-[16px] border border-black/5">
            <Heart size={48} className="mx-auto text-black/10 mb-6" />
            <p className="text-text-light text-[16px] mb-6">Your wishlist is currently empty.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-gold text-white font-semibold px-8 py-3 rounded-[30px] text-[14px] uppercase tracking-wide hover:bg-gold/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px]">
            {wishlistedProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface p-[12px] rounded-[12px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] group flex flex-col relative"
              >
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm text-maroon hover:scale-110 transition-transform"
                >
                  <Heart size={16} className="fill-maroon" />
                </button>

                <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden block bg-[#f9f9f9] rounded-[8px] mb-[12px]">
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="flex flex-col flex-grow">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-[14px] text-ink mb-[4px] line-clamp-1 hover:text-maroon transition-colors">{product.title}</h3>
                  </Link>
                  {product.rating > 0 && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-black/10"} />
                        ))}
                      </div>
                      <span className="text-[11px] text-text-light ml-1.5">({product.reviews})</span>
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-[16px] text-maroon">₹{product.price.toLocaleString('en-IN')}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product, product.sizes[0]);
                      }}
                      className="text-text-light hover:text-maroon p-1 transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={18} />
                    </button>
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
