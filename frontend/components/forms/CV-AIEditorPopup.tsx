// components/cvTemplate/CV-AIEditorPopup.tsx

"use client";

import { analyzeJD, suggestSkills, suggestSummary } from "@/api/cvapi";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import {
    CheckCircle2,
    Edit,
    Loader2,
    PlusCircle,
    Trash2,
    Wand2,
    X,
} from "lucide-react";
import { ChangeEvent, FC, ReactNode, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";

// --- ĐỐI TƯỢNG TRANSLATIONS CHO TOÀN BỘ FILE ---
const translations = {
  en: {
    modal: {
      cancel: "Cancel",
      saveChanges: "Save Changes",
    },
    infoPopup: {
      title: "Edit Personal Information",
      uploadErrorPreset:
        "Image upload failed. Please check the preset configuration.",
      uploadErrorGeneral: "An error occurred while uploading the image.",
      avatarLabel: "Avatar",
      uploading: "Uploading...",
      chooseImage: "Choose Image",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      professionLabel: "Job Position",
    },
    contactPopup: {
      title: "Edit Contact",
      emailLabel: "Email",
      phoneLabel: "Phone",
      cityLabel: "City",
      countryLabel: "Country",
    },
    targetPopup: {
      title: "Edit Career Objective",
      label: "About me and career objective",
      placeholder: "Write your career objective...",
      aiSuggestions: "AI Suggestions",
      loadingAISuggestions: "Getting suggestions from AI...",
      tooltipRemove: "Remove from career objective",
      tooltipAdd: "Add to career objective",
    },
    experiencePopup: {
      title: "Edit Work Experience",
      deleteConfirm: "Are you sure you want to delete this item?",
      aiRewriteError: "Could not get suggestion from AI. Please try again.",
      validationError: "Please fill in Position and Company Name.",
      positionLabel: "Position",
      companyLabel: "Company",
      startDateLabel: "Start Date",
      startDatePlaceholder: "YYYY-MM-DD",
      endDateLabel: "End Date",
      endDatePlaceholder: "YYYY-MM-DD or Present",
      descriptionLabel: "Job Description",
      aiRewriteTooltip: "Enhance with AI",
      aiRewriting: "Processing...",
      aiRewriteButton: "Rewrite with AI",
      cancelButton: "Cancel",
      addButton: "Add",
      updateButton: "Update",
      addExperienceButton: "Add Experience",
    },
    educationPopup: {
      title: "Edit Education",
      deleteConfirm: "Are you sure you want to delete this item?",
      institutionLabel: "Institution",
      majorLabel: "Major",
      degreeLabel: "Degree",
      startDateLabel: "Start Date",
      startDatePlaceholder: "YYYY-MM",
      endDateLabel: "End Date",
      endDatePlaceholder: "YYYY-MM",
      cancelButton: "Cancel",
      addButton: "Add",
      updateButton: "Update",
      addEducationButton: "Add Education",
    },
    skillsPopup: {
      title: "Edit Skills",
      yourSkillsLabel: "Your Skills",
      placeholder: "Add a new skill",
      addButton: "Add",
      aiSuggestions: "AI Suggestions",
      loadingAISuggestions: "Loading AI suggestions...",
      skillsLoading: "Loading AI suggestions...",
    },
    certificationPopup: {
      title: "Edit Certifications",
      entryLabel: "Certification",
      credentialLabel: "Certification Name",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      addCertificationButton: "Add Certification",
      removeButton: "Remove",
    },
    achievementPopup: {
      title: "Edit Achievements",
      fieldLabel: "Achievement",
      placeholder: "e.g. Employee of the Quarter, Hackathon finalist…",
      addAchievementButton: "Add Achievement",
      removeButton: "Remove",
    },
    hobbyPopup: {
      title: "Edit Hobbies",
      fieldLabel: "Hobby",
      placeholder: "e.g. Chess, Marathon, Reading Sci-fi",
      addHobbyButton: "Add Hobby",
      removeButton: "Remove",
    },
    projectPopup: {
      title: "Edit Projects",
      entryLabel: "Project",
      nameLabel: "Project Name",
      summaryLabel: "Summary / Description",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      addProjectButton: "Add Project",
      removeButton: "Remove",
    },
    unsavedChangesPopup: {
      title: "You have unsaved changes",
      message: "Do you want to save these changes before leaving?",
      exitWithoutSaving: "Exit without saving",
      saveAndExit: "Save and exit",
    },
  },
  vi: {
    modal: {
      cancel: "Huỷ",
      saveChanges: "Lưu Thay Đổi",
    },
    infoPopup: {
      title: "Sửa thông tin cá nhân",
      uploadErrorPreset:
        "Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình preset.",
      uploadErrorGeneral: "Có lỗi xảy ra khi tải ảnh lên.",
      avatarLabel: "Avatar",
      uploading: "Đang tải...",
      chooseImage: "Chọn ảnh",
      firstNameLabel: "Họ",
      lastNameLabel: "Tên",
      professionLabel: "Vị trí Công Việc",
    },
    contactPopup: {
      title: "Sửa Liên hệ",
      emailLabel: "Email",
      phoneLabel: "Điện Thoại",
      cityLabel: "Thành Phố",
      countryLabel: "Quốc Gia",
    },
    targetPopup: {
      title: "Sửa Mục Tiêu Sự Nghiệp",
      label: "Giới thiệu bản thân và mục tiêu nghề nghiệp",
      placeholder: "Viết mục tiêu sự nghiệp của bạn...",
      aiSuggestions: "Gợi ý từ AI",
      loadingAISuggestions: "Đang lấy gợi ý từ AI...",
      tooltipRemove: "Xoá khỏi mục tiêu sự nghiệp",
      tooltipAdd: "Thêm vào mục tiêu sự nghiệp",
    },
    experiencePopup: {
      title: "Sửa Kinh Nghiệm Làm Việc",
      deleteConfirm: "Bạn có chắc muốn xóa mục này?",
      aiRewriteError: "Không thể lấy gợi ý từ AI. Vui lòng thử lại.",
      validationError: "Vui lòng điền Chức vụ và Tên công ty.",
      positionLabel: "Chức vụ",
      companyLabel: "Công ty",
      startDateLabel: "Ngày bắt đầu",
      startDatePlaceholder: "YYYY-MM-DD",
      endDateLabel: "Ngày kết thúc",
      endDatePlaceholder: "YYYY-MM-DD hoặc Present",
      descriptionLabel: "Mô tả công việc",
      aiRewriteTooltip: "Enhance with AI",
      aiRewriting: "Đang xử lý...",
      aiRewriteButton: "Viết lại với AI",
      cancelButton: "Hủy",
      addButton: "Thêm",
      updateButton: "Cập nhật",
      addExperienceButton: "Thêm Kinh Nghiệm",
    },
    educationPopup: {
      title: "Sửa Học Vấn",
      deleteConfirm: "Bạn có chắc muốn xóa mục này?",
      institutionLabel: "Trường/Học viện",
      majorLabel: "Chuyên ngành",
      degreeLabel: "Bằng cấp",
      startDateLabel: "Ngày bắt đầu",
      startDatePlaceholder: "YYYY-MM",
      endDateLabel: "Ngày kết thúc",
      endDatePlaceholder: "YYYY-MM",
      cancelButton: "Hủy",
      addButton: "Thêm",
      updateButton: "Cập nhật",
      addEducationButton: "Thêm Học Vấn",
    },
    skillsPopup: {
      title: "Sửa Kỹ Năng",
      yourSkillsLabel: "Kỹ năng của bạn",
      placeholder: "Thêm kỹ năng mới",
      addButton: "Thêm",
      aiSuggestions: "Gợi ý từ AI",
      loadingAISuggestions: "Đang tải gợi ý AI...",
      skillsLoading: "Đang tải gợi ý kỹ năng AI...",
    },
    certificationPopup: {
      title: "Sửa Chứng Chỉ",
      entryLabel: "Chứng chỉ",
      credentialLabel: "Tên chứng chỉ",
      startDateLabel: "Ngày bắt đầu",
      endDateLabel: "Ngày kết thúc",
      addCertificationButton: "Thêm chứng chỉ",
      removeButton: "Xóa",
    },
    achievementPopup: {
      title: "Sửa Thành Tựu",
      fieldLabel: "Thành tựu",
      placeholder: "VD: Nhân viên xuất sắc quý, Top 5 Hackathon...",
      addAchievementButton: "Thêm thành tựu",
      removeButton: "Xóa",
    },
    hobbyPopup: {
      title: "Sửa Sở Thích",
      fieldLabel: "Sở thích",
      placeholder: "VD: Đọc sách, Chạy bộ, Chơi cờ vua...",
      addHobbyButton: "Thêm sở thích",
      removeButton: "Xóa",
    },
    projectPopup: {
      title: "Sửa Dự Án",
      entryLabel: "Dự án",
      nameLabel: "Tên dự án",
      summaryLabel: "Mô tả / Tổng quan",
      startDateLabel: "Ngày bắt đầu",
      endDateLabel: "Ngày kết thúc",
      addProjectButton: "Thêm dự án",
      removeButton: "Xóa",
    },
    unsavedChangesPopup: {
      title: "Bạn có thay đổi chưa được lưu",
      message: "Bạn có muốn lưu lại những thay đổi này trước khi rời đi không?",
      exitWithoutSaving: "Thoát không lưu",
      saveAndExit: "Lưu và thoát",
    },
  },
};

type CertificationItem = {
  title: string;
  startDate: string;
  endDate: string;
};

type ProjectItem = {
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
};

// --- AI BUTTON COMPONENT (THIẾT KẾ ĐẸP VỚI SHIMMER EFFECT) ---
const AIButton: FC<{ onClick: () => void; isLoading: boolean; text: string; disabled?: boolean; size?: "sm" | "md" }> = ({
  onClick,
  isLoading,
  text,
  disabled,
  size = "md",
}) => {
  const sizeClasses = size === "sm" 
    ? "px-4 py-2 text-xs gap-2" 
    : "px-5 py-2.5 text-sm gap-2.5";
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        group relative inline-flex items-center ${sizeClasses}
        rounded-xl font-semibold text-white
        bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600
        shadow-lg shadow-indigo-500/25
        overflow-hidden transition-all duration-300
        ${disabled || isLoading 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:shadow-xl hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98]"
        }
      `}
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <span className={`relative ${isLoading ? "animate-spin" : ""}`}>
        {isLoading ? (
          <Loader2 className="w-4 h-4" />
        ) : (
          <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </span>
      <span className="relative">{text}</span>
    </button>
  );
};

// --- COMPONENT POPUP CƠ SỞ (REDESIGNED) ---
export const Modal: FC<{
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
}> = ({ title, onClose, children, onSave, isSaving = false }) => {
  const { language } = useLanguage();
  const t = translations[language].modal;

  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        ref={modalRef}
        style={{ maxWidth: "60%", maxHeight: "90vh" }}
      >
        {/* Header với gradient */}
        <div className="relative overflow-hidden rounded-t-2xl flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex justify-between items-center py-4 px-6">
            <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        
        {/* Footer Buttons - Fixed at bottom */}
        {onSave && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => {
                onSave();
                onClose();
              }}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {t.saveChanges}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CÁC POPUP CHỈNH SỬA CHI TIẾT ---
export const InfoPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].infoPopup;

  const [formData, setFormData] = useState(initialData);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [id]: value }));
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formDataUpload,
      });
      if (!response.ok) {
        throw new Error(t.uploadErrorPreset);
      }
      const responseData = await response.json();
      setFormData((prevData: any) => ({
        ...prevData,
        avatar: responseData.secure_url,
      }));
    } catch (error) {
      console.error(error);
      notify.error(error instanceof Error ? error.message : t.uploadErrorGeneral);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = () => {
    onSave(formData);
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t.avatarLabel}
        </label>
        <div className="flex items-center gap-4 mt-1">
          {formData.avatar && (
            <img
              src={formData.avatar}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          )}
          <div className="relative">
            <input
              type="file"
              id="avatar-upload-popup"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleAvatarUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <button
              type="button"
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              disabled={isUploading}
              onClick={() =>
                document.getElementById("avatar-upload-popup")?.click()
              }
            >
              {isUploading ? t.uploading : t.chooseImage}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t.firstNameLabel}
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t.lastNameLabel}
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mb-4">
        <label
          htmlFor="professional"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {t.professionLabel}
        </label>
        <input
          type="text"
          id="professional"
          value={formData.professional || ""}
          onChange={handleChange}
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </Modal>
  );
};

export const ContactPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].contactPopup;

  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [id]: value }));
  };

  const handleSaveChanges = () => {
    onSave(formData);
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {t.emailLabel}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="phone"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {t.phoneLabel}
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="city"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t.cityLabel}
          </label>
          <input
            type="text"
            id="city"
            value={formData.city || ""}
            onChange={handleChange}
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="country"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t.countryLabel}
          </label>
          <input
            type="text"
            id="country"
            value={formData.country || ""}
            onChange={handleChange}
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </Modal>
  );
};

export const TargetPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].targetPopup;

  const { jobAnalysis } = useCV();
  const [summary, setSummary] = useState(initialData.summary || "");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedAI, setHasLoadedAI] = useState(false);

  // CHỈ GỌI API KHI BẤM NÚT AI
  const handleFetchAISuggestions = async () => {
    setLoading(true);
    try {
      const res = await suggestSummary({}, jobAnalysis || {});
      if (res && Array.isArray(res.summaries)) {
        setAiSuggestions(res.summaries);
      }
      setHasLoadedAI(true);
    } catch (err) {
      setAiSuggestions([]);
      notify.error(language === "vi" ? "Không thể lấy gợi ý AI" : "Failed to get AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuggestion = (text: string) => {
    if (summary.trim() === text.trim()) {
      setSummary("");
    } else {
      setSummary(text);
    }
  };

  const handleSaveChanges = () => {
    onSave({ summary });
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="min-h-[350px] w-full relative">
        {/* LEFT: Text Area */}
        <div className="w-full flex flex-col h-full">
          <label htmlFor="summary" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            {t.label}
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="flex-1 mt-1 block w-[49%] px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            rows={12}
            placeholder={t.placeholder}
          ></textarea>
        </div>

        {/* RIGHT: AI Suggestions Panel */}
        <div className="absolute top-0 right-0 h-full w-full md:w-[49%] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 border-l border-slate-200 rounded-r-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <Wand2 size={16} className="text-indigo-500" />
              {t.aiSuggestions}
            </div>
            {!hasLoadedAI && (
              <AIButton 
                onClick={handleFetchAISuggestions} 
                isLoading={loading} 
                text={language === "vi" ? "Gợi ý AI" : "Get AI"}
                size="sm"
              />
            )}
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
            {!hasLoadedAI && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                  <Wand2 size={28} className="text-indigo-500" />
                </div>
                <p className="text-slate-500 text-sm">
                  {language === "vi" 
                    ? "Bấm nút 'Gợi ý AI' để nhận gợi ý mục tiêu sự nghiệp phù hợp" 
                    : "Click 'Get AI' to receive career objective suggestions"}
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
                </div>
                <p className="text-slate-600 text-sm font-medium">{t.loadingAISuggestions}</p>
              </div>
            ) : (
              aiSuggestions.map((item, idx) => {
                const isSelected = summary.trim() === item.trim();
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
                        : "bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md"
                    }`}
                    onClick={() => handleToggleSuggestion(item)}
                  >
                    <button
                      type="button"
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md"
                      }`}
                      title={isSelected ? t.tooltipRemove : t.tooltipAdd}
                    >
                      {isSelected ? <CheckCircle2 size={18} /> : <PlusCircle size={18} />}
                    </button>
                    <div className={`flex-1 text-sm leading-relaxed ${isSelected ? "text-white" : "text-slate-700"}`}>
                      {item}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
export const ExperiencePopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].experiencePopup;

  const [experiences, setExperiences] = useState(initialData.workHistory || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAddNew = () => {
    setCurrentItem({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    setCurrentItem({ ...experiences[index] });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm(t.deleteConfirm)) {
      setExperiences(
        experiences.filter((_: any, index: number) => index !== indexToDelete)
      );
    }
  };

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleAIRewrite = async () => {
    if (!currentItem?.description) return;
    setLoadingAI(true);
    try {
      const { rewriteWorkDescription } = await import("@/api/cvapi");
      const res = await rewriteWorkDescription(currentItem.description, "vi");
      console.log(currentItem.description);
      console.log(res?.rewritten);
      const rewritten = res?.rewritten || res;
      setCurrentItem({ ...currentItem, description: rewritten });
    } catch (err) {
      notify.error(t.aiRewriteError);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFormSubmit = () => {
    if (!currentItem.title || !currentItem.company) {
      notify.error(t.validationError);
      return;
    }
    let updatedExperiences = [...experiences];
    if (editingIndex !== null) {
      updatedExperiences[editingIndex] = currentItem;
    } else {
      updatedExperiences.push(currentItem);
    }
    setExperiences(updatedExperiences);
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleSaveChanges = () => {
    onSave({ workHistory: experiences });
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={isEditing ? undefined : handleSaveChanges}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.positionLabel}
            </label>
            <input
              type="text"
              name="title"
              value={currentItem.title}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.companyLabel}
            </label>
            <input
              type="text"
              name="company"
              value={currentItem.company}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.startDateLabel}
              </label>
              <input
                type="text"
                name="startDate"
                value={currentItem.startDate}
                onChange={handleFormChange}
                placeholder={t.startDatePlaceholder}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.endDateLabel}
              </label>
              <input
                type="text"
                name="endDate"
                value={currentItem.endDate}
                onChange={handleFormChange}
                placeholder={t.endDatePlaceholder}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.descriptionLabel}
            </label>
            <div className="flex gap-2 items-start relative">
              <textarea
                name="description"
                value={currentItem.description}
                onChange={handleFormChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
              <div
                className={`absolute bottom-2 right-2 z-10 rounded-full p-0.5 bg-gradient-to-r from-[#e0f923] to-[#24C6DC] shadow-sm transition-opacity${
                  loadingAI || !currentItem?.description ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handleAIRewrite}
                  disabled={loadingAI || !currentItem?.description}
                  title={t.aiRewriteTooltip}
                  className={`flex w-full items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-sm text-[#0a2342] transition-all ${
                    loadingAI || !currentItem?.description
                      ? "cursor-not-allowed"
                      : "hover:bg-gradient-to-r hover:from-yellow-100 hover:to-teal-100"
                  }`}
                >
                  {loadingAI ? (
                    <>
                      <Wand2 className="mr-2 h-5 w-5 animate-pulse" />
                      <span style={{ fontWeight: 500 }}>{t.aiRewriting}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5 " />
                      <span style={{ fontWeight: 500 }}>
                        {t.aiRewriteButton}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              {t.cancelButton}
            </button>
            <button
              onClick={handleFormSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              {editingIndex !== null ? t.updateButton : t.addButton}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp: any, index: number) => (
            <div
              key={index}
              className="p-3 border rounded-md bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800">{exp.title}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddNew}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
          >
            <PlusCircle size={18} />
            {t.addExperienceButton}
          </button>
        </div>
      )}
    </Modal>
  );
};

