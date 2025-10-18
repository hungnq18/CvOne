"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import {
  createCV,
  CV,
  CVTemplate,
  getCVById,
  getCVTemplateById,
  getCVTemplates,
  suggestTemplateByAI,
  translateCV,
  updateCV,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import {
  FileDown,
  Printer,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Languages,
} from "lucide-react";
import Image from "next/image";
import { useCV } from "@/providers/cv-provider";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { jwtDecode } from "jwt-decode";
import { CVAIEditorPopupsManager } from "@/components/forms/CV-AIEditorPopup";
import TranslateCVModal from "@/components/modals/TranslateCVModal";
import { useLanguage } from "@/providers/global_provider";

// BƯỚC 2: TẠO ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    // Sidebar Sections
    personalInfo: "Personal Information",
    contact: "Contact",
    careerObjective: "Career Objective",
    workExperience: "Work Experience",
    education: "Education",
    skills: "Skills",
    cvSections: "CV SECTIONS",

    // Header & Buttons
    editCv: "Edit CV",
    editTitleTooltip: "Click to edit title",
    cvTemplates: "CV TEMPLATES",
    goBack: "Go Back",
    saving: "Saving...",
    complete: "Complete",
    
    // Main Content & Loaders
    loadingTemplate: "Loading Template...",
    templateComponentNotFound: (title: string) => `Component for "${title}" not found.`,
    
    // Actions
    download: "Download",
    print: "Print CV",
    email: "Email",
    translate: "Translate CV",
    
    // Alerts & Messages
    errorDecodingToken: "Error decoding token:",
    noDataToSave: "No data or CV template to save.",
    cvDataEmpty: "CV data is empty, cannot save.",
    saveSuccess: "CV saved successfully!",
    saveError: "An error occurred while saving your CV.",
    pdfCreateEnvError: "Cannot create environment to export PDF.",
    pdfCreateError: "An error occurred while exporting the PDF file.",

    // Dynamic titles
    loadingTemplateForNew: "Loading template to create new...",
    cvTitleDefault: (title: string) => `CV - ${title}`,
    cvForUser: (name: string) => `CV for ${name || "Untitled"}`,
  },
  vi: {
    // Sidebar Sections
    personalInfo: "Thông tin cá nhân",
    contact: "Liên hệ",
    careerObjective: "Mục tiêu sự nghiệp",
    workExperience: "Kinh nghiệm làm việc",
    education: "Học vấn",
    skills: "Kỹ năng",
    cvSections: "CÁC MỤC CỦA CV",

    // Header & Buttons
    editCv: "Chỉnh Sửa CV",
    editTitleTooltip: "Click để chỉnh sửa tiêu đề",
    cvTemplates: "MẪU CV",
    goBack: "Quay Lại",
    saving: "Đang lưu...",
    complete: "Hoàn Thành",

    // Main Content & Loaders
    loadingTemplate: "Đang tải Mẫu...",
    templateComponentNotFound: (title: string) => `Không tìm thấy component cho "${title}".`,
    
    // Actions
    download: "Tải về",
    print: "In CV",
    email: "Email",
    translate: "Dịch CV",

    // Alerts & Messages
    errorDecodingToken: "Lỗi giải mã token:",
    noDataToSave: "Chưa có dữ liệu hoặc mẫu CV để lưu.",
    cvDataEmpty: "Dữ liệu CV trống, không thể lưu.",
    saveSuccess: "Lưu CV thành công!",
    saveError: "Có lỗi xảy ra khi lưu CV của bạn.",
    pdfCreateEnvError: "Không thể tạo môi trường để xuất PDF.",
    pdfCreateError: "Đã có lỗi xảy ra khi xuất file PDF.",
    
    // Dynamic titles
    loadingTemplateForNew: "Đang tải template để tạo mới...",
    cvTitleDefault: (title: string) => `CV - ${title}`,
    cvForUser: (name: string) => `CV cho ${name || "Chưa có tên"}`,
  },
};

// --- INTERFACES & TYPES (Không đổi) ---
interface DecodedToken {
  sub: string;
  role: string;
}

const DropdownArrow = () => (
  <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white" />
);


