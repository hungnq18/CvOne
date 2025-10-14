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
    },
    unsavedChangesPopup: {
      title: "Bạn có thay đổi chưa được lưu",
      message: "Bạn có muốn lưu lại những thay đổi này trước khi rời đi không?",
      exitWithoutSaving: "Thoát không lưu",
      saveAndExit: "Lưu và thoát",
    },
  },
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
              <button onClick={onSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50">
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

  const [skills, setSkills] = useState(initialData.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.find((s: any) => s.name === newSkill.trim())) {
      setSkills([...skills, { name: newSkill.trim() }]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_: any, index: number) => index !== indexToRemove));
  };

  const handleSaveChanges = () => onSave({ skills });

  return (
    <Modal title={t.title} onClose={onClose} onSave={handleSaveChanges}>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill: any, index: number) => (
          <div key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
            {skill.name}
            <button onClick={() => removeSkill(index)} className="hover:text-red-500"><X size={14} /></button>
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
    case "confirmLeave": return <UnsavedChangesPopup isSaving={isSaving} onCancel={onClose} onLeaveWithoutSaving={onLeaveWithoutSaving} onSaveAndLeave={onSaveAndLeave} />;
    default: return null;
  }
};