export const EducationPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].educationPopup;

  const [educations, setEducations] = useState(initialData.education || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    setCurrentItem({
      institution: "",
      major: "",
      degree: "",
      startDate: "",
      endDate: "",
    });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    setCurrentItem(educations[index]);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm(t.deleteConfirm)) {
      setEducations(
        educations.filter((_: any, index: number) => index !== indexToDelete)
      );
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    let updatedEducations = [...educations];
    if (editingIndex !== null) {
      updatedEducations[editingIndex] = currentItem;
    } else {
      updatedEducations.push(currentItem);
    }
    setEducations(updatedEducations);
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleSaveChanges = () => {
    onSave({ education: educations });
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={isEditing ? undefined : handleSaveChanges}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.institutionLabel}
            </label>
            <input
              type="text"
              name="institution"
              value={currentItem.institution}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.majorLabel}
            </label>
            <input
              type="text"
              name="major"
              value={currentItem.major}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.degreeLabel}
            </label>
            <input
              type="text"
              name="degree"
              value={currentItem.degree}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.startDateLabel}
              </label>
              <input
                type="text"
                name="startDate"
                value={currentItem.startDate}
                onChange={handleFormChange}
                placeholder={t.startDatePlaceholder}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.endDateLabel}
              </label>
              <input
                type="text"
                name="endDate"
                value={currentItem.endDate}
                onChange={handleFormChange}
                placeholder={t.endDatePlaceholder}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              {t.cancelButton}
            </button>
            <button
              onClick={handleFormSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              {editingIndex !== null ? t.updateButton : t.addButton}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu: any, index: number) => (
            <div
              key={index}
              className="p-3 border rounded-md bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.major}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddNew}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
          >
            <PlusCircle size={18} />
            {t.addEducationButton}
          </button>
        </div>
      )}
    </Modal>
  );
};

