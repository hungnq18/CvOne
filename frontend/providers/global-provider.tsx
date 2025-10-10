"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'vi';

interface GlobalContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <GlobalContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}

// Export as const arrow function
export const useLanguage = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    return { 
      language: 'en' as Language, 
      setLanguage: () => {} 
    };
  }
  return { language: context.language, setLanguage: context.setLanguage };
};

export default GlobalProvider;

