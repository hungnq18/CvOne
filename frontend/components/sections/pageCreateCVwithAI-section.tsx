"use client";

import { getCVTemplateById } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import {
  ContactForm,
  EducationForm,
  ExperienceForm,
  InfoForm,
  SkillsForm,
  Step,
  SummaryForm,
} from "@/components/forms/createCV-AIForm";
import UpJdStep from "@/components/sections/up_JDforCV-AI";
import { useCV } from "@/providers/cv-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/global_provider";

// --- GIỮ NGUYÊN TRANSLATIONS ---
const translations = {
  en: {
    title: "Create Your CV",
    preview: "CV Preview",
    loadingTemplate: "Loading Template...",
    templateNotFound: (title: string) => `Component for "${title}" not found.`,
    errorDecodingToken: "Error decoding token:",
    noDataToSave: "No data or CV template to save.",
    cvDataEmpty: "CV data is empty, cannot save.",
    saveSuccess: "CV saved successfully!",
    saveError: "An error occurred while saving your CV.",
    templateNotFoundToCreate: "Template not found to create CV.",
    prevStep: "Previous Step",
    nextStep: "Next Step",
    finish: "Finish",
    finalStepMessage:
      "Next, you will be taken to the CV creation page to review your CV, then you can choose to save or download.",
    steps: {
      personalInfo: {
        name: "Personal Information",
        description:
          "Enter your name, title, and basic information so recruiters can know who you are.",
      },
      contact: {
        name: "Contact",
        description:
          "Provide your email and phone number so recruiters can contact you.",
      },
      jobInfo: {
        name: "Add Job Information",
        description: "",
      },
      skills: {
        name: "Skills",
        description:
          "List your professional and soft skills relevant to the job.",
      },
      experience: {
        name: "Work Experience",
        description: "List the positions and jobs you have held in the past.",
      },
      education: {
        name: "Education",
        description:
          "Information about your academic background, schools, and degrees.",
      },
      summary: {
        name: "Career Objective",
        description: "A brief summary of yourself and your career orientation.",
      },
      review: {
        name: "Review & Complete",
        description:
          "Review all your CV information before saving or exporting the file.",
      },
    },
  },
  vi: {
    title: "Tạo CV của bạn",
    preview: "Xem trước CV",
    loadingTemplate: "Đang tải Mẫu...",
    templateNotFound: (title: string) =>
      `Không tìm thấy component cho "${title}".`,
    errorDecodingToken: "Lỗi giải mã token:",
    noDataToSave: "Chưa có dữ liệu hoặc mẫu CV để lưu.",
    cvDataEmpty: "Dữ liệu CV trống, không thể lưu.",
    saveSuccess: "Lưu CV thành công!",
    saveError: "Có lỗi xảy ra khi lưu CV của bạn.",
    templateNotFoundToCreate: "Không tìm thấy template để tạo CV.",
    prevStep: "Bước trước đó",
    nextStep: "Bước tiếp theo",
    finish: "Hoàn tất",
    finalStepMessage:
      "Tiếp theo, bạn sẽ được đưa tới trang tạo CV để xem lại, sau đó bạn có thể chọn lưu hoặc tải về.",
    steps: {
      personalInfo: {
        name: "Thông tin cá nhân",
        description:
          "Điền tên, chức danh và các thông tin cơ bản để nhà tuyển dụng biết bạn là ai.",
      },
      contact: {
        name: "Liên hệ",
        description:
          "Cung cấp email, số điện thoại để nhà tuyển dụng có thể liên lạc với bạn.",
      },
      jobInfo: {
        name: "Thêm thông tin công việc",
        description: "",
      },
      skills: {
        name: "Kỹ năng",
        description:
          "Các kỹ năng chuyên môn và kỹ năng mềm liên quan đến công việc.",
      },
      experience: {
        name: "Kinh nghiệm làm việc",
        description:
          "Liệt kê các vị trí và công việc bạn đã đảm nhiệm trong quá khứ.",
      },
      education: {
        name: "Học vấn",
        description:
          "Thông tin về quá trình học tập, trường lớp và bằng cấp của bạn.",
      },
      summary: {
        name: "Mục tiêu sự nghiệp",
        description:
          "Một đoạn tóm tắt ngắn gọn về bản thân và định hướng công việc của bạn.",
      },
      review: {
        name: "Hoàn tất",
        description:
          "Xem lại toàn bộ thông tin CV của bạn trước khi lưu hoặc xuất file.",
      },
    },
  },
};

interface DecodedToken {
  sub: string;
  role: string;
}

