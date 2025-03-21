import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define interfaces for stock settings
export interface StockSettings {
  minLength: number; // Minimum stock length
  maxLength: number; // Maximum stock length
  increment: number; // Increment for stock length options
  defaultKerf: number; // Default kerf (saw width) value
  unit: string;      // Unit of measurement
}

// Default settings
const defaultSettings: StockSettings = {
  minLength: 2700,
  maxLength: 5400,
  increment: 300,
  defaultKerf: 3,  // Default 3mm kerf
  unit: 'mm'
};

// Get stored settings or use defaults
function getInitialSettings(): StockSettings {
  if (browser) {
    const stored = localStorage.getItem('woodcalc-stock-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored stock settings:', e);
      }
    }
  }
  return defaultSettings;
}

// Create the store
const stockSettingsStore = writable<StockSettings>(getInitialSettings());

// Helper to save to localStorage
function saveSettings(settings: StockSettings) {
  if (browser) {
    localStorage.setItem('woodcalc-stock-settings', JSON.stringify(settings));
  }
}

// Create the exported store with methods
export const stockSettings = {
  subscribe: stockSettingsStore.subscribe,
  
  update: (settings: Partial<StockSettings>) => {
    stockSettingsStore.update(current => {
      const updated = { ...current, ...settings };
      saveSettings(updated);
      return updated;
    });
  },
  
  reset: () => {
    stockSettingsStore.set(defaultSettings);
    saveSettings(defaultSettings);
  },
  
  // Helper to get available stock lengths based on current settings
  getAvailableLengths: (settings: StockSettings): number[] => {
    const lengths: number[] = [];
    for (let len = settings.minLength; len <= settings.maxLength; len += settings.increment) {
      lengths.push(len);
    }
    return lengths;
  }
};
