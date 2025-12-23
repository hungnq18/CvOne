import { SectionPositions } from "@/providers/cv-provider";
import { CVTemplate } from "@/api/cvapi";

// 1. Dữ liệu dự phòng (Fallback) - Giữ lại để tránh lỗi khi chưa tải xong API
const fallbackSectionPositionsMap: Record<string, SectionPositions> = {
  "The Signature": {
    avatar: { place: 1, order: 0 },
    info: { place: 2, order: 0 },
    summary: { place: 2, order: 1 },      // Career objective moves to main content
    experience: { place: 2, order: 2 },
    education: { place: 1, order: 2 },     // Education moves to sidebar
    skills: { place: 1, order: 3 },
    contact: { place: 1, order: 1 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
    project: { place: 0, order: 0 }
  },
  "The Vanguard": {
    avatar: { place: 1, order: 0 },
    info: { place: 1, order: 1 },
    summary: { place: 3, order: 0 },      // Career objective moves to main content
    experience: { place: 3, order: 1 },
    education: { place: 2, order: 1 },     // Education moves to sidebar
    skills: { place: 2, order: 2 },
    contact: { place: 2, order: 0 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
    project: { place: 0, order: 0 }
  },
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
    project: { place: 0, order: 0 }
  },
  "The Minimalist": {
    avatar: { place: 1, order: 0 },
    info: { place: 2, order: 0 },
    summary: { place: 2, order: 1 },      // Career objective moves to main content
    experience: { place: 2, order: 2 },
    education: { place: 1, order: 2 },     // Education moves to sidebar
    skills: { place: 1, order: 3 },
    contact: { place: 1, order: 1 },
    certification: { place: 0, order: 0 },
    achievement: { place: 0, order: 0 },
    hobby: { place: 0, order: 0 },
    project: { place: 0, order: 0 }
  },
};

// 2. Biến lưu trữ dữ liệu từ API (Cache)
let apiPositionsCache: Record<string, SectionPositions> = {};

/**
 * Hàm này dùng để đồng bộ dữ liệu từ API Template vào Cache.
 * Gọi hàm này ngay sau khi fetch thành công getCVTemplates()
 */
export const syncDefaultsWithTemplates = (templates: CVTemplate[]) => {
  if (!templates || !Array.isArray(templates)) return;

  templates.forEach((template) => {
    // Kiểm tra xem template có dữ liệu sectionPositions từ API không (theo cấu trúc JSON bạn gửi)
    if (template.title && template.data?.sectionPositions) {
      apiPositionsCache[template.title] = template.data.sectionPositions;
    }
  });
};

/**
 * Lấy vị trí mặc định.
 * Ưu tiên: API Cache -> Fallback Hardcode
 */
export const getDefaultSectionPositions = (
  templateTitle: string
): SectionPositions => {
  return (
    apiPositionsCache[templateTitle] ||
    fallbackSectionPositionsMap[templateTitle] ||
    fallbackSectionPositionsMap["The Signature"]
  );
};