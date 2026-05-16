import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCollections } from '../context/CollectionContext';

export const Collections: React.FC = () => {
  const { categories, loading } = useCollections();

  if (loading) {
    return (
      <div className="bg-bg min-h-screen pt-12 pb-24 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-16 text-center">
          <h1 className="font-serif text-[36px] md:text-[48px] text-ink font-bold mb-4">
            Our Collections
          </h1>
          <p className="text-text-light max-w-2xl mx-auto text-[15px]">
            Explore our curated collections of handcrafted bangles, designed for every occasion and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-[16px] aspect-[4/3] md:aspect-[16/9] bg-surface border border-black/5"
            >
              <Link to={`/shop?category=${category.id}`} className="block w-full h-full">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent flex flex-col justify-end p-8">
                  <h2 className="font-serif text-[28px] text-white font-bold mb-2">{category.name}</h2>
                  <span className="text-white/90 text-[13px] uppercase tracking-wide font-medium flex items-center group-hover:text-gold transition-colors">
                    Explore Collection <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
