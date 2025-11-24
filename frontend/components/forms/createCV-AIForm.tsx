import { analyzeJD, suggestSkills, suggestSummary } from "@/api/cvapi";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import { Check, Edit, PlusCircle, Trash2, Wand2, X } from "lucide-react";
import { ChangeEvent, FC, useEffect, useState } from "react";

// --- COMPONENT NÚT AI DÙNG CHUNG (ĐỂ ĐỒNG BỘ THIẾT KẾ) ---
// Component này tạo ra nút bấm có viền gradient như yêu cầu
const AIButton: FC<{ onClick: () => void; isLoading: boolean; text: string; disabled?: boolean }> = ({
  onClick,
  isLoading,
  text,
  disabled,
}) => {
  return (
    <div
      className={`
        p-[2px] rounded-full inline-block
        bg-gradient-to-r from-[#4CC9F0] to-[#4361EE]   /* Aqua → Blue */
        shadow-sm
        ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : "hover:shadow-md transition-all"}
      `}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          flex items-center gap-2 rounded-full
          bg-[#0A1E4C]               /* Navy Blue */
          px-5 py-2.5 text-sm font-semibold text-white
          transition-all
          ${disabled || isLoading ? "cursor-not-allowed" : "hover:bg-[#102B66]"}  /* hover xanh sáng */
        `}
      >
        <Wand2 className={`h-5 w-5 text-white ${isLoading ? "animate-pulse" : ""}`} />
        <span>{isLoading ? "Processing..." : text}</span>
      </button>
    </div>
  );
};



// --- ĐỐI TƯỢNG TRANSLATIONS CHO TOÀN BỘ FILE ---
const translations = {
  en: {
    // ... (giữ nguyên infoForm và contactForm)
    infoForm: {
      uploadErrorPreset: "Image upload failed. Please check the preset configuration.",
      uploadErrorGeneral: "An error occurred while uploading the image.",
      title: "Basic Information",
      avatarLabel: "Avatar",
      uploading: "Uploading...",
      chooseImage: "Choose Image",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      professionLabel: "Title / Job Position",
    },
    contactForm: {
      title: "Contact Information",
      emailLabel: "Email",
      phoneLabel: "Phone Number",
      addressLabel: "Address (City, Country)",
    },
    summaryForm: {
      aiSuggestions: "AI Suggestions",
      loadingSuggestions: "Getting suggestions from AI...",
      tooltipRemove: "Remove from career objective",
      tooltipAdd: "Add to career objective",
      title: "About Me and Career Objective",
      placeholder: "Introduce yourself and your career goals",
      writeWithAI: "Write with AI", // Thêm key mới
    },
    experienceForm: {
      deleteConfirm: "Are you sure you want to delete this item?",
      aiRewriteError: "Could not get suggestion from AI. Please try again.",
      validationError: "Please fill in Position and Company Name.",
      positionLabel: "Position",
      companyLabel: "Company",
      startDateLabel: "Start Date",
      startDatePlaceholder: "YYYY-MM",
      endDateLabel: "End Date",
      endDatePlaceholder: "YYYY-MM or Present",
      descriptionLabel: "Job Description",
      aiRewriteTooltip: "Enhance with AI",
      aiRewriting: "Processing...",
      aiRewriteButton: "Rewrite with AI",
      cancelButton: "Cancel",
      saveButton: "Save",
      addButton: "Add",
      addExperienceButton: "Add Experience",
    },
    educationForm: {
      // ... (giữ nguyên educationForm)
      deleteConfirm: "Are you sure you want to delete this item?",
      institutionLabel: "Institution",
      majorLabel: "Major",
      degreeLabel: "Degree",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      cancelButton: "Cancel",
      saveButton: "Save",
      addButton: "Add",
      addEducationButton: "Add Education",
    },
    skillsForm: {
      aiSuggestionsTitle: "AI Skill Suggestions",
      jdAnalysisLoading: "Analyzing job description with AI...",
      skillsLoading: "Getting skill suggestions from AI...",
      tooltipRemove: "Remove from skills",
      tooltipAdd: "Add to skills",
      yourSkillsTitle: "Your Skills",
      placeholder: "Add a new skill",
      addButton: "Add",
      writeWithAI: "Suggest Skills with AI", // Thêm key mới
      noSuggestions: "No suggestions found yet. Try using AI.", // Thêm key mới
    },
  },
  vi: {
     // ... (giữ nguyên infoForm và contactForm)
    infoForm: {
      uploadErrorPreset: "Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình preset.",
      uploadErrorGeneral: "Có lỗi xảy ra khi tải ảnh lên.",
      title: "Thông tin cơ bản",
      avatarLabel: "Ảnh Đại Diện",
      uploading: "Đang tải...",
      chooseImage: "Chọn ảnh",
      firstNameLabel: "Họ",
      lastNameLabel: "Tên",
      professionLabel: "Chức danh / Vị trí công việc",
    },
    contactForm: {
      title: "Thông tin liên hệ",
      emailLabel: "Email",
      phoneLabel: "Số điện thoại",
      addressLabel: "Địa chỉ (Thành phố, Quốc gia)",
    },
    summaryForm: {
      aiSuggestions: "Gợi ý từ AI",
      loadingSuggestions: "Đang lấy gợi ý từ AI...",
      tooltipRemove: "Xoá khỏi mục tiêu sự nghiệp",
      tooltipAdd: "Thêm vào mục tiêu sự nghiệp",
      title: "Giới thiệu bản thân và mục tiêu nghề nghiệp",
      placeholder: "Giới thiệu bản thân và mục tiêu nghề nghiệp",
      writeWithAI: "Viết bằng AI", // Thêm key mới
    },
    experienceForm: {
      deleteConfirm: "Bạn có chắc muốn xóa mục này?",
      aiRewriteError: "Không thể lấy gợi ý từ AI. Vui lòng thử lại.",
      validationError: "Vui lòng điền Chức vụ và Tên công ty.",
      positionLabel: "Chức vụ",
      companyLabel: "Công ty",
      startDateLabel: "Ngày bắt đầu",
      startDatePlaceholder: "YYYY-MM",
      endDateLabel: "Ngày kết thúc",
      endDatePlaceholder: "YYYY-MM hoặc Present",
      descriptionLabel: "Mô tả công việc",
      aiRewriteTooltip: "Enhance with AI",
      aiRewriting: "Đang xử lý...",
      aiRewriteButton: "Viết lại với AI",
      cancelButton: "Hủy",
      saveButton: "Lưu",
      addButton: "Thêm",
      addExperienceButton: "Thêm Kinh Nghiệp",
    },
    educationForm: {
      // ... (giữ nguyên educationForm)
      deleteConfirm: "Bạn có chắc muốn xóa mục này?",
      institutionLabel: "Trường/Học viện",
      majorLabel: "Chuyên ngành",
      degreeLabel: "Bằng cấp",
      startDateLabel: "Ngày bắt đầu",
      endDateLabel: "Ngày kết thúc",
      cancelButton: "Hủy",
      saveButton: "Lưu",
      addButton: "Thêm",
      addEducationButton: "Thêm Học Vấn",
    },
    skillsForm: {
      aiSuggestionsTitle: "Gợi ý kỹ năng từ AI",
      jdAnalysisLoading: "Đang phân tích mô tả công việc bằng AI...",
      skillsLoading: "Đang lấy gợi ý kỹ năng từ AI...",
      tooltipRemove: "Xoá khỏi kỹ năng",
      tooltipAdd: "Thêm vào kỹ năng",
      yourSkillsTitle: "Kỹ năng của bạn",
      placeholder: "Thêm kỹ năng mới",
      addButton: "Thêm",
      writeWithAI: "Gợi ý kỹ năng bằng AI", // Thêm key mới
      noSuggestions: "Chưa có gợi ý nào. Hãy thử dùng AI.", // Thêm key mới
    },
  },
};

export interface FormProps {
  data: any;
  onUpdate: (updatedData: any) => void;
}

// --- GIỮ NGUYÊN InfoForm ---
export const InfoForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].infoForm;
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...data, [e.target.id]: e.target.value });
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    try {
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error(t.uploadErrorPreset);
      }
      const responseData = await response.json();
      onUpdate({ ...data, avatar: responseData.secure_url });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : t.uploadErrorGeneral);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">{t.title}</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.avatarLabel}</label>
        <div className="flex items-center gap-4 mt-1">
          {data.avatar && (<img src={data.avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"/>)}
          <div className="relative">
            <input type="file" id="avatar-upload" accept="image/png, image/jpeg, image/jpg" onChange={handleAvatarUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
            <button type="button" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors" disabled={isUploading} onClick={() => document.getElementById("avatar-upload")?.click()}>
              {isUploading ? t.uploading : t.chooseImage}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t.firstNameLabel}</label>
          <input type="text" id="firstName" value={data?.firstName || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t.lastNameLabel}</label>
          <input type="text" id="lastName" value={data?.lastName || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
      </div>
      <div>
        <label htmlFor="professional" className="block text-sm font-medium text-gray-700">{t.professionLabel}</label>
        <input type="text" id="professional" value={data?.professional || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
    </div>
  );
};

// --- GIỮ NGUYÊN ContactForm ---
export const ContactForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].contactForm;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...data, [e.target.id]: e.target.value });
  };
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">{t.title}</h3>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
        <input type="email" id="email" placeholder={data?.email || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phoneLabel}</label>
        <input type="tel" id="phone" placeholder={data?.phone || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t.addressLabel}</label>
        <input type="text" id="city" placeholder={data?.city || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
    </div>
  );
};

// --- SỬA SummaryForm ---
export const SummaryForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].summaryForm;
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // Thêm state để kiểm tra xem đã từng gọi AI chưa
  const [hasTriggeredAI, setHasTriggeredAI] = useState(false);

  // ĐÃ XÓA useEffect tự động gọi API

  // Hàm xử lý khi bấm nút AI
  const handleTriggerAI = async () => {
    setLoading(true);
    setHasTriggeredAI(true); // Đánh dấu là đã gọi
    try {
      const jobAnalysis = data?.jobAnalysis || {};
      const res = await suggestSummary({}, jobAnalysis);
      if (res && Array.isArray(res.summaries)) {
        setAiSuggestions(res.summaries);
      }
    } catch (err) {
      setAiSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuggestion = (text: string) => {
    const current = data?.summary || "";
    if (current.trim() === text.trim()) {
      onUpdate({ ...data, summary: "" });
    } else {
      onUpdate({ ...data, summary: text });
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="font-semibold text-gray-700 mb-2 flex justify-between items-center">
          {t.aiSuggestions}
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Logic hiển thị: Nút bấm -> Loading -> Kết quả */}
          {!hasTriggeredAI && !loading ? (
            <div className="flex justify-start py-4">
               <AIButton onClick={handleTriggerAI} isLoading={loading} text={t.writeWithAI} />
            </div>
          ) : loading ? (
            <div className="text-blue-500 py-2">{t.loadingSuggestions}</div>
          ) : (
            aiSuggestions.map((item, idx) => {
              const isSelected = (data?.summary || "").trim() === item.trim();
              return (
                <div key={idx} className="flex items-start gap-3 p-4 border border-blue-100 rounded-2xl bg-white shadow-sm min-h-[64px]">
                  <button type="button" className={`flex items-center justify-center w-9 h-9 rounded-full text-xl font-bold mt-1 focus:outline-none transition-colors ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-900 text-white hover:bg-blue-700"}`} onClick={() => handleToggleSuggestion(item)} title={isSelected ? t.tooltipRemove : t.tooltipAdd}>
                    {isSelected ? "-" : "+"}
                  </button>
                  <div className="flex-1 text-[15px] leading-snug"><div className="text-gray-800 break-words whitespace-pre-line break-all">{item}</div></div>
                </div>
              );
            })
          )}
           {/* Hiển thị nút "Thử lại" nếu đã gọi rồi nhưng muốn gọi lại */}
           {hasTriggeredAI && !loading && aiSuggestions.length > 0 && (
             <div className="flex justify-center mt-2">
               <button onClick={handleTriggerAI} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                 <Wand2 size={14}/> Thử lại với AI
               </button>
             </div>
           )}
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">{t.title}</label>
        <textarea id="summary" placeholder={data?.summary || t.placeholder} onChange={(e) => onUpdate({ ...data, summary: e.target.value })} className="h-48 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" rows={20} aria-placeholder={data?.summary || ""} value={typeof data.summary === "string" && data.summary.length > 0 ? data.summary : ""}></textarea>
      </div>
    </div>
  );
};

