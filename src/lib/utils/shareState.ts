import { groups } from '$lib/stores/groups';
import { stockSettings } from '$lib/stores/stockSettings';
import { stockTypes } from '$lib/stores/stockTypes';
import type { Group } from '$lib/stores/groups';
import type { StockSettings } from '$lib/stores/stockSettings';
import type { StockType } from '$lib/stores/stockTypes';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Global flag to track if state has been processed
export const stateProcessed = writable(false);

// Interface for the shareable state
interface ShareableState {
  groups: Group[];
  settings: StockSettings;
  stockTypes: StockType[];
}

// Serialize the current state to a URL-safe string
export function serializeState(): string {
  if (!browser) return '';
  
  const state: ShareableState = {
    groups: get(groups),
    settings: get(stockSettings),
    stockTypes: get(stockTypes).filter(t => !t.isDefault) // Only include custom stock types
  };
  
  return encodeURIComponent(btoa(JSON.stringify(state)));
}

// Deserialize state from a URL-safe string
export function deserializeState(serialized: string): ShareableState | null {
  if (!serialized) return null;
  
  try {
    const stateJson = atob(decodeURIComponent(serialized));
    return JSON.parse(stateJson) as ShareableState;
  } catch (e) {
    console.error('Failed to deserialize state:', e);
    return null;
  }
}

// Apply the deserialized state to the application
export function applyDeserializedState(state: ShareableState): void {
  if (!state) return;
  
  // Apply stock settings
  if (state.settings) {
    stockSettings.update(state.settings);
  }
  
  // Apply custom stock types
  if (state.stockTypes && state.stockTypes.length > 0) {
    // Get current default types
    const defaultTypes = get(stockTypes).filter(t => t.isDefault);
    
    // Reset stock types to remove any existing custom types
    stockTypes.reset();
    
    // Add each custom stock type
    state.stockTypes.forEach(stockType => {
      stockTypes.add(
        stockType.name,
        stockType.width,
        stockType.height
      );
    });
  }
  
  // Apply groups
  if (state.groups && state.groups.length > 0) {
    // Since we can't use 'set', we need to clear existing groups and rebuild
    
    // Create a temporary local copy of current groups (for reference if needed)
    const currentGroups = [...get(groups)];
    
    // Remove all existing groups
    [...currentGroups].forEach(group => {
      groups.remove(group.id);
    });
    
    // Add each new group
    state.groups.forEach(group => {
      // Add group first
      groups.add(group.name);
      
      // Get the newly created group (it will have a new ID)
      const newGroups = get(groups);
      const newGroup = newGroups[newGroups.length - 1];
      
      // Update group with properties from imported group
      if (newGroup) {
        groups.update(newGroup.id, {
          color: group.color,
          items: group.items
        });
      }
    });
  }
}