function CreateCVwithAI() {
  const { language } = useLanguage();
  const t = translations[language];

  const steps = [
    {
      id: 1,
      name: t.steps.personalInfo.name,
      description: t.steps.personalInfo.description,
    },
    {
      id: 2,
      name: t.steps.contact.name,
      description: t.steps.contact.description,
    },
    {
      id: 3,
      name: t.steps.jobInfo.name,
      description: t.steps.jobInfo.description,
    },
    {
      id: 4,
      name: t.steps.skills.name,
      description: t.steps.skills.description,
    },
    {
      id: 5,
      name: t.steps.experience.name,
      description: t.steps.experience.description,
    },
    {
      id: 6,
      name: t.steps.education.name,
      description: t.steps.education.description,
    },
    {
      id: 7,
      name: t.steps.summary.name,
      description: t.steps.summary.description,
    },
    {
      id: 8,
      name: t.steps.review.name,
      description: t.steps.review.description,
    },
  ];

  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const [currentStep, setCurrentStep] = useState(1);
  const { userData, updateUserData, currentTemplate, loadTemplate } = useCV();
  const router = useRouter();

  useEffect(() => {
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
      return (
        <p className="text-center text-gray-500 mt-4">{t.loadingTemplate}</p>
      );
    }
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) {
      return <div>{t.templateNotFound(currentTemplate.title)}</div>;
    }
    const componentData = {
      ...currentTemplate.data,
      userData: userData,
    };
    const containerWidth = 320;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    return (
      <div className="flex justify-center mt-4">
        {" "}
        {/* Căn giữa preview */}
        <div className="w-[320px] h-[460px] overflow-hidden rounded shadow-lg border border-gray-200 bg-white">
          <div className="origin-top-left w-[794px] h-[1123px]">
            {" "}
            {/* Kích thước gốc A4 */}
            <div
              style={{
                transformOrigin: "top left",
                transform: `scale(${scaleFactor})`,
              }}
            >
              <TemplateComponent data={componentData} language={language} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinishAndGoToCreateCV = () => {
    if (currentTemplate && currentTemplate._id) {
      router.push(`/createCV-AIManual?id=${currentTemplate._id}`);
    } else {
      alert(t.templateNotFoundToCreate);
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
        return <UpJdStep />;
      case 4:
        return <SkillsForm data={safeUserData} onUpdate={updateUserData} />;
      case 5:
        return <ExperienceForm data={safeUserData} onUpdate={updateUserData} />;
      case 6:
        return <EducationForm data={safeUserData} onUpdate={updateUserData} />;
      case 7:
        return <SummaryForm data={safeUserData} onUpdate={updateUserData} />;
      default:
        return <h1 className="text-xl text-center">{t.finalStepMessage}</h1>;
    }
  };

  return (
    // SỬA: min-h-screen để đảm bảo bao phủ toàn màn hình
    <div className="flex w-full min-h-screen bg-gray-100 items-start">
      {/* SỬA: Sidebar Trái - Sticky */}
      <aside className="w-1/4 max-w-xs bg-gray-800 p-8 text-white pt-10 sticky top-0 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
        <h1 className="text-xl font-bold mb-8">{t.title}</h1>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-row">
        {/* Cột Form Chính - Scrollable */}
        <div className="flex flex-col w-2/3 min-h-screen">
          <div className="flex-grow px-12 py-8 width-full">
            <h2 className="text-3xl font-bold text-gray-900">
              {steps[currentStep - 1].name}
            </h2>
            {/* START: Header chứa Tiêu đề và Nút điều hướng */}
            <div className="flex items-center justify-between mb-2 w-full">
              {/* Bên trái: mô tả bước */}
              <p className="mt-2 text-md text-gray-600">
                {steps[currentStep - 1].description}
              </p>

              {/* Bên phải: cụm nút */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" /> {t.prevStep}
                </button>

                <button
                  type="button"
                  onClick={
                    currentStep === steps.length
                      ? handleFinishAndGoToCreateCV
                      : handleNextStep
                  }
                  className="flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white border border-white shadow-sm hover:bg-blue-400"
                >
                  {currentStep === steps.length ? t.finish : t.nextStep}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* END: Header */}
            <div className="mt-8 p-8 border rounded-lg bg-white shadow-sm">
              {renderCurrentStepForm()}
            </div>
          </div>

          {/* ĐÃ XÓA FOOTER NAVIGATION CŨ Ở ĐÂY */}
        </div>

        {/* SỬA: Sidebar Phải (Preview) - Sticky */}
        <aside className="flex flex-col w-1/3 bg-white border-l sticky top-0 h-screen overflow-hidden">
          <div className="p-8 pb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
              {t.preview}
            </h3>
          </div>
          {/* Container cho CV, đảm bảo nó nằm ngay dưới tiêu đề */}
          <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
            {renderCVPreview()}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CreateCVwithAI;