export const SkillsPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].skillsPopup;

  const [skills, setSkills] = useState((initialData.skills || []).map((s: any) => ({ name: s.name, rating: s.rating ?? 0 })));
  const [newSkill, setNewSkill] = useState("");
  const [aiSkillSuggestions, setAiSkillSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedAI, setHasLoadedAI] = useState(false);
  const { jobDescription, jobAnalysis, setJobAnalysis } = useCV();

  // CHỈ GỌI API KHI BẤM NÚT AI
  const handleFetchAISuggestions = async () => {
    setLoading(true);
    try {
      if (!jobAnalysis && jobDescription) {
        const result = await analyzeJD(jobDescription);
        setJobAnalysis(result);
      }
      const res = await suggestSkills(jobAnalysis || {});
      if (res && Array.isArray(res.skillsOptions) && res.skillsOptions.length > 0) {
        const firstList = res.skillsOptions[0];
        if (Array.isArray(firstList)) {
          setAiSkillSuggestions(firstList.map((s: any) => s.name));
        }
      }
      setHasLoadedAI(true);
    } catch (err) {
      setAiSkillSuggestions([]);
      notify.error(language === "vi" ? "Không thể lấy gợi ý AI" : "Failed to get AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skillName?: string) => {
    const skillToAdd = (skillName || newSkill).trim();
    if (skillToAdd && !skills.find((s: any) => s.name === skillToAdd)) {
      setSkills([...skills, { name: skillToAdd, rating: 0 }]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillNameToRemove: string) => {
    setSkills(skills.filter((skill: any) => skill.name !== skillNameToRemove));
  };

  const handleToggleAISkill = (skill: string) => {
    const isSelected = skills.some((s: any) => s.name === skill);
    if (isSelected) {
      removeSkill(skill);
    } else {
      addSkill(skill);
    }
  };

  const handleSaveChanges = () => {
    onSave({ skills });
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="w-full min-h-[350px] relative">
        {/* LEFT: Your Skills */}
        <div className="w-[49%] flex flex-col h-full">
          <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            {t.yourSkillsLabel}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="flex-grow border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t.placeholder}
            />
            <button
              onClick={() => addSkill()}
              className="bg-blue-500 text-white font-semibold px-4 rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
            >
              {t.addButton}
            </button>
          </div>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 max-h-[280px]">
            {skills.map((skill: any, index: number) => (
              <div key={index} className="flex items-center w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-3 py-2.5 rounded-xl hover:shadow-md transition-all group">
                <span className="text-slate-700 font-medium truncate pr-3 max-w-[45%]">{skill.name}</span>
                <div className="ml-auto flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSkills((prev:any[]) => prev.map((s, i) => i === index ? { ...s, rating: n } : s))}
                      className={`${(skill.rating||0) >= n ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-200'} w-6 h-2 rounded-full transition-all hover:scale-110`}
                      aria-label={`rating ${n}`}
                    />
                  ))}
                </div>
                <button onClick={() => removeSkill(skill.name)} className="pl-3 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AI Suggestions Panel */}
        <div className="absolute top-0 right-0 h-full w-full md:w-[49%] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 border-l border-slate-200 rounded-r-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <Wand2 size={16} className="text-indigo-500" />
              {t.aiSuggestions}
            </div>
            {!hasLoadedAI && (
              <AIButton 
                onClick={handleFetchAISuggestions} 
                isLoading={loading} 
                text={language === "vi" ? "Gợi ý AI" : "Get AI"}
                size="sm"
              />
            )}
          </div>
          
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
            {!hasLoadedAI && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                  <Wand2 size={28} className="text-indigo-500" />
                </div>
                <p className="text-slate-500 text-sm">
                  {language === "vi" 
                    ? "Bấm nút 'Gợi ý AI' để nhận gợi ý kỹ năng phù hợp với công việc của bạn" 
                    : "Click 'Get AI' to receive skill suggestions tailored to your job"}
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
                </div>
                <p className="text-slate-600 text-sm font-medium">{t.skillsLoading}</p>
              </div>
            ) : (
              aiSkillSuggestions.map((skill) => {
                const isSelected = skills.some((s: any) => s.name === skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all w-full text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-md"
                        : "bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleToggleAISkill(skill)}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={18} className="text-white" />
                    ) : (
                      <PlusCircle size={18} className="text-indigo-500" />
                    )}
                    <span className="flex-1">{skill}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const CertificationPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].certificationPopup;

  const [certifications, setCertifications] = useState<CertificationItem[]>(
    (initialData.certification || []).map((item: any) => ({
      title: item?.title || "",
      startDate: item?.startDate || "",
      endDate: item?.endDate || "",
    }))
  );

  const handleFieldChange = (index: number, field: "title" | "startDate" | "endDate", value: string) => {
    setCertifications((prev: CertificationItem[]) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addCertification = () =>
    setCertifications((prev: CertificationItem[]) => [...prev, { title: "", startDate: "", endDate: "" }]);

  const removeCertification = (index: number) =>
    setCertifications((prev: CertificationItem[]) => prev.filter((_, idx) => idx !== index));

  const handleSaveChanges = () => {
    const sanitized = certifications
      .map((item) => ({
        title: item.title?.trim() || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
      }))
      .filter((item) => item.title);
    onSave({ ...initialData, certification: sanitized });
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {certifications.map((cert: CertificationItem, index: number) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>
                {t.entryLabel} #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="text-red-600 hover:underline"
              >
                {t.removeButton}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t.credentialLabel}
              </label>
              <input
                type="text"
                value={cert.title}
                onChange={(e) => handleFieldChange(index, "title", e.target.value)}
                className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.startDateLabel}
                </label>
                <input
                  type="date"
                  value={cert.startDate ? cert.startDate.slice(0, 10) : ""}
                  onChange={(e) => handleFieldChange(index, "startDate", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.endDateLabel}
                </label>
                <input
                  type="date"
                  value={cert.endDate ? cert.endDate.slice(0, 10) : ""}
                  onChange={(e) => handleFieldChange(index, "endDate", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addCertification}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
      >
        <PlusCircle size={18} />
        {t.addCertificationButton}
      </button>
    </Modal>
  );
};

export const AchievementPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].achievementPopup;

  const [achievements, setAchievements] = useState<string[]>([
    ...(initialData.achievement || []),
  ]);

  const handleChange = (index: number, value: string) => {
    setAchievements((prev: string[]) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addAchievement = () => setAchievements((prev) => [...prev, ""]);

  const removeAchievement = (index: number) =>
    setAchievements((prev: string[]) => prev.filter((_, idx) => idx !== index));

  const handleSaveChanges = () => {
    const sanitized = achievements.map((item) => item.trim()).filter(Boolean);
    onSave({ ...initialData, achievement: sanitized });
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
        {achievements.map((achievement: string, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <textarea
              className="flex-1 border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder={t.placeholder}
              value={achievement}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeAchievement(index)}
              className="text-red-600 text-sm hover:underline mt-2"
            >
              {t.removeButton}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addAchievement}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
      >
        <PlusCircle size={18} />
        {t.addAchievementButton}
      </button>
    </Modal>
  );
};

export const HobbyPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].hobbyPopup;

  const [hobbies, setHobbies] = useState<string[]>([...(initialData.hobby || [])]);

  const handleChange = (index: number, value: string) => {
    setHobbies((prev: string[]) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addHobby = () => setHobbies((prev) => [...prev, ""]);

  const removeHobby = (index: number) =>
    setHobbies((prev: string[]) => prev.filter((_, idx) => idx !== index));

  const handleSaveChanges = () => {
    const sanitized = hobbies.map((item) => item.trim()).filter(Boolean);
    onSave({ ...initialData, hobby: sanitized });
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {hobbies.map((hobby: string, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.placeholder}
              value={hobby}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeHobby(index)}
              className="text-red-600 text-sm hover:underline"
            >
              {t.removeButton}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addHobby}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
      >
        <PlusCircle size={18} />
        {t.addHobbyButton}
      </button>
    </Modal>
  );
};

export const ProjectPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].projectPopup;

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    // Nếu không có Project hoặc Project rỗng, tạo một project mẫu
    if (!initialData.Project || initialData.Project.length === 0) {
      return [{
        title: "",
        summary: "",
        startDate: "",
        endDate: "",
      }];
    }
    
    // Chuyển đổi từ ISO date string sang format YYYY-MM-DD cho input date
    return initialData.Project.map((item: any) => {
      let startDate = "";
      let endDate = "";
      
      if (item?.startDate) {
        try {
          const date = new Date(item.startDate);
          if (!isNaN(date.getTime())) {
            startDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          startDate = item.startDate;
        }
      }
      
      if (item?.endDate) {
        try {
          const date = new Date(item.endDate);
          if (!isNaN(date.getTime())) {
            endDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          endDate = item.endDate;
        }
      }
      
      return {
        title: item?.title || item?.["title "] || "",
        summary: item?.summary || "",
        startDate: startDate,
        endDate: endDate,
      };
    });
  });

  const handleFieldChange = (
    index: number,
    field: "title" | "summary" | "startDate" | "endDate",
    value: string
  ) => {
    setProjects((prev: ProjectItem[]) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addProject = () =>
    setProjects((prev: ProjectItem[]) => [...prev, { title: "", summary: "", startDate: "", endDate: "" }]);

  const removeProject = (index: number) =>
    setProjects((prev: ProjectItem[]) => prev.filter((_, idx) => idx !== index));

  const handleSaveChanges = () => {
    const sanitized = projects
      .map((item) => {
        // Chuyển đổi date string (YYYY-MM-DD) sang ISO format
        const startDateISO = item.startDate 
          ? new Date(item.startDate + "T00:00:00").toISOString()
          : "";
        const endDateISO = item.endDate 
          ? new Date(item.endDate + "T00:00:00").toISOString()
          : "";
        
        return {
          title: item.title?.trim() || "",
          summary: item.summary || "",
          startDate: startDateISO,
          endDate: endDateISO,
        };
      })
      .filter((item) => item.title);
    
    // Đảm bảo Project luôn là mảng
    const updatedData = {
      ...initialData,
      Project: sanitized.length > 0 ? sanitized : [],
    };
    
    onSave(updatedData);
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {projects.map((project: ProjectItem, index: number) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>
                {t.entryLabel} #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="text-red-600 hover:underline"
              >
                {t.removeButton}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => handleFieldChange(index, "title", e.target.value)}
                className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t.summaryLabel}
              </label>
              <textarea
                rows={3}
                value={project.summary}
                onChange={(e) => handleFieldChange(index, "summary", e.target.value)}
                className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.startDateLabel}
                </label>
                <input
                  type="date"
                  value={project.startDate ? project.startDate.slice(0, 10) : ""}
                  onChange={(e) => handleFieldChange(index, "startDate", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.endDateLabel}
                </label>
                <input
                  type="date"
                  value={project.endDate ? project.endDate.slice(0, 10) : ""}
                  onChange={(e) => handleFieldChange(index, "endDate", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addProject}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100"
      >
        <PlusCircle size={18} />
        {t.addProjectButton}
      </button>
    </Modal>
  );
};

export const UnsavedChangesPopup: FC<{
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ onSaveAndLeave, onLeaveWithoutSaving, onCancel, isSaving }) => {
  const { language } = useLanguage();
  const t = translations[language].unsavedChangesPopup;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 ">
      <Modal title={t.title} onClose={onCancel}>
        <div className="text-center ">
          <p className="text-gray-600 mb-6">{t.message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onLeaveWithoutSaving}
              disabled={isSaving}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-6 rounded-md disabled:opacity-50"
            >
              {t.exitWithoutSaving}
            </button>
            <button
              onClick={onSaveAndLeave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md flex items-center justify-center disabled:opacity-50"
            >
              {isSaving && <Loader2 className="animate-spin mr-2" size={18} />}
              {t.saveAndExit}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- COMPONENT QUẢN LÝ TẤT CẢ POPUP ---
interface CVEditorPopupsProps {
  activePopup: string | null;
  onClose: () => void;
  userData: any;
  handleDataUpdate: (updatedData: any) => void;
  isSaving: boolean;
  onLeaveWithoutSaving: () => void;
  onSaveAndLeave: () => void;
}

export const CVAIEditorPopupsManager: FC<CVEditorPopupsProps> = ({
  activePopup,
  onClose,
  userData,
  handleDataUpdate,
  isSaving,
  onLeaveWithoutSaving,
  onSaveAndLeave,
}) => {
  if (!activePopup || !userData) return null;
  switch (activePopup) {
    case "info":
      return (
        <InfoPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "contact":
      return (
        <ContactPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "summary":
      return (
        <TargetPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "experience":
      return (
        <ExperiencePopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "education":
      return (
        <EducationPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "skills":
      return (
        <SkillsPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "certification":
      return (
        <CertificationPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "achievement":
      return (
        <AchievementPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "hobby":
      return (
        <HobbyPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "Project":
      return (
        <ProjectPopup
          onClose={onClose}
          initialData={userData}
          onSave={handleDataUpdate}
        />
      );
    case "confirmLeave":
      return (
        <UnsavedChangesPopup
          isSaving={isSaving}
          onCancel={onClose}
          onLeaveWithoutSaving={onLeaveWithoutSaving}
          onSaveAndLeave={onSaveAndLeave}
        />
      );
    default:
      return null;
  }
};
