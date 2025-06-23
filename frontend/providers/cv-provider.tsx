// providers/cv-provider.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { CVTemplate } from "@/api/cvapi";

interface CVContextType {
  currentTemplate: CVTemplate | null;
  userData: any | null;
  loadTemplate: (template: CVTemplate) => void;
  updateUserData: (newData: any) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within a CVProvider");
  }
  return context;
};

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [currentTemplate, setCurrentTemplate] = useState<CVTemplate | null>(
    null
  );
  const [userData, setUserData] = useState<any | null>(null);

  const loadTemplate = useCallback((template: CVTemplate) => {
    setCurrentTemplate(template);
  }, []);

  const updateUserData = useCallback((newData: any) => {
    setUserData((prevData: any) => ({ ...prevData, ...newData }));
  }, []);

  const value = {
    currentTemplate,
    userData,
    loadTemplate,
    updateUserData,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};
