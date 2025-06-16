// app/providers/cv-provider.tsx
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { CVTemplate } from '@/api/cvapi';


interface CVContextType {
  currentTemplate: CVTemplate | null; 
  userData: any;
  loadTemplate: (template: CVTemplate) => void; 
  updateUserData: (updatedData: any) => void; 
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [currentTemplate, setCurrentTemplate] = useState<CVTemplate | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  const loadTemplate = useCallback((newTemplate: CVTemplate) => {
    setCurrentTemplate(newTemplate);
    if (!userData) {
      setUserData(newTemplate.data.userData);
    }
  }, [userData]);

  const updateUserData = useCallback((updatedData: any) => {
    setUserData((prevData: any) => ({
      ...prevData,
      ...updatedData,
    }));
  }, []);

  const value = {
    currentTemplate,
    userData,
    loadTemplate,
    updateUserData,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};

export const useCV = (): CVContextType => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};