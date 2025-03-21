import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define the interface for a stock type
export interface StockType {
  id: string;
  name: string;
  width: number;
  height: number;
  isDefault: boolean;
}

// Default stock types
const defaultStockTypes: StockType[] = [
  { id: '1', name: '45×45', width: 45, height: 45, isDefault: true },
  { id: '2', name: '45×70', width: 45, height: 70, isDefault: true },
  { id: '3', name: '45×95', width: 45, height: 95, isDefault: true },
  { id: '4', name: '45×145', width: 45, height: 145, isDefault: true },
  { id: '5', name: '45×195', width: 45, height: 195, isDefault: true },
  { id: '6', name: '45×220', width: 45, height: 220, isDefault: true },
  { id: '7', name: '70×70', width: 70, height: 70, isDefault: true },
];

// Get stored stock types or use defaults
function getInitialStockTypes(): StockType[] {
  if (browser) {
    const stored = localStorage.getItem('woodcalc-stock-types');
    if (stored) {
      try {
        const parsedTypes = JSON.parse(stored);
        // Always ensure default types are included
        const userTypes = parsedTypes.filter(
          (type: StockType) => !type.isDefault
        );
        // Combine user types with default types
        return [...defaultStockTypes, ...userTypes];
      } catch (e) {
        console.error('Error parsing stored stock types:', e);
      }
    }
  }
  return defaultStockTypes;
}

// Create the store
const stockTypesStore = writable<StockType[]>(getInitialStockTypes());

// Helper to save to localStorage
function saveStockTypes(types: StockType[]) {
  if (browser) {
    localStorage.setItem('woodcalc-stock-types', JSON.stringify(types));
  }
}

// Create the exported store with methods
export const stockTypes = {
  subscribe: stockTypesStore.subscribe,
  
  add: (name: string, width: number, height: number) => {
    stockTypesStore.update(types => {
      // Generate a unique ID
      const id = crypto.randomUUID();
      const newType: StockType = {
        id,
        name,
        width,
        height,
        isDefault: false
      };
      
      const updatedTypes = [...types, newType];
      saveStockTypes(updatedTypes);
      return updatedTypes;
    });
  },
  
  remove: (id: string) => {
    stockTypesStore.update(types => {
      // Don't allow removing default types
      const typeToRemove = types.find(t => t.id === id);
      if (typeToRemove?.isDefault) {
        return types;
      }
      
      const updatedTypes = types.filter(type => type.id !== id);
      saveStockTypes(updatedTypes);
      return updatedTypes;
    });
  },
  
  reset: () => {
    // Keep only default types
    stockTypesStore.update(types => {
      const defaultTypesOnly = types.filter(type => type.isDefault);
      saveStockTypes(defaultTypesOnly);
      return defaultTypesOnly;
    });
  }
};
