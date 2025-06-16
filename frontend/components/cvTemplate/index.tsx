// components/templates/index.ts

import ModernCV1 from './modern1';
import ProfessionalCV1 from './professional1';
import MinimalistCV1 from './minimalist1';

export const templateComponentMap: Record<string, React.ComponentType<{ data: any }>> = {
  'The Signature': ModernCV1,
  'The Vanguard': ModernCV1,
  'The Vibrant': ModernCV1,
  'The Executive': ProfessionalCV1,
  'The Classic': ProfessionalCV1,
  'The Standard': ProfessionalCV1,
  'The Elegant': MinimalistCV1,
  'The Streamlined': MinimalistCV1,
  'The Focus': MinimalistCV1,
};
