import { default as Concept } from './templates/concept';
import { default as Cascade } from './templates/cascade';
import { default as Crisp } from './templates/crisp';

export type TemplateType = 'concept' | 'cascade' | 'crisp';

export const templates: Record<TemplateType, React.FC<any>> = {
  concept: Concept,
  cascade: Cascade,
  crisp: Crisp,
};