import React from 'react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/20">
              <h2 className="font-serif text-[24px] font-semibold text-ink flex items-center">
                <ShoppingBag className="mr-2" /> Your Cart
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 text-text-light hover:text-maroon hover:bg-accent-soft rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-light space-y-4">
                  <ShoppingBag size={64} strokeWidth={1} />
                  <p className="text-[16px]">Your cart is currently empty.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-4 px-8 py-3 bg-maroon text-white font-semibold rounded-[30px] hover:bg-maroon-dark transition-colors text-[14px] uppercase tracking-wide"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.cartId} className="flex space-x-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[8px] border border-black/5 bg-[#f9f9f9]">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover object-center mix-blend-multiply"
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-[15px] font-medium text-ink">
                            <h3 className="line-clamp-2"><Link to={`/product/${item.id}`} onClick={closeCart} className="hover:text-maroon transition-colors">{item.title}</Link></h3>
                            <p className="ml-4 whitespace-nowrap font-bold text-maroon">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                          <p className="mt-1 text-[13px] text-text-light">Size: {item.selectedSize}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-[14px]">
                          <div className="flex items-center border border-gold/30 rounded-full overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                              className="p-1.5 text-ink hover:bg-accent-soft transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 font-medium text-ink">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                              className="p-1.5 text-ink hover:bg-accent-soft transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartId)}
                            className="font-medium text-text-light hover:text-maroon underline underline-offset-4 text-[13px] uppercase tracking-wide"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gold/20 p-6 bg-surface">
                <div className="flex justify-between text-[18px] font-bold text-ink mb-4">
                  <p>Subtotal</p>
                  <p className="text-maroon">₹{cartTotal.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-[13px] text-text-light mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center rounded-[30px] border border-transparent bg-maroon px-6 py-4 text-[14px] uppercase tracking-wide font-semibold text-white shadow-md hover:bg-maroon-dark transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full flex items-center justify-center rounded-[30px] border border-gold px-6 py-4 text-[14px] uppercase tracking-wide font-semibold text-ink bg-transparent hover:bg-accent-soft transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
