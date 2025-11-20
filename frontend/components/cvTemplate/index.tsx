// components/templates/index.ts

import React from 'react';
import ModernCV1 from './modern1';
import MinimalistCV1 from './minimalist1';
import Modern2 from './modern2';
import Minimalist2 from './minimalist2';

// THÊM 'scale?: number;' VÀO ĐỊNH NGHĨA TYPE BÊN DƯỚI
export const templateComponentMap: Record<string, React.ComponentType<{ 
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string; 
  cvUiTexts?: any;
  onLayoutChange?: (newPositions: any) => void;
  scale?: number; // <--- THÊM DÒNG NÀY ĐỂ HẾT LỖI
}>> = {
  'The Signature': ModernCV1,
  'The Vanguard': MinimalistCV1,
  'The Modern': Modern2, 
  'The Minimalist': Minimalist2,
};