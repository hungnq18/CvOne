// components/cvTemplate/CVEditorPopups.tsx
"use client";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useLanguage } from "@/providers/global_provider";
import { Edit, Loader2, PlusCircle, Trash2, X } from "lucide-react";
import { ChangeEvent, FC, ReactNode, useRef, useState } from "react";

// --- ĐỐI TƯỢNG TRANSLATIONS CHO TOÀN BỘ FILE ---
const translations = {
  en: {
    modal: {
      cancel: "Cancel",
      saveChanges: "Save Changes",
    },
    infoPopup: {
      title: "Edit Personal Information",
      uploadErrorPreset: "Image upload failed. Please check the preset configuration.",
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
      label: "Your Objective",
      placeholder: "Write your career objective...",
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
      descriptionPlaceholder: "Describe your job, separating each point with a period.",
      aiSuggestion: "AI Suggestion:",
      useThisResult: "Use this result",
      cancelButton: "Cancel",
      addButton: "Add",
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
      addEducationButton: "Add Education",
    },
    skillsPopup: {
      title: "Edit Skills",
      placeholder: "Add a new skill",
      addButton: "Add",
      rating: "Rating",
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
      uploadErrorPreset: "Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình preset.",
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
      label: "Mục Tiêu Của Bạn",
      placeholder: "Viết mục tiêu sự nghiệp của bạn...",
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
      descriptionPlaceholder: "Mô tả công việc của bạn, mỗi ý cách nhau bằng một dấu chấm.",
      aiSuggestion: "Gợi ý từ AI:",
      useThisResult: "Dùng kết quả này",
      cancelButton: "Hủy",
      addButton: "Thêm",
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
      addEducationButton: "Thêm Học Vấn",
    },
    skillsPopup: {
      title: "Sửa Kỹ Năng",
      placeholder: "Thêm kỹ năng mới",
      addButton: "Thêm",
      rating: "Đánh giá",
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

// --- COMPONENT POPUP CƠ SỞ ---
export const Modal: FC<{ title: string; onClose: () => void; children: ReactNode; onSave?: () => void; isSaving?: boolean; }> = ({ title, onClose, children, onSave, isSaving = false }) => {
  const { language } = useLanguage();
  const t = translations[language].modal;

  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" ref={modalRef} style={{ maxWidth: "36%" }}>
        <div className="flex justify-between items-center bg-gray-100 py-3 px-5 rounded-t-lg">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          {children}
          {onSave && (
            <div className="flex justify-end mt-6">
              <button onClick={onClose} disabled={isSaving} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md mr-2 disabled:opacity-50">
                {t.cancel}
              </button>
              <button onClick={() => {
                onSave();
                onClose();
              }} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50">
                {isSaving && <Loader2 className="animate-spin mr-2" size={18} />}
                {t.saveChanges}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CÁC POPUP CHỈNH SỬA CHI TIẾT ---
export const InfoPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
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
    formDataUpload.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    try {
      const response = await fetch(uploadUrl, { method: "POST", body: formDataUpload });
      if (!response.ok) {
        throw new Error(t.uploadErrorPreset);
      }
      const responseData = await response.json();
      setFormData((prevData: any) => ({ ...prevData, avatar: responseData.secure_url }));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : t.uploadErrorGeneral);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.avatarLabel}</label>
        <div className="flex items-center gap-4 mt-1">
          {formData.avatar && (<img src={formData.avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"/>)}
          <div className="relative">
            <input type="file" id="avatar-upload-popup" accept="image/png, image/jpeg, image/jpg" onChange={handleAvatarUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading}/>
            <button type="button" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors" disabled={isUploading} onClick={() => document.getElementById("avatar-upload-popup")?.click()}>
              {isUploading ? t.uploading : t.chooseImage}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">{t.firstNameLabel}</label>
          <input type="text" id="firstName" value={formData.firstName || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">{t.lastNameLabel}</label>
          <input type="text" id="lastName" value={formData.lastName || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="professional" className="block text-gray-700 text-sm font-bold mb-2">{t.professionLabel}</label>
        <input type="text" id="professional" value={formData.professional || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
    </Modal>
  );
};

export const ContactPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].contactPopup;
  
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [id]: value }));
  };

  const handleSaveChanges = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">{t.emailLabel}</label>
        <input type="email" id="email" value={formData.email || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">{t.phoneLabel}</label>
        <input type="tel" id="phone" value={formData.phone || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">{t.cityLabel}</label>
          <input type="text" id="city" value={formData.city || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">{t.countryLabel}</label>
          <input type="text" id="country" value={formData.country || ""} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
      </div>
    </Modal>
  );
};

export const TargetPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].targetPopup;

  const [summary, setSummary] = useState(initialData.summary || "");
  const handleSaveChanges = () => onSave({ summary });

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">{t.label}</label>
      <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" rows={8} placeholder={t.placeholder}></textarea>
    </Modal>
  );
};

export const ExperiencePopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].experiencePopup;

  const [experiences, setExperiences] = useState(initialData.workHistory || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiOutput, setAIOutput] = useState<string | null>(null);

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
      setExperiences(experiences.filter((_: any, index: number) => index !== indexToDelete));
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
      const res = await rewriteWorkDescription(currentItem.description, "vi");
      console.log(currentItem.description)
      console.log(res?.rewritten)
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
    onClose();
  };

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      {isEditing ? (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">{t.positionLabel}</label><input type="text" name="title" value={currentItem.title} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700">{t.companyLabel}</label><input type="text" name="company" value={currentItem.company} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">{t.startDateLabel}</label><input type="text" name="startDate" value={currentItem.startDate} onChange={handleFormChange} placeholder={t.startDatePlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
            <div><label className="block text-sm font-medium text-gray-700">{t.endDateLabel}</label><input type="text" name="endDate" value={currentItem.endDate} onChange={handleFormChange} placeholder={t.endDatePlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
            <div className="flex gap-2 items-start">
              <textarea name="description" value={currentItem.description} onChange={handleFormChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" placeholder={t.descriptionPlaceholder}></textarea>
            </div>
            {aiOutput && (
              <div className="mt-3 p-3 bg-gray-100 border border-blue-300 rounded">
                <div className="font-semibold mb-1 text-blue-700">{t.aiSuggestion}</div>
                <div className="whitespace-pre-line text-gray-800 text-sm">{aiOutput}</div>
                <button type="button" className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setCurrentItem({ ...currentItem, description: String(aiOutput) })}>
                  {t.useThisResult}
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">{t.cancelButton}</button>
            <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{t.addButton}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp: any, index: number) => (
            <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
              <div><p className="font-bold text-gray-800">{exp.title}</p><p className="text-sm text-gray-600">{exp.company}</p></div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
                <button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
            <PlusCircle size={18} />{t.addExperienceButton}
          </button>
        </div>
      )}
    </Modal>
  );
};

export const EducationPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].educationPopup;

  const [educations, setEducations] = useState(initialData.education || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    setCurrentItem({ institution: "", major: "", degree: "", startDate: "", endDate: "" });
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
      setEducations(educations.filter((_: any, index: number) => index !== indexToDelete));
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
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      {isEditing ? (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">{t.institutionLabel}</label><input type="text" name="institution" value={currentItem.institution} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700">{t.majorLabel}</label><input type="text" name="major" value={currentItem.major} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700">{t.degreeLabel}</label><input type="text" name="degree" value={currentItem.degree} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">{t.startDateLabel}</label><input type="text" name="startDate" value={currentItem.startDate} onChange={handleFormChange} placeholder={t.startDatePlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
            <div><label className="block text-sm font-medium text-gray-700">{t.endDateLabel}</label><input type="text" name="endDate" value={currentItem.endDate} onChange={handleFormChange} placeholder={t.endDatePlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">{t.cancelButton}</button>
            <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{t.addButton}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu: any, index: number) => (
            <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
              <div><p className="font-bold text-gray-800">{edu.institution}</p><p className="text-sm text-gray-600">{edu.major}</p></div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
                <button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
            <PlusCircle size={18} />{t.addEducationButton}
          </button>
        </div>
      )}
    </Modal>
  );
};

export const SkillsPopup: FC<{ onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }> = ({ onClose, initialData, onSave }) => {
  const { language } = useLanguage();
  const t = translations[language].skillsPopup;

  const [skills, setSkills] = useState((initialData.skills || []).map((s: any) => ({ name: s.name, rating: s.rating ?? 0 })));
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.find((s: any) => s.name === newSkill.trim())) {
      setSkills([...skills, { name: newSkill.trim(), rating: 0 }]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_: any, index: number) => index !== indexToRemove));
  };

  const handleSaveChanges = () => onSave({ skills });

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto pr-1">
        {skills.map((skill: any, index: number) => (
          <div key={index} className="flex items-center w-full bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-lg hover:shadow-sm">
            <span className="text-blue-900 font-medium truncate pr-3 max-w-[55%]">{skill.name}</span>
            <div className="ml-auto flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSkills((prev:any[]) => prev.map((s, i) => i === index ? { ...s, rating: n } : s))}
                  className={`${(skill.rating||0) >= n ? 'bg-blue-600' : 'bg-blue-200'} w-6 h-2 rounded transition-colors`}
                  aria-label={`${t.rating}: ${n}`}
                />
              ))}
            </div>
            <button onClick={() => removeSkill(index)} className="pl-3 text-blue-900 hover:text-red-500"><X size={16} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} className="flex-grow shadow-sm border rounded w-full py-2 px-3" placeholder={t.placeholder}/>
        <button onClick={addSkill} className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600">{t.addButton}</button>
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

  const addCertification = () => {
    setCertifications((prev: CertificationItem[]) => [...prev, { title: "", startDate: "", endDate: "" }]);
  };

  const removeCertification = (index: number) => {
    setCertifications((prev: CertificationItem[]) => prev.filter((_, idx) => idx !== index));
  };

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

  const [projects, setProjects] = useState<ProjectItem[]>(
    (initialData.Project || []).map((item: any) => ({
      title: item?.title || item?.["title "] || "",
      summary: item?.summary || "",
      startDate: item?.startDate || "",
      endDate: item?.endDate || "",
    }))
  );

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
      .map((item) => ({
        title: item.title?.trim() || "",
        summary: item.summary || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
      }))
      .filter((item) => item.title);
    onSave({ ...initialData, Project: sanitized });
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

