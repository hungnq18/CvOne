import Cascade from './cascade';
import Crisp from './crisp';
import Concept from './concept';
// Import other templates as they are created
// import Modern from './modern';
// import Professional from './professional';
// import Creative from './creative';

const templates = {
  cascade: Cascade,
  crisp: Crisp,
  concept: Concept,
  // Add other templates as they are created
  // modern: Modern,
  // professional: Professional,
  // creative: Creative,
} as const;

export type TemplateType = keyof typeof templates;
export { templates };