import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, setDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { categories as initialCategories } from '../data/products';

export interface Category {
  id: string;
  name: string;
  image: string;
}

interface CollectionContextType {
  categories: Category[];
  loading: boolean;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>, newId?: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'categories'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Seed initial categories
          const seededCategories: Category[] = [];
          for (const item of initialCategories) {
            await setDoc(doc(db, 'categories', item.id), item);
            seededCategories.push({ ...item });
          }
          setCategories(seededCategories);
        } else {
          const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newDocRef = doc(collection(db, 'categories'));
      const newCategory = { ...categoryData, id: newDocRef.id };
      await setDoc(newDocRef, newCategory);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>, newId?: string) => {
    try {
      if (newId && newId !== id) {
        const oldRef = doc(db, 'categories', id);
        const newRef = doc(db, 'categories', newId);
        
        const oldDoc = await getDoc(oldRef);
        if (oldDoc.exists()) {
          const docData = oldDoc.data();
          await setDoc(newRef, { ...docData, ...data, id: newId });
          await deleteDoc(oldRef);
          setCategories(prev => prev.map(p => p.id === id ? { ...p, ...data, id: newId } : p));
        }
      } else {
        await updateDoc(doc(db, 'categories', id), data);
        setCategories(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      }
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  return (
    <CollectionContext.Provider value={{ categories, loading, addCategory, updateCategory, removeCategory }}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};