export const UnsavedChangesPopup: FC<{ onSaveAndLeave: () => void; onLeaveWithoutSaving: () => void; onCancel: () => void; isSaving: boolean; }> = ({ onSaveAndLeave, onLeaveWithoutSaving, onCancel, isSaving }) => {
  const { language } = useLanguage();
  const t = translations[language].unsavedChangesPopup;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 ">
      <Modal title={t.title} onClose={onCancel}>
        <div className="text-center ">
          <p className="text-gray-600 mb-6">{t.message}</p>
          <div className="flex justify-center gap-4">
            <button onClick={onLeaveWithoutSaving} disabled={isSaving} className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-6 rounded-md disabled:opacity-50">
              {t.exitWithoutSaving}
            </button>
            <button onClick={onSaveAndLeave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md flex items-center justify-center disabled:opacity-50">
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

export const CVEditorPopupsManager: FC<CVEditorPopupsProps> = ({ activePopup, onClose, userData, handleDataUpdate, isSaving, onLeaveWithoutSaving, onSaveAndLeave }) => {
  if (!activePopup || !userData) return null;
  switch (activePopup) {
    case "info": return <InfoPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "contact": return <ContactPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "summary": return <TargetPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "experience": return <ExperiencePopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "education": return <EducationPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "skills": return <SkillsPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "certification": return <CertificationPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "achievement": return <AchievementPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "hobby": return <HobbyPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "Project": return <ProjectPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "confirmLeave": return <UnsavedChangesPopup isSaving={isSaving} onCancel={onClose} onLeaveWithoutSaving={onLeaveWithoutSaving} onSaveAndLeave={onSaveAndLeave} />;
    default: return null;
  }
};