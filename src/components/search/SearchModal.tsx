import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.categories?.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
        p.material.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit to 5 results

  const handleSelect = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() !== '') {
      onClose();
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 w-full bg-surface shadow-2xl z-50 rounded-b-[24px] overflow-hidden"
          >
            <div className="max-w-4xl mx-auto p-6 md:p-8">
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-black/10 pb-4">
                <SearchIcon size={24} className="text-text-light mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for jewelry, collections, materials..."
                  className="flex-grow bg-transparent text-[18px] md:text-[24px] text-ink focus:outline-none font-serif placeholder:text-black/20"
                />
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-2 text-text-light hover:text-maroon hover:bg-accent-soft rounded-full transition-colors ml-4"
                >
                  <X size={24} />
                </button>
              </form>

              {query.trim() !== '' && (
                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-[12px] uppercase tracking-wider text-text-light font-bold mb-4">Products</h3>
                      {results.map(product => (
                        <div 
                          key={product.id}
                          onClick={() => handleSelect(product.id)}
                          className="flex items-center space-x-4 p-2 hover:bg-accent-soft rounded-[12px] cursor-pointer transition-colors"
                        >
                          <img src={product.images[0]} alt={product.title} className="w-16 h-16 object-cover rounded-[8px] bg-[#f9f9f9] mix-blend-multiply" />
                          <div>
                            <h4 className="text-[15px] font-medium text-ink">{product.title}</h4>
                            <p className="text-[13px] text-text-light">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={handleSearchSubmit}
                        className="w-full mt-4 py-3 text-center text-[13px] uppercase tracking-wide font-medium text-maroon hover:bg-accent-soft rounded-[12px] transition-colors"
                      >
                        View all results for "{query}"
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-text-light text-[15px]">No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
