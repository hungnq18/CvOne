// components/templates/index.ts

import ModernCV1 from './modern1';
import MinimalistCV1 from './minimalist1';

export const templateComponentMap: Record<string, React.ComponentType<{ data: any ,onSectionClick?: (sectionId: string) => void; }>> = {
  'The Signature': ModernCV1,
  'The Vanguard': MinimalistCV1,
};
