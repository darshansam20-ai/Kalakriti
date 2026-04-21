import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Product, products as initialProductsData } from '../data/products';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Seed initial products
          const seededProducts: Product[] = [];
          for (const item of initialProductsData) {
            await setDoc(doc(db, 'products', item.id), item);
            seededProducts.push(item);
          }
          setProducts(seededProducts);
        } else {
          const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newDocRef = doc(collection(db, 'products'));
      const newProduct = { ...productData, id: newDocRef.id };
      await setDoc(newDocRef, newProduct);
      setProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), data);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
