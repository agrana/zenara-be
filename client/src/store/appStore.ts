import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBackgroundByRotationType, type Background, type BackgroundRotationType } from '@/lib/backgrounds';
import { getQuoteOfTheDay, getRandomQuote, type Quote } from '@/lib/quotes';

interface AppState {
  // Background settings
  background: Background;
  backgroundRotation: BackgroundRotationType;
  selectedCategory?: 'landscape' | 'forest' | 'ocean' | 'mountain';
  darkMode: boolean;
  
  // Quote settings
  quote: Quote;
  quoteRotation: 'daily' | 'random';
  
  // Actions
  setBackground: (background: Background) => void;
  setBackgroundRotation: (type: BackgroundRotationType, category?: 'landscape' | 'forest' | 'ocean' | 'mountain') => void;
  refreshBackground: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  
  refreshQuote: () => void;
  setQuoteRotation: (type: 'daily' | 'random') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default background is a random landscape
      background: getBackgroundByRotationType('daily'),
      backgroundRotation: 'daily',
      selectedCategory: undefined,
      darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,

      // Default quote of the day
      quote: getQuoteOfTheDay(),
      quoteRotation: 'daily',
      
      setBackground: (background) => set({ background }),
      
      setBackgroundRotation: (type, category) => set({
        backgroundRotation: type,
        selectedCategory: category,
        background: getBackgroundByRotationType(type, category)
      }),
      
      refreshBackground: () => {
        const { backgroundRotation, selectedCategory } = get();
        set({
          background: getBackgroundByRotationType(backgroundRotation, selectedCategory)
        });
      },
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      setDarkMode: (isDark) => set({ darkMode: isDark }),
      
      refreshQuote: () => {
        const { quoteRotation } = get();
        set({
          quote: quoteRotation === 'daily' ? getQuoteOfTheDay() : getRandomQuote()
        });
      },
      
      setQuoteRotation: (type) => set({
        quoteRotation: type,
        quote: type === 'daily' ? getQuoteOfTheDay() : getRandomQuote()
      }),
    }),
    {
      name: 'serene-start-app-storage',
    }
  )
);
