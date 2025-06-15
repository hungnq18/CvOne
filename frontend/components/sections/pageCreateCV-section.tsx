"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, FC, ReactNode, ChangeEvent } from "react";
import { getCVTemplateById, CVTemplate, getCVTemplates } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import {
  FileDown,
  Printer,
  Mail,
  Send,
  ArrowLeft,
  X,
  Trash2,
  Edit,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

// --- CÁC COMPONENT POPUP ---

const Modal: FC<{
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSave: () => void;
}> = ({ title, onClose, children, onSave }) => {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        ref={modalRef}
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
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md mr-2"
            >
              Huỷ
            </button>
            <button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Popup cho Thông tin cá nhân - Đã được đồng bộ với data
const InfoPopup: FC<{
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
    <Modal
      title="Sửa thông tin cá nhân"
      onClose={onClose}
      onSave={handleSaveChanges}
    >
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
      <div className="mb-4">
        <label
          htmlFor="avatar"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Ảnh Đại Diện
        </label>
        <input
          type="text"
          id="avatar"
          value={formData.avatar || ""}
          onChange={handleChange}
          className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </Modal>
  );
};
const ContactPopup: FC<{
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
const TargetPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const [summary, setSummary] = useState(initialData.summary || "");
  const handleSaveChanges = () => onSave({ summary });

  return (
    <Modal
      title="Sửa Mục Tiêu Sự Nghiệp"
      onClose={onClose}
      onSave={handleSaveChanges}
    >
      <label
        htmlFor="summary"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Mục Tiêu Của Bạn
      </label>
      <textarea
        id="summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={8}
        placeholder="Viết mục tiêu sự nghiệp của bạn..."
      ></textarea>
    </Modal>
  );
};
const ExperiencePopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const [experiences, setExperiences] = useState(initialData.workHistory || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
            <textarea
              name="description"
              value={currentItem.description}
              onChange={handleFormChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              placeholder="Mô tả công việc của bạn, mỗi ý cách nhau bằng một dấu chấm."
            ></textarea>
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
              Lưu mục này
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

const EducationPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  // State chứa danh sách học vấn đang chỉnh sửa
  const [educations, setEducations] = useState(initialData.education || []);
  // State để quản lý việc hiển thị form (thay vì danh sách)
  const [isEditing, setIsEditing] = useState(false);
  // State chứa dữ liệu của mục đang được thêm/sửa
  const [currentItem, setCurrentItem] = useState<any>(null);
  // State để biết đang sửa mục nào (theo index)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Hàm để mở form thêm mới
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

  // Hàm để mở form sửa một mục đã có
  const handleEdit = (index: number) => {
    setCurrentItem(educations[index]);
    setEditingIndex(index);
    setIsEditing(true);
  };

  // Hàm để xóa một mục
  const handleDelete = (indexToDelete: number) => {
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
      setEducations(
        educations.filter((_: any, index: number) => index !== indexToDelete)
      );
    }
  };

  // Hàm cập nhật dữ liệu trong form
  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút "Save" trên form
  const handleFormSubmit = () => {
    let updatedEducations = [...educations];
    if (editingIndex !== null) {
      // Cập nhật mục đã có
      updatedEducations[editingIndex] = currentItem;
    } else {
      // Thêm mục mới
      updatedEducations.push(currentItem);
    }
    setEducations(updatedEducations);
    setIsEditing(false); // Quay lại màn hình danh sách
    setCurrentItem(null);
  };

  // Hàm xử lý khi bấm nút "Save Changes" của cả Modal
  const handleSaveChanges = () => {
    onSave({ education: educations });
    onClose();
  };

  return (
    <Modal title="Sửa Học Vấn" onClose={onClose} onSave={handleSaveChanges}>
      {isEditing ? (
        // --- GIAO DIỆN FORM KHI THÊM/SỬA ---
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
              Lưu mục này
            </button>
          </div>
        </div>
      ) : (
        // --- GIAO DIỆN DANH SÁCH MẶC ĐỊNH ---
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

const SkillsPopup: FC<{
  onClose: () => void;
  initialData: any;
  onSave: (updatedData: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const [skills, setSkills] = useState(initialData.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !skills.find((s: any) => s.name === newSkill.trim())
    ) {
      setSkills([...skills, { name: newSkill.trim() }]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(
      skills.filter((_: any, index: number) => index !== indexToRemove)
    );
  };

  const handleSaveChanges = () => onSave({ skills });

  return (
    <Modal title="Sửa Kỹ Năng" onClose={onClose} onSave={handleSaveChanges}>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill: any, index: number) => (
          <div
            key={index}
            className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2"
          >
            {skill.name}
            <button
              onClick={() => removeSkill(index)}
              className="hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="flex-grow shadow-sm border rounded w-full py-2 px-3"
          placeholder="Thêm kỹ năng mới"
        />
        <button
          onClick={addSkill}
          className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600"
        >
          Thêm
        </button>
      </div>
    </Modal>
  );
};
// Component Mũi tên cho Dropdown
const DropdownArrow = () => (
  <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white" />
);

// Dữ liệu cho Sidebar - ĐÃ XÓA ICON
const sidebarSections = [
  { id: "info", title: "Thông tin cá nhân" },
  { id: "contact", title: "Liên hệ" },
  { id: "summary", title: "Mục tiêu sự nghiệp" },
  { id: "experience", title: "Kinh nghiệm làm việc" },
  { id: "education", title: "Học vấn" },
  { id: "skills", title: "Kỹ năng" },
];

const PageCreateCVSection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [showColorPopup, setShowColorPopup] = useState(false);

  const templateDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));
  useOnClickOutside(colorDropdownRef, () => setShowColorPopup(false));

  useEffect(() => {
    getCVTemplates().then((data) => setAllTemplates(data));
    if (id) {
      setLoading(true);
      getCVTemplateById(id).then((data) => {
        if (data) setTemplate(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleTemplateSelect = (selectedTemplate: CVTemplate) => {
    router.push(
      `/createCV?id=${selectedTemplate.id}&title=${encodeURIComponent(
        selectedTemplate.title
      )}`
    );
    setShowTemplatePopup(false);
  };

  const handleDataUpdate = (sectionId: string, updatedData: any) => {
    if (!template) return;

    console.log("Updating data for section:", sectionId, updatedData);

    if (sectionId === "info") {
      const newTemplateData = {
        ...template,
        data: {
          ...template.data,
          userData: {
            ...template.data.userData,
            ...updatedData,
          },
        },
      };
      setTemplate(newTemplateData);
    }
    // Bạn có thể thêm logic cho các section khác ở đây
  };

  const renderCVPreview = () => {
    if (loading) return <p className="text-center">Đang tải Mẫu...</p>;
    if (!template)
      return <p className="text-center text-red-500">Không tìm thấy Mẫu.</p>;
    const TemplateComponent = templateComponentMap?.[template.title];
    if (!TemplateComponent)
      return (
        <div>Không tìm thấy component phù hợp cho "{template.title}".</div>
      );
    return (
      <div className="w-full max-w-[1050px] shadow-2xl origin-top scale-[0.6] md:scale-[0.7] lg:scale-[0.8]">
        <TemplateComponent data={template.data} />
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      <header
        className="bg-slate-900 text-white pt-20 pb-6 px-8 flex justify-between items-center z-20"
        style={{ backgroundColor: "#0b1b34" }}
      >
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">
            {template ? template.title : "Chỉnh Sửa CV"}
          </h1>
          <div className="flex items-center gap-4">
          <div className="relative" ref={colorDropdownRef}>
              <button
                onClick={() => setShowColorPopup(!showColorPopup)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-semibold"
              >
                MÀU SẮC
              </button>
              {showColorPopup && (
                <div
                  className="absolute top-full mt-3 bg-white rounded-md shadow-lg"
                  style={{ left: "-7%" }}
                >
                  <DropdownArrow />
                  <div className="flex gap-2 p-3">
                    <button className="w-6 h-6 rounded-full bg-red-500 hover:ring-2 ring-offset-2 ring-red-500"></button>
                    <button className="w-6 h-6 rounded-full bg-blue-500 hover:ring-2 ring-offset-2 ring-blue-500"></button>
                    <button className="w-6 h-6 rounded-full bg-green-500 hover:ring-2 ring-offset-2 ring-green-500"></button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={templateDropdownRef}>
              <button
                onClick={() => setShowTemplatePopup(!showTemplatePopup)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-semibold"
              >
                MẪU CV
              </button>
              {showTemplatePopup && (
                <div className="absolute top-full mt-3 bg-white rounded-md shadow-lg z-20 p-4 w-[450px]" style={{ left: "-200%" }}>
                  <DropdownArrow />
                  <div className="grid grid-cols-3 gap-4">
                    {allTemplates.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleTemplateSelect(item)}
                        className="relative rounded-md overflow-hidden border-2 transition-colors duration-200
                                   hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                   group"
                      >
                        <div className="aspect-[210/297]">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                          {item.title}
                        </p>
                        {template?.id === item.id && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-60 flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Quay Lại
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
            <Send size={18} /> Hoàn Thành
          </button>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        <aside className="w-72 bg-white p-6 border-r border-slate-200 overflow-y-auto">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">
            CÁC MỤC CỦA CV
          </h2>
          <nav className="flex flex-col gap-1">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setActivePopup(section.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-md font-medium text-left transition-colors
                  ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-grow bg-slate-100 p-8 flex justify-center items-start overflow-y-auto">
          {renderCVPreview()}
        </div>

        <aside className="w-72 bg-white p-6 border-l border-slate-200 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <FileDown size={20} /> Tải về
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Printer size={20} /> In CV
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Mail size={20} /> Email
            </button>
          </div>
        </aside>
      </main>

      {activePopup === "info" && template?.data?.userData && (
        <InfoPopup
          onClose={() => setActivePopup(null)}
          initialData={template.data.userData}
          onSave={(updatedData) => handleDataUpdate("info", updatedData)}
        />
      )}
      {activePopup === "contact" && (
        <ContactPopup
          onClose={() => setActivePopup(null)}
          initialData={template?.data?.userData}
          onSave={(updatedData) => handleDataUpdate("contact", updatedData)}
        />
      )}
      {activePopup === "summary" && (
        <TargetPopup
          onClose={() => setActivePopup(null)}
          initialData={template?.data?.userData}
          onSave={(updatedData) => handleDataUpdate("summary", updatedData)}
        />
      )}
      {activePopup === "experience" && (
        <ExperiencePopup
          onClose={() => setActivePopup(null)}
          initialData={template?.data?.userData}
          onSave={(updatedData) => handleDataUpdate("experience", updatedData)}
        />
      )}
      {activePopup === "education" && (
        <EducationPopup
          onClose={() => setActivePopup(null)}
          initialData={template?.data?.userData}
          onSave={(updatedData) => handleDataUpdate("education", updatedData)}
        />
      )}
      {activePopup === "skills" && (
        <SkillsPopup
          onClose={() => setActivePopup(null)}
          initialData={template?.data?.userData}
          onSave={(updatedData) => handleDataUpdate("skills", updatedData)}
        />
      )}
    </div>
  );
};

export default PageCreateCVSection;
