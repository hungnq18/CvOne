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
  pdfFile: Uint8Array | null;
  setPdfFile: (file: Uint8Array | null) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  currentTemplate: CVTemplate | null;
  userData: any | null;
  loadTemplate: (template: CVTemplate) => void;
  updateUserData: (newData: any) => void;
  jobAnalysis: any;
  setJobAnalysis: (analysis: any) => void;
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
  const [pdfFile, setPdfFile] = useState<Uint8Array | null>(null);

  const [currentTemplate, setCurrentTemplate] = useState<CVTemplate | null>(
    null
  );
  const [userData, setUserData] = useState<any | null>(null);

  const loadTemplate = useCallback((template: CVTemplate) => {
    setCurrentTemplate(template);
  }, []);

  const updateUserData = useCallback((newData: any) => {
    setUserData((prevData: any) => {
      if (prevData == null) return newData;
      if (newData == null) return prevData;
      return { ...prevData, ...newData };
    });
  }, []);

  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);

  const value = {
    pdfFile,
    setPdfFile,
    jobDescription,
    setJobDescription,
    currentTemplate,
    userData,
    loadTemplate,
    updateUserData,
    jobAnalysis,
    setJobAnalysis,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};
