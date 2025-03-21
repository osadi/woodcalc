import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define available themes
export const themes = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Cupcake', value: 'cupcake' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Corporate', value: 'corporate' },
  { name: 'Synthwave', value: 'synthwave' },
  { name: 'Retro', value: 'retro' },
  { name: 'Cyberpunk', value: 'cyberpunk' }
];

// Get stored theme or use default
function getInitialTheme() {
  if (browser) {
    return localStorage.getItem('theme') || 'light';
  }
  return 'light';
}

// Create theme store
export const theme = writable(getInitialTheme());

// Update theme and save to localStorage
export function setTheme(newTheme: string) {
  if (browser) {
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }
  theme.set(newTheme);
}

// Initialize theme on load
if (browser) {
  theme.subscribe(value => {
    document.documentElement.setAttribute('data-theme', value);
  });
}
