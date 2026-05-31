import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Star, ChevronDown, ChevronUp, ShoppingBag, Truck, ShieldCheck, Heart, X, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { ProductReviews } from '../components/product/ProductReviews';

export const ProductDetail: React.FC = () => {
  const { products } = useProducts();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist, user } = useAuth();
  
  const product = products.find(p => p.id === id);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || '');
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-maroon-900">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <button onClick={() => navigate('/shop')} className="underline underline-offset-4">Return to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize || '');
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize || '');
    openCart();
    // In a real app, this might redirect straight to checkout
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const discountPercentage = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="bg-bg min-h-screen py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-24 flex-shrink-0">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-[8px] overflow-hidden border flex-shrink-0 w-20 md:w-full bg-[#f9f9f9] ${selectedImage === idx ? 'border-maroon' : 'border-black/5 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply p-1" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div 
              className="flex-1 relative aspect-[4/5] md:aspect-square rounded-[12px] overflow-hidden bg-[#f9f9f9] border border-black/5 cursor-zoom-in group"
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} className="text-ink" />
              </div>
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]} 
                alt={product.title} 
                className="w-full h-full object-contain mix-blend-multiply p-4"
                referrerPolicy="no-referrer"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-maroon text-white px-6 py-2 rounded-full font-medium tracking-wider uppercase text-[13px]">Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <nav className="text-[13px] uppercase tracking-wide text-text-light mb-4">
              <span className="hover:text-ink cursor-pointer" onClick={() => navigate('/')}>Home</span>
              <span className="mx-2">/</span>
              <span className="hover:text-ink cursor-pointer" onClick={() => navigate('/shop')}>Shop</span>
              <span className="mx-2">/</span>
              <span className="text-ink">{product.title}</span>
            </nav>

            <h1 className="font-serif text-[32px] md:text-[42px] font-bold text-ink mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-black/10"} />
                ))}
              </div>
              <span className="text-[13px] uppercase tracking-wide text-text-light">{product.rating} ({product.reviews} reviews)</span>
              
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="ml-auto flex items-center space-x-2 text-[13px] uppercase tracking-wide font-medium text-text-light hover:text-maroon transition-colors"
              >
                <Heart size={18} className={isInWishlist(product.id) ? "fill-maroon text-maroon" : ""} />
                <span>{isInWishlist(product.id) ? 'Saved' : 'Save to Wishlist'}</span>
              </button>
            </div>

            <div className="flex items-end space-x-4 mb-8">
              <span className="text-[28px] font-bold text-maroon">₹{product.price.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-[16px] text-text-light line-through mb-1">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-[12px] font-bold text-maroon bg-maroon/10 px-2 py-1 rounded mb-1">{discountPercentage}% OFF</span>
                </>
              )}
            </div>

            <p className="text-text-light leading-relaxed mb-8 text-[15px]">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-ink text-[14px]">Select Size</span>
                  <button className="text-[13px] text-text-light underline underline-offset-4 hover:text-ink">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border flex items-center justify-center text-[14px] font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-maroon bg-maroon text-white shadow-md' 
                          : 'border-black/10 text-ink hover:border-maroon'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-surface border border-gold text-ink font-semibold px-8 py-4 rounded-[30px] uppercase text-[14px] tracking-wide hover:bg-accent-soft transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="mr-2" size={18} />
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-maroon text-white font-semibold px-8 py-4 rounded-[30px] uppercase text-[14px] tracking-wide hover:bg-maroon-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy it Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-12 py-6 border-y border-gold/20">
              <div className="flex items-center space-x-3 text-ink">
                <Truck className="text-gold" size={20} />
                <span className="text-[13px] uppercase tracking-wide font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-3 text-ink">
                <ShieldCheck className="text-gold" size={20} />
                <span className="text-[13px] uppercase tracking-wide font-medium">Secure Payments</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-4">
              {/* Details Accordion */}
              <div className="border border-black/5 rounded-[12px] overflow-hidden bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex justify-between items-center p-5 text-left font-serif text-[18px] font-medium text-ink hover:bg-accent-soft transition-colors"
                >
                  Product Details & Materials
                  {openAccordion === 'details' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'details' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-text-light text-[14px] space-y-2">
                        <p><strong className="text-ink">Material:</strong> {product.material}</p>
                        <p><strong className="text-ink">Color:</strong> {product.color}</p>
                        <p><strong className="text-ink">Occasion:</strong> {product.occasion}</p>
                        <p className="pt-2">Each piece is handcrafted by skilled artisans. Slight variations in color and design are inherent to the handmade process, making your piece truly unique.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping Accordion */}
              <div className="border border-black/5 rounded-[12px] overflow-hidden bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex justify-between items-center p-5 text-left font-serif text-[18px] font-medium text-ink hover:bg-accent-soft transition-colors"
                >
                  Shipping & Returns
                  {openAccordion === 'shipping' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-text-light text-[14px] space-y-2 whitespace-pre-line">
                        {product.shippingReturns || (
                          <>
                            <p>Standard shipping takes 3-5 business days within India.</p>
                            <p>International shipping takes 10-15 business days.</p>
                            <p>We accept returns within 7 days of delivery for unworn items in their original packaging.</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care Accordion */}
              <div className="border border-black/5 rounded-[12px] overflow-hidden bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex justify-between items-center p-5 text-left font-serif text-[18px] font-medium text-ink hover:bg-accent-soft transition-colors"
                >
                  Care Instructions
                  {openAccordion === 'care' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-text-light text-[14px] space-y-2 whitespace-pre-line">
                        {product.careInstructions || (
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Store in a cool, dry place, preferably in the provided box or a soft pouch.</li>
                            <li>Avoid direct contact with perfumes, lotions, and water.</li>
                            <li>Wipe with a soft, dry cloth after use to maintain the shine.</li>
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        <ProductReviews productId={product.id} />
      </div>

      {/* Image Modal for Full View */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-white/70 transition-colors p-2 bg-black/50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
            >
              <X size={32} strokeWidth={1.5} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={product.images[selectedImage]}
              alt={product.title}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-[8px]"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