// --- SỬA ExperienceForm ---
export const ExperienceForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].experienceForm;

  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const experiences = data?.workHistory || [];

  const updateParent = (newExperiences: any[]) => {
    onUpdate({ ...data, workHistory: newExperiences });
  };

  const handleAddNew = () => {
    setCurrentItem({ title: "", company: "", startDate: "", endDate: "", description: "" });
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
      updateParent(experiences.filter((_: any, index: number) => index !== indexToDelete));
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleAIRewrite = async () => {
    if (!currentItem?.description) return;
    setLoadingAI(true);
    try {
      const { rewriteWorkDescription } = await import("@/api/cvapi");
      // Giả sử ngôn ngữ hiện tại là target language cho việc rewrite
      const res = await rewriteWorkDescription(currentItem.description, language);
      const rewritten = res?.rewritten || res;
      setCurrentItem({ ...currentItem, description: rewritten });
    } catch (err) {
      alert(t.aiRewriteError);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFormSubmit = () => {
    if (!currentItem.title || !currentItem.company) {
      alert(t.validationError);
      return;
    }
    let newExperiences = [...experiences];
    if (editingIndex !== null) {
      newExperiences[editingIndex] = currentItem;
    } else {
      newExperiences.push(currentItem);
    }
    updateParent(newExperiences);
    setIsEditing(false);
    setCurrentItem(null);
  };

  return isEditing ? (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700">{t.positionLabel}</label><input type="text" name="title" value={currentItem.title} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      <div><label className="block text-sm font-medium text-gray-700">{t.companyLabel}</label><input type="text" name="company" value={currentItem.company} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">{t.startDateLabel}</label><input type="text" name="startDate" value={currentItem.startDate || ""} onChange={handleFormChange} placeholder={t.startDatePlaceholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
        <div><label className="block text-sm font-medium text-gray-700">{t.endDateLabel}</label><input type="text" name="endDate" value={currentItem.endDate || ""} onChange={handleFormChange} placeholder={t.endDatePlaceholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
          {/* Sử dụng Component AIButton mới để đồng bộ thiết kế */}
          <div title={t.aiRewriteTooltip}>
             <AIButton 
                onClick={handleAIRewrite} 
                isLoading={loadingAI} 
                text={t.aiRewriteButton} 
                disabled={!currentItem?.description}
             />
          </div>
        </div>
        <div className="relative">
          <textarea name="description" value={currentItem.description} onChange={handleFormChange} rows={6} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">{t.cancelButton}</button>
        <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{editingIndex !== null ? t.saveButton : t.addButton}</button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {experiences.map((exp: any, index: number) => (
        <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
          <div><p className="font-bold text-gray-800">{exp.title}</p><p className="text-sm text-gray-600">{exp.company}</p></div>
          <div className="flex gap-2"><button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button><button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button></div>
        </div>
      ))}
      <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
        <PlusCircle size={18} /> {t.addExperienceButton}
      </button>
    </div>
  );
};

// --- GIỮ NGUYÊN EducationForm ---
export const EducationForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].educationForm;

  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const educations = data?.education || [];

  const updateParent = (newEducations: any[]) => {
    onUpdate({ ...data, education: newEducations });
  };

  const handleAddNew = () => {
    setCurrentItem({ institution: "", major: "", degree: "", startDate: "", endDate: "" });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    setCurrentItem({ ...educations[index] });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm(t.deleteConfirm)) {
      updateParent(educations.filter((_: any, index: number) => index !== indexToDelete));
    }
  };
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    let newEducations = [...educations];
    if (editingIndex !== null) {
      newEducations[editingIndex] = currentItem;
    } else {
      newEducations.push(currentItem);
    }
    updateParent(newEducations);
    setIsEditing(false);
    setCurrentItem(null);
  };

  return isEditing ? (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700">{t.institutionLabel}</label><input type="text" name="institution" value={currentItem.institution} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      <div><label className="block text-sm font-medium text-gray-700">{t.majorLabel}</label><input type="text" name="major" value={currentItem.major} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      <div><label className="block text-sm font-medium text-gray-700">{t.degreeLabel}</label><input type="text" name="degree" value={currentItem.degree} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">{t.startDateLabel}</label><input type="text" name="startDate" value={currentItem.startDate} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
        <div><label className="block text-sm font-medium text-gray-700">{t.endDateLabel}</label><input type="text" name="endDate" value={currentItem.endDate} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/></div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">{t.cancelButton}</button>
        <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{editingIndex !== null ? t.saveButton : t.addButton}</button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {educations.map((edu: any, index: number) => (
        <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
          <div><p className="font-bold text-gray-800">{edu.institution}</p><p className="text-sm text-gray-600">{edu.major}</p></div>
          <div className="flex gap-2"><button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button><button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button></div>
        </div>
      ))}
      <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
        <PlusCircle size={18} /> {t.addEducationButton}
      </button>
    </div>
  );
};

