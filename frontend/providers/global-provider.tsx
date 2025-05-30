"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface GlobalContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
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

export function useLanguage() {
  const { language, setLanguage } = useGlobal();
  return { language, setLanguage };
} 