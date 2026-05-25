import { create } from 'zustand';
import { locales, Language } from '../locales';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Persist the language in localStorage if desired (optional, doing standard store here)
export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'pt',
  
  setLanguage: (lang: Language) => {
    // Disabled
  },
  
  t: (key: string) => {
    return locales['pt'][key] || key;
  }
}));