const PageCreateCVAIContent = () => {
  // BƯỚC 3: SỬ DỤNG HOOK VÀ LẤY ĐÚNG BỘ TỪ ĐIỂN
  const { language } = useLanguage();
  const t = translations[language];

  // BƯỚC 4: TẠO MẢNG sidebarSections ĐỘNG
  const sidebarSections = [
    { id: "info", title: t.personalInfo },
    { id: "contact", title: t.contact },
    { id: "summary", title: t.careerObjective },
    { id: "experience", title: t.workExperience },
    { id: "education", title: t.education },
    { id: "skills", title: t.skills },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const { currentTemplate, userData, loadTemplate, updateUserData, jobDescription } = useCV();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [cvId, setCvId] = useState<string | null>(id);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvTitle, setCvTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTemplate, setSuggestedTemplate] = useState<CVTemplate | null>(null);
  const [hasAutoSuggested, setHasAutoSuggested] = useState(false);
  const [suppressAutoSuggest, setSuppressAutoSuggest] = useState<boolean>(false);

  // Debug: Reset suppress flag if needed (remove this in production)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log("[Debug] suppressAutoSuggest:", suppressAutoSuggest);
      console.log("[Debug] sessionStorage suppressAISuggest:", sessionStorage.getItem('suppressAISuggest'));
    }
  }, [suppressAutoSuggest]);

  const templateDropdownRef = useRef(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));

  useEffect(() => {
    // Clear suppress flag khi vào trang lần đầu (không phải từ đổi template)
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('suppressAISuggest');
      }
    } catch {}
    
    getCVTemplates().then((data) => setAllTemplates(data));
    const idFromUrl = id;

    if (idFromUrl) {
      setLoading(true);
      getCVById(idFromUrl)
        .then((templateData) => {
          if (templateData) {
            loadTemplate(templateData);
            if (templateData.title) {
              setCvTitle(templateData.title);
            }
            if ((!userData || Object.keys(userData).length === 0) && templateData.content?.userData) {
              updateUserData(templateData.content.userData);
            }
          }
          setLoading(false);
        })
        .catch(() => {
          console.log(t.loadingTemplateForNew);
          setCvId(null);
          getCVTemplateById(idFromUrl).then((templateData) => {
            if (templateData) {
              loadTemplate(templateData);
              if ((!userData || Object.keys(userData).length === 0) && templateData.data?.userData) {
                updateUserData(templateData.data.userData);
              }
              setCvTitle(t.cvTitleDefault(templateData.title));
            }
            setLoading(false);
          });
        });
    } else {
      setLoading(false);
    }
  }, [id, loadTemplate, updateUserData, userData, t]);

  const handleTemplateSelect = (selectedTemplate: CVTemplate) => {
    // Khi người dùng đổi template thủ công, không auto-suggest nữa trong phiên hiện tại
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('suppressAISuggest', '1');
      }
    } catch {}
    setSuppressAutoSuggest(true);
    setHasAutoSuggested(true);
    // Sửa lại URL cho đúng với trang AI
    router.push(
      `/createCV-AIManual?id=${selectedTemplate._id}`
    );
    setCvTitle(t.cvTitleDefault(selectedTemplate.title));
    setShowTemplatePopup(false);
  };

  const handleDataUpdate = (updatedData: any) => {
    updateUserData(updatedData);
    setIsDirty(true);
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
      console.error(t.errorDecodingToken, error);
      return null;
    }
  };

  const handleSaveToDB = async (): Promise<boolean> => {
    const userId = getUserIdFromToken();
    if (!userData || !currentTemplate) {
      alert(t.noDataToSave);
      return false;
    }
    if (Object.keys(userData).length === 0) {
      alert(t.cvDataEmpty);
      return false;
    }

    setIsSaving(true);
    try {
      if (cvId) {
        const dataToUpdate: Partial<CV> = {
          content: { userData },
          title: cvTitle || t.cvForUser(userData.firstName),
          updatedAt: new Date().toISOString(),
        };
        await updateCV(cvId, dataToUpdate);
      } else {
        const dataToCreate: Omit<CV, "_id"> = {
          userId: userId || "", 
          title: cvTitle || t.cvForUser(`${userData.firstName} ${userData.lastName}`),
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
          setCvId(newCV.id);
          // Sửa lại URL cho đúng với trang AI
          router.replace(`/createCV-AIManual?id=${newCV.id}`, { scroll: false });
        }
      }
      alert(t.saveSuccess);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error(t.saveError, error);
      alert(t.saveError);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    const isSuccess = await handleSaveToDB();
    if (isSuccess) {
      router.push("/myDocuments");
    }
  };

  const handleSectionClick = (sectionId: string) => {
    if(sectionId == "avatar") {
      sectionId = "info"
    }
    setActivePopup(sectionId);
  };

  const renderCVForPDF = () => {
    if (!currentTemplate || !userData) return null;
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) return null;

    const componentData = {
      ...currentTemplate.data,
      userData: userData,
    };

    const fontBase64 = "data:font/woff2;base64,d09GMgABAAAAA... (thay bằng chuỗi Base64 thật của font bạn dùng)";
    const fontName = 'CVFont';

    return (
      <div>
        <style>
            {`
            @font-face {
                font-family: '${fontName}'; 
                src: url(${fontBase64}) format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            `}
        </style>
        
        <div style={{ fontFamily: `'${fontName}', sans-serif` }}>
             <TemplateComponent data={componentData} isPdfMode={true} language={language} />
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '794px';
    iframe.style.height = '1123px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert(t.pdfCreateEnvError);
      document.body.removeChild(iframe);
      return;
    }
    
    const head = iframeDoc.head;
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
        head.appendChild(node.cloneNode(true));
    });

    const mountNode = iframeDoc.createElement('div');
    iframeDoc.body.appendChild(mountNode);

    let root: any = null;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const { createRoot } = await import('react-dom/client');
      root = createRoot(mountNode);
      root.render(renderCVForPDF());
      
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const html2pdf = (await import("html2pdf.js"))?.default || (await import("html2pdf.js"));
      
      await html2pdf()
        .from(iframe.contentWindow.document.body)
        .set({
            margin: 0,
            filename: `${cvTitle || "cv"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
        })
        .save();

    } catch (error) {
      console.error(t.pdfCreateError, error);
      alert(t.pdfCreateError);
    } finally {
      if (root) {
        root.unmount();
      }
      if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
      }
    }
  };

  const renderCVPreview = () => {
    if (loading || !currentTemplate || !userData) {
      return <p className="text-center">{t.loadingTemplate}</p>;
    }
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) {
      return <div>{t.templateComponentNotFound(currentTemplate.title)}</div>;
    }
    const componentData = {
      ...currentTemplate.data,
      userData: userData,
    };

    const containerWidth = 700;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    return (
      <div className="max-w-[1050px] origin-top" ref={previewRef}>
        <div
          style={{
            width: `${templateOriginalWidth}px`,
            height: `${templateOriginalWidth * (297 / 210)}px`,
            transformOrigin: "top",
            transform: `scale(${scaleFactor})`,
          }}
        >
          <TemplateComponent data={componentData} onSectionClick={handleSectionClick} />
        </div>
      </div>
    );
  };

  const handleBackClick = () => {
    if (isDirty) {
        setActivePopup("confirmLeave");
    } else {
        router.push(`/cvTemplates`);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    setIsDirty(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvTitle(e.target.value);
  };

  const handleTranslateCV = async (targetLanguage: string) => {
    if (!userData || !currentTemplate) {
      alert(t.noDataToSave);
      return;
    }

    setIsTranslating(true);
    try {
      const translatedData = await translateCV(userData, targetLanguage);
      // console.log("[translateCV] response:", translatedData);

      const nextUserData = translatedData?.data?.userData ?? translatedData?.content?.userData;
      // console.log("[translateCV] nextUserData:", nextUserData);
      
      if (nextUserData) {
        updateUserData(nextUserData);
        setIsDirty(true);
        setShowTranslateModal(false);
        alert(language === "vi" ? "Dịch CV thành công!" : "CV translated successfully!");
      } else {
        console.warn("[translateCV] missing content.userData in response", translatedData);
        setShowTranslateModal(false);
      }
    } catch (error) {
      console.error("[translateCV] error:", error);
      alert(language === "vi" ? "Có lỗi xảy ra khi dịch CV" : "Error occurred while translating CV");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAISuggestTemplate = async () => {
    if (!userData || !jobDescription) {
      // Still allow suggestion with empty JD but warn
    }
    setIsSuggesting(true);
    try {
      console.log("[AI Suggest] payload:", {
        infoUser: userData || {},
        jobDescription: jobDescription || "",
      });
      const result = await suggestTemplateByAI(userData || {}, jobDescription || "");
      console.log("[AI Suggest] raw result:", result);
      // Always use ONLY the first suggestion from the API response
      const first = Array.isArray(result)
        ? result[0]
        : Array.isArray(result?.templates)
          ? result.templates[0]
          : Array.isArray(result?.data)
            ? result.data[0]
            : result;
      // Accept shapes: string id | {_id} | {templateId} | full template
      const templateId = typeof first === 'string' ? first : (first?.templateId || first?._id);
      console.log("[AI Suggest] first item:", first);
      console.log("[AI Suggest] templateId:", templateId);
      let found: CVTemplate | undefined;
      if (templateId) {
        found = (allTemplates || []).find((t) => t._id === templateId);
      }
      const finalTemplate: CVTemplate | null = found || (first && first.imageUrl && first.title ? first : null);
      console.log("[AI Suggest] resolved template:", finalTemplate);
      setSuggestedTemplate(finalTemplate);
      setShowSuggestModal(true);
    } catch (e) {
      console.error("[AI Suggest] error:", e);
      alert(language === "vi" ? "AI đề xuất mẫu thất bại" : "AI suggestion failed");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Auto-trigger suggestion once when data is ready
  useEffect(() => {
    if (hasAutoSuggested) return;
    const ready = (allTemplates && allTemplates.length > 0) && (userData && Object.keys(userData).length > 0) && !suppressAutoSuggest;
    console.log("[Auto Suggest] Check conditions:", {
      allTemplates: allTemplates?.length,
      userData: userData ? Object.keys(userData).length : 0,
      suppressAutoSuggest,
      ready
    });
    if (!ready) return;
    setHasAutoSuggested(true);
    handleAISuggestTemplate();
  }, [allTemplates, userData, hasAutoSuggested, suppressAutoSuggest]);

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden mb-4">
      <header
        className="bg-slate-900 text-white pt-20 pb-6 px-8 flex justify-between items-center z-20"
        style={{ backgroundColor: "#0b1b34" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cvTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-white"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <h1 
                className="text-2xl font-bold cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleTitleEdit}
                title={t.editTitleTooltip}
              >
                {cvTitle || (currentTemplate ? t.cvTitleDefault(currentTemplate.title) : t.editCv)}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={templateDropdownRef}>
              <button
                onClick={() => setShowTemplatePopup(!showTemplatePopup)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-semibold"
              >
                {t.cvTemplates}
              </button>
              {showTemplatePopup && (
                <div
                  className="absolute top-full mt-3 bg-white rounded-md shadow-lg z-20 p-4 w-[450px]"
                  style={{ left: "-110%" }}
                >
                  <DropdownArrow />
                  <div className="grid grid-cols-3 gap-4">
                    {allTemplates.map((item) => (
                      <button
                        key={item._id}
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
                        {currentTemplate?._id === item._id && (
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
            onClick={handleBackClick}
            disabled={isSaving}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={18} /> {t.goBack}
          </button>
          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {isSaving ? t.saving : t.complete}{" "}
          </button>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        <aside className="w-72 bg-white p-6 border-r border-slate-200 overflow-y-auto">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">
            {t.cvSections}
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
            <button
              className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
              onClick={handleDownloadPDF}
            >
              <FileDown size={20} /> {t.download}
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
              onClick={handleAISuggestTemplate}
              disabled={isSuggesting}
            >
              {isSuggesting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {language === "vi" ? "AI gợi ý mẫu" : "AI suggest template"}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Printer size={20} /> {t.print}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Mail size={20} /> {t.email}
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
              onClick={() => setShowTranslateModal(true)}
            >
              <Languages size={20} /> {t.translate}
            </button>
          </div>
        </aside>
      </main>

      <CVAIEditorPopupsManager
        activePopup={activePopup}
        onClose={() => setActivePopup(null)}
        userData={userData}
        handleDataUpdate={handleDataUpdate}
        isSaving={isSaving}
        onLeaveWithoutSaving={() => {
          router.push(`/cvTemplates`);
        }}
        onSaveAndLeave={async () => {
          const isSuccess = await handleSaveToDB();
          if (isSuccess) {
            router.push(`/cvTemplates`);
          }
        }}
      />

      <TranslateCVModal
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        onTranslate={handleTranslateCV}
        isTranslating={isTranslating}
      />

      {showSuggestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold">
                {language === "vi" ? "AI gợi ý mẫu phù hợp cho bạn" : "AI suggested template for you"}
              </h3>
              <button onClick={() => setShowSuggestModal(false)} className="text-slate-500 hover:text-slate-800">
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-5 border-r">
                <div className="font-medium mb-2 text-slate-700">
                  {language === "vi" ? "Đề xuất của AI (bên trái)" : "AI suggestion (left)"}
                </div>
                {suggestedTemplate ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-md overflow-hidden flex items-start justify-center">
                      {(() => {
                        const TemplateComponent = templateComponentMap?.[suggestedTemplate.title];
                        if (!TemplateComponent) return (
                          <div className="aspect-[210/297] w-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                            {language === "vi" ? "Không tìm thấy component" : "Component not found"}
                          </div>
                        );
                        const componentData = { ...(suggestedTemplate.data || {}), userData };
                        const templateOriginalWidth = 794;
                        const templateOriginalHeight = templateOriginalWidth * (297 / 210);
                        const containerWidth = 300; // preview width in modal
                        const containerHeight = containerWidth * (297 / 210);
                        const scaleFactor = containerWidth / templateOriginalWidth;
                        return (
                          <div className="relative" style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}>
                            <div
                              className="absolute top-0 left-0 origin-top-left"
                              style={{ width: `${templateOriginalWidth}px`, height: `${templateOriginalHeight}px`, transform: `scale(${scaleFactor})` }}
                            >
                              <TemplateComponent data={componentData} language={language} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-base font-semibold">{suggestedTemplate.title}</div>
                    <button
                      onClick={() => {
                        setShowSuggestModal(false);
                        router.push(`/createCV-AIManual?id=${suggestedTemplate!._id}`);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
                    >
                      {language === "vi" ? "Chọn mẫu AI đề xuất" : "Use AI suggested template"}
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">
                    {language === "vi" ? "AI chưa tìm thấy mẫu phù hợp. Có thể do bạn chưa nhập thông tin công việc." : "AI did not return a template. Maybe you don't enter job description."}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="font-medium mb-2 text-slate-700">
                  {language === "vi" ? "Mẫu bạn đang chọn (bên phải)" : "Your currently selected template (right)"}
                </div>
                {currentTemplate ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-md overflow-hidden flex items-start justify-center">
                      {(() => {
                        const TemplateComponent = templateComponentMap?.[currentTemplate.title];
                        if (!TemplateComponent) return (
                          <div className="aspect-[210/297] w-full bg-slate-100" />
                        );
                        const componentData = { ...(currentTemplate.data || {}), userData };
                        const templateOriginalWidth = 794;
                        const templateOriginalHeight = templateOriginalWidth * (297 / 210);
                        const containerWidth = 300;
                        const containerHeight = containerWidth * (297 / 210);
                        const scaleFactor = containerWidth / templateOriginalWidth;
                        return (
                          <div className="relative" style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}>
                            <div
                              className="absolute top-0 left-0 origin-top-left"
                              style={{ width: `${templateOriginalWidth}px`, height: `${templateOriginalHeight}px`, transform: `scale(${scaleFactor})` }}
                            >
                              <TemplateComponent data={componentData} language={language} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-base font-semibold">{currentTemplate.title}</div>
                    <button
                      onClick={() => setShowSuggestModal(false)}
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 rounded-md"
                    >
                      {language === "vi" ? "Giữ nguyên mẫu hiện tại" : "Keep my current template"}
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">
                    {language === "vi" ? "Bạn chưa chọn mẫu nào." : "No template is selected yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageCreateCVAIContent;