import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart, LogOut, Package, MapPin } from 'lucide-react';
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
  const location = useLocation();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-ink hover:text-maroon p-2"
            >
              <Menu size={24} />
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
            <Link to="/shop?category=custom-made" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Custom Made</Link>
            <Link to="/shop?category=daily-wear" className="text-[13px] uppercase tracking-[1px] font-medium text-ink hover:text-maroon transition-colors">Our Story</Link>
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
            <div className="relative" ref={dropdownRef}>
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
                    <Link 
                      to="/addresses" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-[13px] text-ink hover:bg-accent-soft hover:text-maroon transition-colors"
                    >
                      <MapPin size={16} className="mr-2" /> Addresses
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 h-[100dvh] w-[80%] max-w-[320px] bg-surface z-[70] shadow-2xl flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gold/20">
              <span className="font-serif text-[20px] font-bold text-maroon tracking-[2px] uppercase">
                {storeName}
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-ink hover:text-maroon transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-8 px-6">
              <nav className="flex flex-col space-y-6">
                <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] uppercase tracking-[1.5px] font-medium text-ink hover:text-maroon transition-colors">Collection</Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] uppercase tracking-[1.5px] font-medium text-ink hover:text-maroon transition-colors">Bestsellers</Link>
                <Link to="/shop?category=custom-made" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] uppercase tracking-[1.5px] font-medium text-ink hover:text-maroon transition-colors">Custom Made</Link>
                <Link to="/shop?category=daily-wear" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] uppercase tracking-[1.5px] font-medium text-ink hover:text-maroon transition-colors">Our Story</Link>
              </nav>

              <div className="mt-12 pt-8 border-t border-gold/20 space-y-6">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchModalOpen(true);
                  }}
                  className="flex items-center text-ink text-[14px] uppercase tracking-[1.5px] font-medium hover:text-maroon w-full transition-colors"
                >
                  <Search size={22} className="mr-4" /> Search
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleWishlistClick();
                  }}
                  className="flex items-center text-ink text-[14px] uppercase tracking-[1.5px] font-medium hover:text-maroon w-full transition-colors"
                >
                  <Heart size={22} className="mr-4" /> Wishlist
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleUserClick();
                  }}
                  className="flex items-center text-ink text-[14px] uppercase tracking-[1.5px] font-medium hover:text-maroon w-full transition-colors"
                >
                  <User size={22} className="mr-4" /> {user ? 'Account' : 'Login'}
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
