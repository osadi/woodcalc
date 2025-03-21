import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { theme } from './theme';
import type { StockType } from './stockTypes';

// Define the interface for a piece
export interface Piece {
  id: string;
  length: number;
  stockType: StockType;
  quantity: number;
  kerf: number;      // Added kerf property
  margin: number;    // Added margin property
  createdAt: number;
}

// Define the interface for a group
export interface Group {
  id: string;
  name: string;
  color: string;
  items: Piece[]; // Now stores Piece objects instead of strings
  createdAt: number;
}

// Get the stored groups or use empty array
function getInitialGroups(): Group[] {
  if (browser) {
    const stored = localStorage.getItem('woodcalc-groups');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored groups:', e);
      }
    }
  }
  return [];
}

// Create groups store
const groupsStore = writable<Group[]>(getInitialGroups());

// Helper to save to localStorage
function saveGroups(groups: Group[]) {
  if (browser) {
    localStorage.setItem('woodcalc-groups', JSON.stringify(groups));
  }
}

// Enhanced theme colors with more options
const themeColors: Record<string, string[]> = {
  light: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
  dark: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
  // All other themes use the same color classes
  default: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error']
};

// Define pastel colors for group assignments
const pastelColors: string[] = [
  '#FF9AA2', // pastel red
  '#FFB7B2', // pastel salmon
  '#FFDAC1', // pastel peach
  '#E2F0CB', // pastel light green
  '#B5EAD7', // pastel mint
  '#C7CEEA', // pastel blue
  '#9ADCFF', // pastel sky blue
  '#FFC6FF', // pastel pink
  '#BDB2FF', // pastel purple
  '#A0C4FF', // pastel azure
  '#FDFFB6', // pastel yellow
];

// Get a color that isn't used recently
function getUniqueColor(existingGroups: Group[]): string {
  // If there are no groups or fewer groups than colors, we can avoid duplicates
  if (existingGroups.length < pastelColors.length) {
    // Get colors that are already in use
    const usedColors = existingGroups.map(group => group.color);
    
    // Find colors that aren't used yet
    const availableColors = pastelColors.filter(color => !usedColors.includes(color));
    
    // Pick a random color from the available ones
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  }
  
  // If we have more groups than colors, try to avoid using the most recently used colors
  // Get the last N colors used (N = half of available colors)
  const recentN = Math.floor(pastelColors.length / 2);
  const recentColors = existingGroups
    .slice(-recentN)  // Get the most recent groups
    .map(group => group.color);
  
  // Find colors that weren't recently used
  const lessRecentColors = pastelColors.filter(color => !recentColors.includes(color));
  
  // If we found some less recent colors, choose from them
  if (lessRecentColors.length > 0) {
    const randomIndex = Math.floor(Math.random() * lessRecentColors.length);
    return lessRecentColors[randomIndex];
  }
  
  // Fallback to completely random choice if all colors were recently used
  const randomIndex = Math.floor(Math.random() * pastelColors.length);
  return pastelColors[randomIndex];
}

// Derived store for the current theme colors
export const themeColors$ = derived(theme, ($theme) => 
  themeColors[$theme] || themeColors.default
);

// Group actions
export const groups = {
  subscribe: groupsStore.subscribe,
  
  add: (name: string) => {
    groupsStore.update(groups => {
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name,
        color: getUniqueColor(groups), // Use direct color value
        items: [],
        createdAt: Date.now()
      };
      
      const updatedGroups = [...groups, newGroup];
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  },
  
  update: (id: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>) => {
    groupsStore.update(groups => {
      const updatedGroups = groups.map(group => 
        group.id === id ? { ...group, ...updates } : group
      );
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  },
  
  remove: (id: string) => {
    groupsStore.update(groups => {
      const updatedGroups = groups.filter(group => group.id !== id);
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  },
  
  // Updated to accept a Piece object
  addItem: (groupId: string, item: Piece) => {
    groupsStore.update(groups => {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { 
            ...group, 
            items: [...group.items, item] 
          };
        }
        return group;
      });
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  },
  
  // Updated to work with more complex items
  removeItem: (groupId: string, itemId: string) => {
    groupsStore.update(groups => {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.filter(item => item.id !== itemId)
          };
        }
        return group;
      });
      saveGroups(updatedGroups);
      return updatedGroups;
    });
  }
};
