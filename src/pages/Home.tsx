import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCollections } from '../context/CollectionContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const Home: React.FC = () => {
  const { categories } = useCollections();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  
  const [heroContent, setHeroContent] = useState({
    title: 'Handcrafted Elegance For Every Occasion',
    subtitle: 'Authentic Indian artistry woven into timeless silk and gold bangles.'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().heroTitle) {
          setHeroContent({
            title: docSnap.data().heroTitle,
            subtitle: docSnap.data().heroSubtitle || ''
          });
        }
      } catch (error) {
        console.error("Error fetching hero settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden p-4 md:p-10">
        <div className="relative w-full max-w-7xl h-[400px] md:h-[500px] bg-gradient-to-tr from-maroon to-maroon-dark rounded-[20px] flex items-center p-8 md:p-16 overflow-hidden">
          
          {/* Decorative Circle */}
          <div className="absolute -right-[50px] -top-[50px] w-[250px] h-[250px] md:w-[400px] md:h-[400px] border-[15px] border-gold/20 rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-xl text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-[36px] md:text-[52px] text-white font-bold mb-4 leading-[1.1]"
            >
              {heroContent.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[16px] text-white/90 mb-8 font-light whitespace-pre-wrap"
            >
              {heroContent.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link 
                to="/shop" 
                className="inline-block bg-gold text-white font-semibold px-8 py-3 rounded-[30px] text-[14px] uppercase tracking-wide transition-transform hover:scale-105"
              >
                Shop Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Row */}
      <section className="py-10 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex overflow-x-auto hide-scrollbar pb-4 space-x-[20px]">
            {categories.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 flex flex-col items-center gap-[10px] min-w-[80px] cursor-pointer group"
              >
                <Link to={`/shop?category=${category.id}`} className="flex flex-col items-center">
                  <div className="w-[64px] h-[64px] rounded-full bg-accent-soft border border-gold flex items-center justify-center overflow-hidden mb-2 group-hover:bg-gold/10 transition-colors">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[11px] font-semibold uppercase text-text-light group-hover:text-ink transition-colors">{category.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section className="py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif text-[24px] text-ink font-bold">Bestsellers</h2>
            </div>
            <Link to="/shop" className="hidden sm:block text-text-light hover:text-ink font-medium text-[13px] uppercase tracking-wide">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {bestsellers.slice(0, 3).map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface p-[12px] rounded-[12px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] group flex flex-col relative"
              >
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm text-maroon hover:scale-110 transition-transform"
                >
                  <Heart size={16} className={isInWishlist(product.id) ? "fill-maroon" : ""} />
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
          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop" className="inline-block border border-gold text-ink font-medium px-6 py-3 rounded-[30px] text-[13px] uppercase tracking-wide">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
