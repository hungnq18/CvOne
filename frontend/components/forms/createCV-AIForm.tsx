import React, { useState, FC, ChangeEvent } from "react";
import { Edit, PlusCircle, Trash2, X, Check } from "lucide-react";

export interface FormProps {
  data: any;
  onUpdate: (updatedData: any) => void;
}

// =================================================================
// === COMPONENT INFOFORM ĐÃ ĐƯỢC CHỈNH SỬA CHO CLOUDINARY =========
// =================================================================
export const InfoForm: FC<FormProps> = ({ data, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onUpdate({ ...data, [id]: value });
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình preset.');
      }
      const responseData = await response.json();
      onUpdate({ ...data, avatar: responseData.secure_url });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
      {/* Avatar lên đầu */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh Đại Diện</label>
        <div className="flex items-center gap-4 mt-1">
          {data.avatar && (
            <img src={data.avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"/>
          )}
          <div className="relative">
            <input
              type="file"
              id="avatar-upload"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleAvatarUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <button
              type="button"
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              disabled={isUploading}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Họ</label>
          <input type="text" id="firstName" value={data?.firstName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Tên</label>
          <input type="text" id="lastName" value={data?.lastName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
      </div>
      <div>
        <label htmlFor="professional" className="block text-sm font-medium text-gray-700">Chức danh / Vị trí công việc</label>
        <input type="text" id="professional" value={data?.professional || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
    </div>
  );
};
// =================================================================
// === CÁC FORM BÊN DƯỚI ĐƯỢC GIỮ NGUYÊN ===========================
// =================================================================


// Form cho bước 2: Liên hệ
export const ContactForm: FC<FormProps> = ({ data, onUpdate }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onUpdate({ ...data, [id]: value });
  };
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Thông tin liên hệ</h3>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" placeholder={data?.email || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
        <input type="tel" id="phone" placeholder={data?.phone || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Địa chỉ (Thành phố, Quốc gia)</label>
        <input type="text" id="city" placeholder={data?.city || ""} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
    </div>
  );
};

// Form cho bước 3: Mục tiêu sự nghiệp
export const SummaryForm: FC<FormProps> = ({ data, onUpdate }) => {
  const aiSuggestions = [
    { text: "Self-motivated, with a strong sense of personal responsibility.", expert: true },
    { text: "Excellent communication skills, both verbal and written.", expert: true },
    { text: "Proven ability to learn quickly and adapt to new situations.", expert: false },
    { text: "Skilled at working independently and collaboratively in a team environment.", expert: false },
    { text: "Worked well in a team setting, providing support and guidance.", expert: false },
  ];

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
      {/* Cột AI gợi ý bên trái */}
      <div className="w-full md:w-1/2">
        <div className="font-semibold text-gray-700 mb-2">Gợi ý từ AI</div>
        <div className="flex flex-col gap-4">
          {aiSuggestions.slice(0, 5).map((item, idx) => {
            const isSelected = (data?.summary || "").trim() === item.text.trim();
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 border border-blue-100 rounded-2xl bg-white shadow-sm min-h-[64px]"
              >
                <button
                  type="button"
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xl font-bold mt-1 focus:outline-none transition-colors
                    ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-900 text-white hover:bg-blue-700'}`}
                  onClick={() => handleToggleSuggestion(item.text)}
                  title={isSelected ? 'Xoá khỏi mục tiêu sự nghiệp' : 'Thêm vào mục tiêu sự nghiệp'}
                >
                  {isSelected ? '-' : '+'}
                </button>
                <div className="flex-1 text-[15px] leading-snug">
                  {item.expert && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-500 mr-1">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
                      </span>
                      <span className="italic font-semibold text-gray-800">Expert Recommended</span>
                    </div>
                  )}
                  <div className="text-gray-800 break-words whitespace-pre-line break-all">
                    {item.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Cột nhập của người dùng bên phải */}
      <div className="w-full md:w-1/2 flex flex-col">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân và mục tiêu nghề nghiệp</label>
        <textarea
          id="summary"
          placeholder={data?.summary || "Giới thiệu bản thân và mục tiêu nghề nghiệp"}
          onChange={(e) => onUpdate({ ...data, summary: e.target.value })}
          className="h-48 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={20}
          aria-placeholder={data?.summary || ""}
          value={typeof data.summary === 'string' && data.summary.length > 0 ? data.summary : ''}
        ></textarea>
      </div>
    </div>
  );
};

// Form cho bước 4: Kinh nghiệm làm việc
export const ExperienceForm: FC<FormProps> = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
      const newExperiences = experiences.filter((_: any, index: number) => index !== indexToDelete);
      updateParent(newExperiences);
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    if (!currentItem.title || !currentItem.company) {
      alert("Vui lòng điền Chức vụ và Tên công ty.");
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
        <input type="text" name="title" value={currentItem.title} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Công ty</label>
        <input type="text" name="company" value={currentItem.company} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input type="text" name="startDate" value={currentItem.startDate || ""} onChange={handleFormChange} placeholder="YYYY-MM" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input type="text" name="endDate" value={currentItem.endDate || ""} onChange={handleFormChange} placeholder="YYYY-MM hoặc Present" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả công việc</label>
        <textarea name="description" value={currentItem.description} onChange={handleFormChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">Hủy</button>
        <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{editingIndex !== null ? "Lưu" : "Thêm"}</button>
      </div>
      <div className="flex flex-col items-start space-y-4 mt-8">
        <button
          type="button"
          className="max-w-200 bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
        >
          AI gợi ý dựa trên JD
        </button>
        <div className="w-full min-h-[50px] border border-gray-200 rounded-lg bg-gray-50 p-4 text-gray-700">
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {experiences.map((exp: any, index: number) => (
        <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800">{exp.title}</p>
            <p className="text-sm text-gray-600">{exp.company}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
            <button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
      <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
        <PlusCircle size={18} /> Thêm Kinh Nghiệp
      </button>
    </div>
  );
};

// Form cho bước 5: Học vấn
export const EducationForm: FC<FormProps> = ({ data, onUpdate }) => {
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
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
      const newEducations = educations.filter((_: any, index: number) => index !== indexToDelete);
      updateParent(newEducations);
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Trường/Học viện</label>
        <input type="text" name="institution" value={currentItem.institution} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
        <input type="text" name="major" value={currentItem.major} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bằng cấp</label>
        <input type="text" name="degree" value={currentItem.degree} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input type="text" name="startDate" value={currentItem.startDate} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input type="text" name="endDate" value={currentItem.endDate} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm">Hủy</button>
        <button onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">{editingIndex !== null ? "Lưu" : "Thêm"}</button>
      </div>
      <div className="flex flex-col items-start space-y-4 mt-8">
        <button
          type="button"
          className="max-w-200 bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
        >
          AI gợi ý dựa trên JD
        </button>
        <div className="w-full min-h-[50px] border border-gray-200 rounded-lg bg-gray-50 p-4 text-gray-700">
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {educations.map((edu: any, index: number) => (
        <div key={index} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800">{edu.institution}</p>
            <p className="text-sm text-gray-600">{edu.major}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
            <button onClick={() => handleDelete(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
      <button onClick={handleAddNew} className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-100">
        <PlusCircle size={18} /> Thêm Học Vấn
      </button>
    </div>
  );
};

// Form cho bước 6: Kỹ năng
export const SkillsForm: FC<FormProps> = ({ data, onUpdate }) => {
  const [skills, setSkills] = useState(data?.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const aiSkillSuggestions = [
    "React", "Next.js", "TypeScript", "Tailwind CSS", "Git", "Docker", "Jira", "Communication", "Teamwork", "Problem Solving",
  ];

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

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="font-semibold text-gray-700 mb-2">Gợi ý kỹ năng từ AI</div>
        <div className="flex flex-col gap-3 mb-4">
          {aiSkillSuggestions.slice(0, 8).map((skill, idx) => {
            const isSelected = skills.some((s: any) => s.name === skill);
            return (
              <button
                key={skill}
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full text-left ${isSelected ? 'bg-blue-400 text-white border-blue-400 hover:bg-blue-500' : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'}`}
                onClick={() => handleToggleAISkill(skill)}
                title={isSelected ? 'Xoá khỏi kỹ năng' : 'Thêm vào kỹ năng'}
              >
                <span className="inline-block w-6 h-6 flex items-center justify-center rounded-full bg-blue-800 text-white font-bold mr-2">{isSelected ? '-' : '+'}</span>
                <span className="flex-1 ">{skill}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="font-semibold text-gray-700 mb-2">Kỹ năng của bạn</div>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} className="flex-grow shadow-sm border rounded w-full py-2 px-3" placeholder="Thêm kỹ năng mới"/>
          <button onClick={() => addSkill()} className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600">Thêm</button>
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

// --- COMPONENT STEPPER ---
export const Step: FC<{
  step: { id: number; name: string };
  currentStep: number;
  isLastStep: boolean;
}> = ({ step, currentStep, isLastStep }) => {
  const status = currentStep === step.id ? "active" : currentStep > step.id ? "complete" : "upcoming";
  return (
    <>
      <div className="flex items-center gap-x-3">
        <div className="relative z-10 flex h-9 w-8 items-center justify-center" aria-hidden="true">
          {status === "complete" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600"><Check className="h-5 w-5 text-white" /></div>
          ) : status === "active" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-gray-800"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /></div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800" />
          )}
        </div>
        <span className={`text-sm font-medium ${status === "active" ? "text-blue-400" : "text-gray-400"}`}>{step.name}</span>
      </div>
      {!isLastStep && (
        <div className={`absolute left-[15px] top-9 h-full w-0.5 ${status === "complete" || status === "active" ? "bg-blue-600" : "bg-gray-600"}`} style={{ height: "calc(100% - 2.25rem)" }} aria-hidden="true"/>
      )}
    </>
  );
};