// --- SỬA SkillsForm ---
export const SkillsForm: FC<FormProps> = ({ data, onUpdate }) => {
  const { language } = useLanguage();
  const t = translations[language].skillsForm;

  const { jobDescription, jobAnalysis, setJobAnalysis } = useCV();
  const [skills, setSkills] = useState(data?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [aiSkillSuggestions, setAiSkillSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingJD, setAnalyzingJD] = useState(false);
  // Thêm state để kiểm tra xem đã từng gọi AI chưa
  const [hasTriggeredAI, setHasTriggeredAI] = useState(false);

  // ĐÃ XÓA useEffect tự động gọi API

  // Hàm xử lý khi bấm nút AI
  const handleTriggerAI = async () => {
    setHasTriggeredAI(true);
    setAiSkillSuggestions([]); // Reset gợi ý cũ

    // 1. Phân tích JD nếu chưa có và jobDescription tồn tại
    if (!jobAnalysis && jobDescription) {
      setAnalyzingJD(true);
      try {
        const result = await analyzeJD(jobDescription);
        setJobAnalysis(result);
        // Sau khi có jobAnalysis thì gọi tiếp suggestSkills
        await fetchSuggestions(result);
      } catch (err) {
        console.error("Error analyzing JD:", err);
        setAnalyzingJD(false);
      }
    } 
    // 2. Nếu đã có jobAnalysis hoặc không có JD để phân tích, gọi thẳng suggestSkills
    else {
      await fetchSuggestions(jobAnalysis || {});
    }
  };

  const fetchSuggestions = async (analysisData: any) => {
    setAnalyzingJD(false); // Đảm bảo tắt loading JD
    setLoading(true);
    try {
      const res = await suggestSkills(analysisData);
      if (res && Array.isArray(res.skillsOptions) && res.skillsOptions.length > 0) {
        const firstList = res.skillsOptions[0];
        if (Array.isArray(firstList)) {
          setAiSkillSuggestions(firstList.map((s: any) => s.name));
        }
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setAiSkillSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skillName?: string) => {
    const name = (skillName ?? newSkill).trim();
    if (name && !skills.find((s: any) => s.name === name)) {
      const updated = [...skills, { name }];
      setSkills(updated);
      onUpdate({ ...data, skills: updated });
      if (!skillName) setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    const updated = skills.filter((_: any, index: number) => index !== indexToRemove);
    setSkills(updated);
    onUpdate({ ...data, skills: updated });
  };

  const handleToggleAISkill = (skill: string) => {
    const idx = skills.findIndex((s: any) => s.name === skill);
    if (idx === -1) {
      addSkill(skill);
    } else {
      removeSkill(idx);
    }
  };

  const isLoadingAny = loading || analyzingJD;

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="font-semibold text-gray-700 mb-2">{t.aiSuggestionsTitle}</div>
        
        <div className="flex flex-col gap-3 mb-4">
           {/* Logic hiển thị: Nút bấm -> Loading -> Kết quả */}
           {!hasTriggeredAI && !isLoadingAny ? (
             <div className="flex justify-start py-4">
                <AIButton onClick={handleTriggerAI} isLoading={isLoadingAny} text={t.writeWithAI} />
             </div>
           ) : isLoadingAny ? (
             <div className="text-blue-500 py-2">
               {analyzingJD ? t.jdAnalysisLoading : t.skillsLoading}
             </div>
           ) : (
            <>
              {aiSkillSuggestions.length === 0 ? (
                <div className="text-gray-500 italic">{t.noSuggestions}</div>
              ) : (
                aiSkillSuggestions.map((skill, idx) => {
                  const isSelected = skills.some((s: any) => s.name === skill);
                  return (
                    <button key={skill} type="button" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full text-left ${isSelected ? "bg-blue-400 text-white border-blue-400 hover:bg-blue-500" : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"}`} onClick={() => handleToggleAISkill(skill)} title={isSelected ? t.tooltipRemove : t.tooltipAdd}>
                      <span className="inline-block w-6 h-6 flex items-center justify-center rounded-full bg-blue-800 text-white font-bold mr-2">{isSelected ? "-" : "+"}</span>
                      <span className="flex-1 ">{skill}</span>
                    </button>
                  );
                })
              )}
               {/* Nút thử lại */}
               {hasTriggeredAI && !isLoadingAny && (
                <div className="flex justify-center mt-2">
                  <button onClick={handleTriggerAI} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <Wand2 size={14}/> Thử lại với AI
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="font-semibold text-gray-700 mb-2">{t.yourSkillsTitle}</div>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} className="flex-grow shadow-sm border rounded w-full py-2 px-3" placeholder={t.placeholder}/>
          <button onClick={() => addSkill()} className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600">{t.addButton}</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill: any, index: number) => (
            <div key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
              {skill.name}
              <button onClick={() => removeSkill(index)} className="hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- GIỮ NGUYÊN Step Component ---
export const Step: FC<{ step: { id: number; name: string }; currentStep: number; isLastStep: boolean; }> = ({ step, currentStep, isLastStep }) => {
  const status = currentStep === step.id ? "active" : currentStep > step.id ? "complete" : "upcoming";
  return (
    <>
      <div className="flex items-center gap-x-3">
        <div className="relative z-10 flex h-9 w-8 items-center justify-center" aria-hidden="true">
          {status === "complete" ? (<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600"><Check className="h-5 w-5 text-white" /></div>) : status === "active" ? (<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-gray-800"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /></div>) : (<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800" />)}
        </div>
        <span className={`text-sm font-medium ${status === "active" ? "text-blue-400" : "text-gray-400"}`}>{step.name}</span>
      </div>
      {!isLastStep && (<div className={`absolute left-[15px] top-9 h-full w-0.5 ${status === "complete" || status === "active" ? "bg-blue-600" : "bg-gray-600"}`} style={{ height: "calc(100% - 2.25rem)" }} aria-hidden="true" />)}
    </>
  );
};