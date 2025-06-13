// components/templates/index.ts

import ModernCV1 from './modern1';
import ProfessionalCV1 from './professional1';
import CreativeCV1 from './creative1';
import MinimalistCV1 from './minimalist1';

export const templateComponentMap: Record<string, React.ComponentType<{ data: any }>> = {
  'Modern CV Template': ModernCV1,
  'Professional CV Template': ProfessionalCV1,
  'Creative CV Template': CreativeCV1,
  'Minimalist CV Template': MinimalistCV1,
};
