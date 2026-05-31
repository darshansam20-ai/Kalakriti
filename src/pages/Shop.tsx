import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCollections } from '../context/CollectionContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFilterSettings } from '../context/FilterSettingsContext';
import { Filter, ChevronDown, Star, ShoppingBag, Heart } from 'lucide-react';

export const Shop: React.FC = () => {
  const { categories } = useCollections();
  const { products } = useProducts();
  const { settings: filterSettings } = useFilterSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const activeCategory = searchParams.get('category');
  const activeMaterial = searchParams.get('material');
  const activeColor = searchParams.get('color');
  const activeOccasion = searchParams.get('occasion');
  const searchQuery = searchParams.get('q');

  const materialConfig = filterSettings.filterGroups.find(g => g.id === 'material');
  const availableMaterials = useMemo(() => {
    if (materialConfig?.options && materialConfig.options.length > 0) return materialConfig.options;
    return Array.from(new Set(products.map(p => p.material).filter(Boolean)));
  }, [products, materialConfig]);

  const colorConfig = filterSettings.filterGroups.find(g => g.id === 'color');
  const availableColors = useMemo(() => {
    if (colorConfig?.options && colorConfig.options.length > 0) return colorConfig.options;
    return Array.from(new Set(products.map(p => p.color).filter(Boolean)));
  }, [products, colorConfig]);

  const occasionConfig = filterSettings.filterGroups.find(g => g.id === 'occasion');
  const availableOccasions = useMemo(() => {
    if (occasionConfig?.options && occasionConfig.options.length > 0) return occasionConfig.options;
    return Array.from(new Set(products.map(p => p.occasion).filter(Boolean)));
  }, [products, occasionConfig]);

  const enabledSortOptions = useMemo(() => filterSettings.sortOptions.filter(o => o.enabled), [filterSettings]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.categories?.some(c => c.toLowerCase().includes(q)) ||
        p.material.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    
    if (activeCategory) {
      const categoryName = categories.find(c => c.id === activeCategory)?.name;
      if (categoryName) {
        result = result.filter(p => p.categories?.includes(categoryName));
      }
    }
    
    if (activeMaterial) {
      result = result.filter(p => p.material.toLowerCase() === activeMaterial.toLowerCase());
    }

    if (activeColor) {
      result = result.filter(p => p.color.toLowerCase() === activeColor.toLowerCase());
    }

    if (activeOccasion) {
      result = result.filter(p => p.occasion.toLowerCase() === activeOccasion.toLowerCase());
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNewArrival === b.isNewArrival ? 0 : a.isNewArrival ? -1 : 1));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popular':
      case 'bestselling':
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [activeCategory, activeMaterial, activeColor, activeOccasion, sortBy, products]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-bg min-h-screen pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-[32px] md:text-[42px] text-ink font-bold mb-4">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : activeCategory 
                ? categories.find(c => c.id === activeCategory)?.name 
                : 'All Collection'}
          </h1>
          <p className="text-text-light max-w-2xl text-[15px]">
            {searchQuery 
              ? `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'result' : 'results'}`
              : 'Discover our handcrafted collection of jewelry, designed to add a touch of elegance to every moment.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 text-ink font-medium border border-gold/20 px-4 py-2 rounded-full"
            >
              <Filter size={18} />
              <span className="text-[13px] uppercase tracking-wide">Filters</span>
            </button>
            
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-gold/20 text-ink font-medium px-4 py-2 pr-10 rounded-full focus:outline-none focus:border-gold text-[13px] uppercase tracking-wide"
              >
                {enabledSortOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
                {enabledSortOptions.length === 0 && <option value="popular">Popularity</option>}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink pointer-events-none" />
            </div>
          </div>

          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-8">
              
              {/* Category Filter */}
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-ink mb-4 border-b border-gold/20 pb-2">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => updateFilter('category', null)}
                      className={`text-[13px] uppercase tracking-wide ${!activeCategory ? 'text-maroon font-bold' : 'text-text-light hover:text-ink'}`}
                    >
                      All Jewelry
                    </button>
                  </li>
                  {categories.map(c => (
                    <li key={c.id}>
                      <button 
                        onClick={() => updateFilter('category', c.id)}
                        className={`text-[13px] uppercase tracking-wide ${activeCategory === c.id ? 'text-maroon font-bold' : 'text-text-light hover:text-ink'}`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Material Filter */}
              {materialConfig?.enabled !== false && availableMaterials.length > 0 && (
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-ink mb-4 border-b border-gold/20 pb-2">{materialConfig?.label || 'Material'}</h3>
                <ul className="space-y-3">
                  {availableMaterials.map(mat => (
                    <li key={mat}>
                      <button 
                        onClick={() => updateFilter('material', activeMaterial === mat ? null : mat)}
                        className={`text-[13px] uppercase tracking-wide flex items-center space-x-2`}
                      >
                        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${activeMaterial === mat ? 'bg-maroon border-maroon' : 'border-gold/30'}`}>
                          {activeMaterial === mat && <div className="w-2 h-2 bg-surface rounded-sm" />}
                        </div>
                        <span className={activeMaterial === mat ? 'text-maroon font-bold' : 'text-text-light'}>{mat}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Color Filter */}
              {colorConfig?.enabled !== false && availableColors.length > 0 && (
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-ink mb-4 border-b border-gold/20 pb-2">{colorConfig?.label || 'Color'}</h3>
                <ul className="space-y-3">
                  {availableColors.map(color => (
                    <li key={color}>
                      <button 
                        onClick={() => updateFilter('color', activeColor === color ? null : color)}
                        className={`text-[13px] uppercase tracking-wide flex items-center space-x-2`}
                      >
                        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${activeColor === color ? 'bg-maroon border-maroon' : 'border-gold/30'}`}>
                          {activeColor === color && <div className="w-2 h-2 bg-surface rounded-sm" />}
                        </div>
                        <span className={activeColor === color ? 'text-maroon font-bold' : 'text-text-light'}>{color}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Occasion Filter */}
              {occasionConfig?.enabled !== false && availableOccasions.length > 0 && (
              <div>
                <h3 className="font-serif text-[18px] font-semibold text-ink mb-4 border-b border-gold/20 pb-2">{occasionConfig?.label || 'Occasion'}</h3>
                <ul className="space-y-3">
                  {availableOccasions.map(occ => (
                    <li key={occ}>
                      <button 
                        onClick={() => updateFilter('occasion', activeOccasion === occ ? null : occ)}
                        className={`text-[13px] uppercase tracking-wide flex items-center space-x-2`}
                      >
                        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${activeOccasion === occ ? 'bg-maroon border-maroon' : 'border-gold/30'}`}>
                          {activeOccasion === occ && <div className="w-2 h-2 bg-surface rounded-sm" />}
                        </div>
                        <span className={activeOccasion === occ ? 'text-maroon font-bold' : 'text-text-light'}>{occ}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              )}

            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Desktop Sort */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <p className="text-text-light text-[13px] uppercase tracking-wide">Showing {filteredProducts.length} products</p>
              <div className="flex items-center space-x-2">
                <span className="text-[13px] uppercase tracking-wide text-text-light">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent border-b border-gold/20 text-ink font-medium py-1 pr-6 focus:outline-none focus:border-maroon cursor-pointer text-[13px] uppercase tracking-wide"
                  >
                    {enabledSortOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    {enabledSortOptions.length === 0 && <option value="popular">Popularity</option>}
                  </select>
                  <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-light text-[15px]">No products found matching your criteria.</p>
                <button 
                  onClick={() => {
                    updateFilter('category', null);
                    updateFilter('material', null);
                    updateFilter('color', null);
                    updateFilter('occasion', null);
                  }}
                  className="mt-4 text-maroon underline underline-offset-4 text-[13px] uppercase tracking-wide"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[20px]">
                {filteredProducts.map((product, index) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
