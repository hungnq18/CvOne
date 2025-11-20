import { SectionPositions } from "@/providers/cv-provider";

/**
 * Default section positions for all CV templates
 * Key: Template title (as in templateComponentMap)
 * Value: SectionPositions object
 */

export const defaultSectionPositionsMap: Record<string, SectionPositions> = {
  // modern1
  "The Signature": {
    avatar: { place: 1, order: 0 },
    info: { place: 2, order: 0 },
    summary: { place: 1, order: 2 },
    experience: { place: 2, order: 1 },
    education: { place: 2, order: 2 },
    skills: { place: 1, order: 3 },
    contact: { place: 1, order: 1 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
  },

  // minimalist1
  "The Vanguard": {
    avatar: { place: 1, order: 0 },
    info: { place: 1, order: 1 },
    summary: { place: 2, order: 1 },
    experience: { place: 3, order: 0 },
    education: { place: 3, order: 1 },
    skills: { place: 2, order: 2 },
    contact: { place: 2, order: 0 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
  },

  // modern2
  "The Modern": {
    avatar: { place: 1, order: 0 },
    info: { place: 1, order: 1 },
    summary: { place: 3, order: 0 },
    experience: { place: 3, order: 2 },
    education: { place: 3, order: 1 },
    skills: { place: 3, order: 4 },
    contact: { place: 2, order: 0 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
  },

  // minimalist2
  "The Minimalist": {
    avatar: { place: 1, order: 0 },
    info: { place: 2, order: 0 },
    summary: { place: 1, order: 2 },
    experience: { place: 2, order: 1 },
    education: { place: 2, order: 2 },
    skills: { place: 1, order: 3 },
    contact: { place: 1, order: 1 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
  },
};

/**
 * Get default section positions for a template by title
 */
export const getDefaultSectionPositions = (
  templateTitle: string
): SectionPositions => {
  return (
    defaultSectionPositionsMap[templateTitle] ||
    defaultSectionPositionsMap["The Signature"]
  );
};