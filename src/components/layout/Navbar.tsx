import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart, LogOut, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from '../auth/AuthModal';
import { SearchModal } from '../search/SearchModal';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAILS = ['darshansam20@gmail.com', 'kalakriticreations80@gmail.com'];

export const Navbar: React.FC = () => {
  const { cartCount, openCart } = useCart();
  const { user, logout, wishlist } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [storeName, setStoreName] = useState('Kalakriti');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storeName) {
          setStoreName(docSnap.data().storeName);
        }
      } catch (error) {
        console.error("Error fetching navbar settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleUserClick = () => {
    if (user) {
      setIsUserDropdownOpen(!isUserDropdownOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleWishlistClick = () => {
    if (user) {
      navigate('/wishlist');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-[72px]">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-ink hover:text-maroon p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="font-serif text-[24px] font-bold text-maroon tracking-[2px] uppercase">
              {storeName}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-[32px]">
            <Link to="/collections" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Collection</Link>
            <Link to="/shop" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Bestsellers</Link>
            <Link to="/shop?category=bridal" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Custom Made</Link>
            <Link to="/shop?category=daily" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Our Story</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-[20px]">
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="text-ink hover:text-maroon transition-colors hidden sm:block"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={handleWishlistClick}
              className="text-ink hover:text-maroon transition-colors hidden sm:block relative p-2"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[6px] py-[2px] text-[10px] font-bold leading-none text-white bg-maroon rounded-[10px] transform translate-x-1/4 -translate-y-1/4">
                  {wishlist.length}
                </span>
              )}
            </button>
            <div className="relative hidden sm:block">
              <button 
                onClick={handleUserClick}
                className="text-ink hover:text-maroon transition-colors p-2"
              >
                {user && user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} />
                )}
              </button>
              
              {/* User Dropdown */}
              <AnimatePresence>
                {isUserDropdownOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-surface border border-gold/20 rounded-[12px] shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gold/10 mb-2">
                      <p className="text-[13px] font-medium text-ink truncate">{user.displayName || 'User'}</p>
                      <p className="text-[11px] text-text-light truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-[13px] text-ink hover:bg-accent-soft hover:text-maroon transition-colors"
                    >
                      <Heart size={16} className="mr-2" /> Wishlist
                    </Link>
                    <Link 
                      to="/orders" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-[13px] text-ink hover:bg-accent-soft hover:text-maroon transition-colors"
                    >
                      <Package size={16} className="mr-2" /> Orders
                    </Link>
                    {user.email && ADMIN_EMAILS.includes(user.email) && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-[13px] text-ink hover:bg-accent-soft hover:text-maroon transition-colors border-t border-gold/10 mt-1 pt-2"
                      >
                        <User size={16} className="mr-2" /> Admin Portal
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-[13px] text-ink hover:bg-accent-soft hover:text-maroon transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={openCart}
              className="text-ink hover:text-maroon transition-colors relative p-2"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[6px] py-[2px] text-[10px] font-bold leading-none text-white bg-maroon rounded-[10px] transform translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-gold/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-[13px] uppercase tracking-[1px] font-medium text-ink border-b border-black/5">Collection</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-[13px] uppercase tracking-[1px] font-medium text-ink border-b border-black/5">Bestsellers</Link>
              <Link to="/shop?category=bridal" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-[13px] uppercase tracking-[1px] font-medium text-ink border-b border-black/5">Custom Made</Link>
              <Link to="/shop?category=daily" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-[13px] uppercase tracking-[1px] font-medium text-ink border-b border-black/5">Our Story</Link>
              <div className="flex space-x-6 px-3 py-4">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchModalOpen(true);
                  }}
                  className="flex items-center text-ink text-[13px] uppercase tracking-[1px] font-medium"
                >
                  <Search size={20} className="mr-2" /> Search
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleWishlistClick();
                  }}
                  className="flex items-center text-ink text-[13px] uppercase tracking-[1px] font-medium"
                >
                  <Heart size={20} className="mr-2" /> Wishlist
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleUserClick();
                  }}
                  className="flex items-center text-ink text-[13px] uppercase tracking-[1px] font-medium"
                >
                  <User size={20} className="mr-2" /> {user ? 'Account' : 'Login'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </header>
  );
};
