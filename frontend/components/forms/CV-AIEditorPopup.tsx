// components/cvTemplate/CVEditorPopups.tsx
"use client";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import {
  CheckCircle2,
  Edit,
  Loader2,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FC, ReactNode, useRef, useState, useEffect } from "react";
import { useCV } from "@/providers/cv-provider";
import { suggestSummary, suggestSkills } from "@/api/cvapi";


// --- COMPONENT POPUP CƠ SỞ ---
export const Modal: FC<{
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
}> = ({ title, onClose, children, onSave, isSaving = false }) => {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        ref={modalRef}
        style={{ maxWidth: "60%" }}
      >
        <div className="flex justify-between items-center bg-gray-100 py-3 px-5 rounded-t-lg">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          {children}
          {onSave && (
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md mr-2 disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={onSave }
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin mr-2" size={18} />}
                Lưu Thay Đổi
              </button>
            </div>
          )}
        </div>
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
  const [formData, setFormData] = useState(initialData);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [id]: value }));
  };

  // Xử lý upload avatar lên Cloudinary
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataUpload,
      });
      if (!response.ok) {
        throw new Error('Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình preset.');
      }
      const responseData = await response.json();
      setFormData((prevData: any) => ({ ...prevData, avatar: responseData.secure_url }));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      title="Sửa thông tin cá nhân"
      onClose={onClose}
      onSave={handleSaveChanges}
    >
      {/* Avatar lên đầu popup */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh Đại Diện</label>
        <div className="flex items-center gap-4 mt-1">
          {formData.avatar && (
            <img src={formData.avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"/>
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
              onClick={() => document.getElementById('avatar-upload-popup')?.click()}
            >
              {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
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
            Họ
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
            Tên
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
          Vị trí Công Việc
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
    <Modal title="Sửa Liên hệ" onClose={onClose} onSave={handleSaveChanges}>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Email
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
          Điện Thoại
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
            Thành Phố
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
            Quốc Gia
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
  const { jobAnalysis } = useCV();
  const [summary, setSummary] = useState(initialData.summary || "");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAISummary = async () => {
      setLoading(true);
      try {
        const res = await suggestSummary({}, jobAnalysis || {});
        if (res && Array.isArray(res.summaries)) {
          setAiSuggestions(res.summaries);
        }
      } catch (err) {
        setAiSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAISummary();
  }, [jobAnalysis]);

  const handleToggleSuggestion = (text: string) => {
    if (summary.trim() === text.trim()) {
      setSummary("");
    } else {
      setSummary(text);
    }
  };

  const handleSaveChanges = () => onSave({ summary });

  return (
    <Modal
      title="Sửa Mục Tiêu Sự Nghiệp"
      onClose={onClose}
      onSave={handleSaveChanges}
    >
      <div>
        {/* THAY ĐỔI 1: Thêm 'relative' để tạo không gian định vị cho lớp phủ AI */}
        <div className="h-[90%] w-full relative ">
          {/* THAY ĐỔI 3: Cho cột nhập liệu chiếm toàn bộ chiều rộng và chiều cao */}
          <div className="w-full flex flex-col h-full">
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Giới thiệu bản thân và mục tiêu nghề nghiệp
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="flex-1 mt-1 block w-[49%] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={12}
              placeholder="Viết mục tiêu sự nghiệp của bạn..."
            ></textarea>
          </div>

          {/* THAY ĐỔI 2: Chuyển cột AI thành 'absolute', đặt bên phải và thêm style cho lớp phủ */}
          <div className="absolute top-0 right-0 h-full w-full md:w-[49%] flex flex-col bg-gray-50 bg-opacity-90 backdrop-blur-sm border-l border-gray-200 shadow-xl p-4">
            <div className="font-semibold text-gray-800 mb-2">Gợi ý từ AI</div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
              {loading ? (
                <div>Đang lấy gợi ý từ AI...</div>
              ) : (
                aiSuggestions.map((item, idx) => {
                  const isSelected = summary.trim() === item.trim();
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 border border-blue-100 rounded-2xl bg-white shadow-sm "
                    >
                      <button
                        type="button"
                        className={`flex items-center justify-center w-9 h-9 rounded-full text-xl font-bold mt-1 focus:outline-none transition-colors
                        ${
                          isSelected
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-blue-900 text-white hover:bg-blue-700"
                        }`}
                        onClick={() => handleToggleSuggestion(item)}
                        title={
                          isSelected
                            ? "Xoá khỏi mục tiêu sự nghiệp"
                            : "Thêm vào mục tiêu sự nghiệp"
                        }
                      >
                        {isSelected ? "-" : "+"}
                      </button>
                      <div className="flex-1 text-[14px] leading-snug">
                        <div className="text-gray-800 break-words whitespace-normal">
                          {item}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
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

  // Hàm gọi AI để rewrite mô tả công việc
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
      alert("Không thể lấy gợi ý từ AI. Vui lòng thử lại.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFormSubmit = () => {
    if (!currentItem.title || !currentItem.company) {
      alert("Vui lòng điền Chức vụ và Tên công ty.");
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
    <Modal
      title="Sửa Kinh Nghiệm Làm Việc"
      onClose={onClose}
      onSave={handleSaveChanges}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chức vụ
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
              Công ty
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
                Ngày bắt đầu
              </label>
              <input
                type="text"
                name="startDate"
                value={currentItem.startDate}
                onChange={handleFormChange}
                placeholder="YYYY-MM-DD"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày kết thúc
              </label>
              <input
                type="text"
                name="endDate"
                value={currentItem.endDate}
                onChange={handleFormChange}
                placeholder="YYYY-MM-DD hoặc Present"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả công việc
            </label>
            <div className="flex gap-2 items-start">
              <textarea
                name="description"
                value={currentItem.description}
                onChange={handleFormChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                placeholder="Mô tả công việc của bạn, mỗi ý cách nhau bằng một dấu chấm."
              ></textarea>
              <button
                type="button"
                className="mt-1 ml-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-1"
                onClick={handleAIRewrite}
                disabled={loadingAI || !currentItem?.description}
                title="Gợi ý AI cho mô tả công việc"
              >
                {loadingAI ? (
                  <span className="animate-spin mr-1">⏳</span>
                ) : (
                  <span>Sửa lại với AI</span>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleFormSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Thêm
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
            Thêm Kinh Nghiệm
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
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
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
    <Modal title="Sửa Học Vấn" onClose={onClose} onSave={handleSaveChanges}>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trường/Học viện
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
              Chuyên ngành
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
              Bằng cấp
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
                Ngày bắt đầu
              </label>
              <input
                type="text"
                name="startDate"
                value={currentItem.startDate}
                onChange={handleFormChange}
                placeholder="YYYY-MM"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày kết thúc
              </label>
              <input
                type="text"
                name="endDate"
                value={currentItem.endDate}
                onChange={handleFormChange}
                placeholder="YYYY-MM"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleFormSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Thêm
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
            Thêm Học Vấn
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
    const [skills, setSkills] = useState(initialData.skills || []);
    const [newSkill, setNewSkill] = useState("");
    
    // --- THÊM MỚI: State cho các gợi ý từ AI ---
    const [aiSkillSuggestions, setAiSkillSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
  
    // --- THÊM MỚI: Lấy gợi ý từ AI khi component được tải ---
    useEffect(() => {
      // Trong thực tế, bạn sẽ gọi API ở đây. 
      // Hiện tại, chúng ta sử dụng dữ liệu giả để minh họa.
      setLoading(true);
      setTimeout(() => {
        setAiSkillSuggestions(["JavaScript", "React", "Node.js", "TypeScript", "Next.js", "GraphQL", "SQL", "Docker", "AWS"]);
        setLoading(false);
      }, 500);
    }, []);
  
    // Sửa lại hàm addSkill để có thể thêm từ gợi ý
    const addSkill = (skillName?: string) => {
      const skillToAdd = (skillName || newSkill).trim();
      if (skillToAdd && !skills.find((s: any) => s.name === skillToAdd)) {
        setSkills([...skills, { name: skillToAdd }]);
        setNewSkill("");
      }
    };
  
    const removeSkill = (skillNameToRemove: string) => {
      setSkills(skills.filter((skill: any) => skill.name !== skillNameToRemove));
    };
  
    // --- THÊM MỚI: Xử lý khi nhấn vào một gợi ý ---
    const handleToggleAISkill = (skill: string) => {
      const isSelected = skills.some((s: any) => s.name === skill);
      if (isSelected) {
        removeSkill(skill);
      } else {
        addSkill(skill);
      }
    };
  
    const handleSaveChanges = () => onSave({ skills });
  
    return (
      <Modal title="Sửa Kỹ Năng" onClose={onClose} onSave={handleSaveChanges}>
        {/* --- THAY ĐỔI: Bọc trong một div relative để chứa 2 cột --- */}
        <div className="w-full min-h-[300px] relative">
          {/* Cột 1: Kỹ năng của người dùng (bên trái) */}
          <div className="w-[49%] flex flex-col h-full">
            <div className="font-semibold text-gray-700 mb-2">
              Kỹ năng của bạn
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-grow shadow-sm border rounded w-full py-2 px-3"
                placeholder="Thêm kỹ năng mới"
              />
              <button
                onClick={() => addSkill()}
                className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2 flex-1 overflow-y-auto pr-1">
              {skills.map((skill: any, index: number) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm font-medium h-fit px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {skill.name}
                  <button
                    onClick={() => removeSkill(skill.name)}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
  
          {/* --- THÊM MỚI: Cột 2: Gợi ý từ AI (bên phải) --- */}
          <div className=" absolute top-0 right-0 h-full w-full md:w-[49%] flex flex-col bg-gray-50 bg-opacity-90 backdrop-blur-sm border-l border-gray-200 shadow-xl p-4">
            <div className="font-semibold text-gray-800 mb-2">
              Gợi ý từ AI
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 ">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                aiSkillSuggestions.map((skill) => {
                  const isSelected = skills.some((s: any) => s.name === skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full text-left ${
                        isSelected
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={() => handleToggleAISkill(skill)}
                    >
                      {isSelected ? <CheckCircle2 size={16} className="text-blue-600" /> : <PlusCircle size={16} className="text-blue-600" />}
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

export const UnsavedChangesPopup: FC<{
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ onSaveAndLeave, onLeaveWithoutSaving, onCancel, isSaving }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 ">
      <Modal title="Bạn có thay đổi chưa được lưu" onClose={onCancel}>
        <div className="text-center ">
          <p className="text-gray-600 mb-6">
            Bạn có muốn lưu lại những thay đổi này trước khi rời đi không?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onLeaveWithoutSaving}
              disabled={isSaving}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-6 rounded-md disabled:opacity-50"
            >
              Thoát không lưu
            </button>
            <button
              onClick={onSaveAndLeave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md flex items-center justify-center disabled:opacity-50"
            >
              {isSaving && <Loader2 className="animate-spin mr-2" size={18} />}
              Lưu và thoát
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
      return <InfoPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "contact":
      return <ContactPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "summary":
      return <TargetPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "experience":
      return <ExperiencePopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "education":
      return <EducationPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
    case "skills":
      return <SkillsPopup onClose={onClose} initialData={userData} onSave={handleDataUpdate} />;
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