"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCV } from "@/providers/cv-provider";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCVTemplateById,
  getCVTemplates,
  CVTemplate,
  createCV,
  CV,
  analyzeJD,
} from "@/api/cvapi";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { jwtDecode } from "jwt-decode";
import {
  InfoForm,
  ContactForm,
  SummaryForm,
  ExperienceForm,
  EducationForm,
  SkillsForm,
  Step,
} from "@/components/forms/createCV-AIForm";
import UpJdStep from "@/components/sections/up_JDforCV-AI";

// --- INTERFACES & TYPES ---
interface DecodedToken {
  sub: string;
  role: string;
}

interface FormProps {
  data: any;
  onUpdate: (updatedData: any) => void;
}

function CreateCVwithAI() {
  const steps = [
    {
      id: 1,
      name: "Thông tin cá nhân",
      description:
        "Điền tên, chức danh và các thông tin cơ bản để nhà tuyển dụng biết bạn là ai.",
    },
    {
      id: 2,
      name: "Liên hệ",
      description:
        "Cung cấp email, số điện thoại để nhà tuyển dụng có thể liên lạc với bạn.",
    },
    {
      id: 3,
      name: "Thêm thông tin công việc",
    },
    {
      id: 4,
      name: "Kỹ năng",
      description:
        "Các kỹ năng chuyên môn và kỹ năng mềm liên quan đến công việc.",
    },
    {
      id: 5,
      name: "Kinh nghiệm làm việc",
      description:
        "Liệt kê các vị trí và công việc bạn đã đảm nhiệm trong quá khứ.",
    },
    {
      id: 6,
      name: "Học vấn",
      description:
        "Thông tin về quá trình học tập, trường lớp và bằng cấp của bạn.",
    },
    {
      id: 7,
      name: "Mục tiêu sự nghiệp",
      description:
        "Một đoạn tóm tắt ngắn gọn về bản thân và định hướng công việc của bạn.",
    },
    {
      id: 8,
      name: "Hoàn tất",
      description:
        "Xem lại toàn bộ thông tin CV của bạn trước khi lưu hoặc xuất file.",
    },
  ];
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const [cvId, setCvId] = useState<string | null>(templateId);
  const [currentStep, setCurrentStep] = useState(1);
  const { userData, updateUserData, currentTemplate, loadTemplate, jobDescription, setJobAnalysis } = useCV();
  const router = useRouter();
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const templateDropdownRef = useRef(null);
  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));

  useEffect(() => {
    getCVTemplates().then((data) => setAllTemplates(data));

    if (templateId) {
      getCVTemplateById(templateId).then((template) => {
        if (template) {
          loadTemplate(template);
          if (template.data?.userData) {
            updateUserData(template.data.userData);
          }
        }
      });
    }
  }, [templateId, loadTemplate, updateUserData]);

  const renderCVPreview = () => {
    if (!currentTemplate || !userData) {
      return <p className="text-center">Đang tải Mẫu...</p>;
    }
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) {
      return <div>Không tìm thấy component cho "{currentTemplate.title}".</div>;
    }
    const componentData = {
      ...currentTemplate.data,
      userData: userData,
    };
    const containerWidth = 320;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    return (
      <div className="w-[357px] h-[504px] overflow-hidden pt-">
        <div className="origin-top-left w-[1050px] ">
          <div
            style={{
              position: "absolute",
              width: `${templateOriginalWidth}px`,
              height: `${templateOriginalWidth * (297 / 210)}px`,
              transformOrigin: "top left",
              transform: `scale(${scaleFactor})`,
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            }}
          >
            <TemplateComponent data={componentData} />
          </div>
        </div>
      </div>
    );
  };

  const handleTemplateSelect = (selectedTemplate: CVTemplate) => {
    router.push(`/createCV-AI?id=${selectedTemplate._id}`);
    setShowTemplatePopup(false);
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getUserIdFromToken = (): string | null => {
    if (typeof document === "undefined") return null;
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.sub;
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      return null;
    }
  };

  const handleSaveToDB = async (): Promise<boolean> => {
    const userId = getUserIdFromToken();
    if (!userData || !currentTemplate) {
      alert("Chưa có dữ liệu hoặc mẫu CV để lưu.");
      return false;
    }
    if (Object.keys(userData).length === 0) {
      alert("Dữ liệu CV trống, không thể lưu.");
      return false;
    }
    try {
      const dataToCreate: Omit<CV, "_id"> = {
        userId: userId || "",
        title: `CV for ${userData.firstName} ${userData.lastName}`,
        content: { userData },
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cvTemplateId: currentTemplate._id,
        isSaved: true,
        isFinalized: false,
      };
      const newCV = await createCV(dataToCreate);
      if (newCV && newCV.id) {
        router.replace(`/myDocuments`, { scroll: false });
      }
      alert("Lưu CV thành công!");
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu CV:", error);
      alert("Có lỗi xảy ra khi lưu CV của bạn.");
      return false;
    } finally {
      setCurrentStep(1);
    }
  };

  const handleFinishAndGoToCreateCV = () => {
    if (currentTemplate && currentTemplate._id) {
      router.push(`/createCV-AIManual?id=${currentTemplate._id}`);
    } else {
      alert("Không tìm thấy template để tạo CV.");
    }
  };

  const renderCurrentStepForm = () => {
    const safeUserData = userData || {};
    switch (currentStep) {
      case 1:
        return <InfoForm data={safeUserData} onUpdate={updateUserData} />;
      case 2:
        return <ContactForm data={safeUserData} onUpdate={updateUserData} />;
      case 3:
        return (
          <div>
            <UpJdStep />
          </div>
        );
      case 4:
        return <SkillsForm data={safeUserData} onUpdate={updateUserData} />;
      case 5:
        return <ExperienceForm data={safeUserData} onUpdate={updateUserData} />;
      case 6:
        return <EducationForm data={safeUserData} onUpdate={updateUserData} />;
      case 7:
        return <SummaryForm data={safeUserData} onUpdate={updateUserData} />;
      default:
        return (
          <>
            {" "}
            <h1>
              Tiếp Theo Bạn sẽ được đưa tới trang tạo CV để xem lại CV sau đó
              bạn có thể chọn lưu hoặc tải về
            </h1>{" "}
          </>
        );
    }
  };

  return (
    <div className="flex w-full bg-gray-100">
      <aside className="w-1/4 max-w-xs bg-gray-800 p-8 text-white pt-10">
        <h1 className="text-xl font-bold mb-8">Tạo CV của bạn</h1>
        <nav>
          <ol>
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`relative ${
                  index === steps.length - 1 ? "" : "pb-5"
                }`}
              >
                <Step
                  step={step}
                  currentStep={currentStep}
                  isLastStep={index === steps.length - 1}
                />
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <main className="flex-1 flex pt-6">
        <div className="flex flex-col w-2/3">
          <div className="flex-grow px-12 py-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {steps[currentStep - 1].name}
            </h2>
            <p className="mt-2 text-md text-gray-600">
              {steps[currentStep - 1].description}
            </p>
            <div className="mt-8 p-8 border rounded-lg bg-white">
              {renderCurrentStepForm()}
            </div>
          </div>
          <div className="flex gap-2 border-t bg-white p-6 sticky justify-end">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" /> Bước trước đó
            </button>
            {currentStep === steps.length ? (
              <button
                type="button"
                onClick={handleFinishAndGoToCreateCV}
                className="flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-400"
              >
                Hoàn tất
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-400"
              >
                Bước tiếp theo
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <aside className="flex flex-col w-1/3 bg-white p-8 border-l">
          <div className="flex">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Xem trước CV
            </h3>
          </div>
          {renderCVPreview()}
        </aside>
      </main>
    </div>
  );
}

export default CreateCVwithAI;
