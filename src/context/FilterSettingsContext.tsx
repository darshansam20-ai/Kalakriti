import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface FilterGroupDef {
  id: 'material' | 'color' | 'occasion';
  enabled: boolean;
  label: string;
  options: string[];
}

export interface SortOptionDef {
  id: 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'newest' | 'bestselling';
  enabled: boolean;
  label: string;
}

export interface FilterSettings {
  filterGroups: FilterGroupDef[];
  sortOptions: SortOptionDef[];
}

interface FilterSettingsContextType {
  settings: FilterSettings;
  updateSettings: (newSettings: FilterSettings) => Promise<void>;
  loading: boolean;
}

const defaultSettings: FilterSettings = {
  filterGroups: [
    { id: 'material', enabled: true, label: 'Material', options: [] },
    { id: 'color', enabled: true, label: 'Color', options: [] },
    { id: 'occasion', enabled: true, label: 'Occasion', options: [] },
  ],
  sortOptions: [
    { id: 'price-low', enabled: true, label: 'Price: Low to High' },
    { id: 'price-high', enabled: true, label: 'Price: High to Low' },
    { id: 'name-asc', enabled: true, label: 'Name: A to Z' },
    { id: 'name-desc', enabled: true, label: 'Name: Z to A' },
    { id: 'newest', enabled: true, label: 'Newest Arrivals' },
    { id: 'bestselling', enabled: true, label: 'Bestselling' },
  ]
};

const FilterSettingsContext = createContext<FilterSettingsContextType | undefined>(undefined);

export const FilterSettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<FilterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'filters');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<FilterSettings>;
        setSettings({
          filterGroups: data.filterGroups || defaultSettings.filterGroups,
          sortOptions: data.sortOptions || defaultSettings.sortOptions,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching filter settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: FilterSettings) => {
    try {
      const docRef = doc(db, 'settings', 'filters');
      await setDoc(docRef, newSettings);
    } catch (error) {
      console.error("Error updating filter settings:", error);
      throw error;
    }
  };

  return (
    <FilterSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </FilterSettingsContext.Provider>
  );
};

export const useFilterSettings = () => {
  const context = useContext(FilterSettingsContext);
  if (context === undefined) {
    throw new Error('useFilterSettings must be used within a FilterSettingsProvider');
  }
  return context;
};
