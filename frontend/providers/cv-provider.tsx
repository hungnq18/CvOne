// providers/cv-provider.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback, // <-- BƯỚC 1: IMPORT useCallback
} from "react";
import { CVTemplate } from "@/api/cvapi"; // Đảm bảo bạn đã export type này từ cvapi.ts

// --- Định nghĩa kiểu dữ liệu cho Context ---
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

// --- Component Provider đã được sửa lỗi ---
export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [currentTemplate, setCurrentTemplate] = useState<CVTemplate | null>(
    null
  );
  const [userData, setUserData] = useState<any | null>(null);

  // BƯỚC 2: BỌC CÁC HÀM BẰNG useCallback
  const loadTemplate = useCallback((template: CVTemplate) => {
    setCurrentTemplate(template);
  }, []); // Mảng phụ thuộc rỗng, hàm này sẽ không bao giờ bị tạo lại

  const updateUserData = useCallback((newData: any) => {
    // Dùng callback form để tránh phụ thuộc vào userData bên ngoài
    setUserData((prevData: any) => ({ ...prevData, ...newData }));
  }, []); // Mảng phụ thuộc rỗng, hàm này sẽ không bao giờ bị tạo lại

  // Giá trị của context giờ chứa các hàm đã được ổn định
  const value = {
    currentTemplate,
    userData,
    loadTemplate,
    updateUserData,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};