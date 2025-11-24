"use client";

import {
  CV,
  CVTemplate,
  getCVById,
  getCVTemplateById,
  getCVTemplates,
  updateCV,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { CVAIEditorPopupsManager } from "@/components/forms/CV-AIEditorPopup";
import { CVEditorPopupsManager } from "@/components/forms/CVEditorPopups";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Loader2,
  Mail,
  Printer,
  LayoutTemplate,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import CVTemplateLayoutPopup from "@/components/forms/CVTemplateLayoutPopup";
import { getDefaultSectionPositions } from "../cvTemplate/defaultSectionPositions";

// --- TRANSLATIONS ---
const translations = {
  en: {
    sidebar: {
      personalInfo: "Personal Information",
      contact: "Contact",
      careerObjective: "Career Objective",
      workExperience: "Work Experience",
      education: "Education",
      skills: "Skills",
      certification: "Certification",
      achievement: "Achievement",
      hobby: "Hobby",
      project: "Project",
      title: "CV SECTIONS",
      customLayout: "Custom Layout",
    },
    header: {
      defaultTitle: "Update CV",
      editTitleTooltip: "Click to edit title",
      templates: "CV TEMPLATES",
      goBack: "Go Back",
      saving: "Updating...",
      update: "Update CV",
    },
    aside: {
      download: "Download",
      print: "Print CV",
      email: "Email",
    },
    content: {
      templateComponentNotFound: (title: string) => `Component for "${title}" not found.`,
    },
    alerts: {
      cvNotFound: "CV with this ID not found.",
      templateIdMissing: "CV is missing a template ID.",
      templateNotFound: "CV template not found.",
      loadCVError: "Error loading CV data:",
      cantLoadCV: "Could not load CV.",
      noCVId: "CV ID not found.",
      newTemplateError: "Could not load new template data.",
      changeTemplateError: "An error occurred while changing the template.",
      updateMissingData: "Missing data, CV ID, or CV template to update.",
      updateSuccess: "CV updated successfully!",
      updateCVError: "An error occurred while updating your CV.",
      pdfCreateEnvError: "Cannot create environment to export PDF.",
      pdfCreateError: "An error occurred while exporting the PDF file.",
    },
  },
  vi: {
    sidebar: {
      personalInfo: "Thông tin cá nhân",
      contact: "Liên hệ",
      careerObjective: "Mục tiêu sự nghiệp",
      workExperience: "Kinh nghiệm làm việc",
      education: "Học vấn",
      skills: "Kỹ năng",
      certification: "Chứng chỉ",
      achievement: "Thành tựu",
      hobby: "Sở thích",
      project: "Dự án",
      title: "CÁC MỤC CỦA CV",
      customLayout: "Tùy chỉnh bố cục",
    },
    header: {
      defaultTitle: "Cập nhật CV",
      editTitleTooltip: "Click để chỉnh sửa tiêu đề",
      templates: "MẪU CV",
      goBack: "Quay Lại",
      saving: "Đang cập nhật...",
      update: "Cập nhật CV",
    },
    aside: {
      download: "Tải về",
      print: "In CV",
      email: "Email",
    },
    content: {
      templateComponentNotFound: (title: string) => `Không tìm thấy component cho "${title}".`,
    },
    alerts: {
      cvNotFound: "Không tìm thấy CV với ID này.",
      templateIdMissing: "CV không có template ID.",
      templateNotFound: "Không tìm thấy template CV.",
      loadCVError: "Lỗi khi load CV data:",
      cantLoadCV: "Không thể tải CV.",
      noCVId: "Không tìm thấy ID CV.",
      newTemplateError: "Không thể tải dữ liệu template mới.",
      changeTemplateError: "Có lỗi xảy ra khi đổi template.",
      updateMissingData: "Chưa có dữ liệu, ID CV hoặc mẫu CV để cập nhật.",
      updateSuccess: "Cập nhật CV thành công!",
      updateCVError: "Có lỗi xảy ra khi cập nhật CV của bạn.",
      pdfCreateEnvError: "Không thể tạo môi trường để xuất PDF.",
      pdfCreateError: "Có lỗi xảy ra khi xuất file PDF.",
    },
  },
};

// --- INTERFACES & TYPES ---
interface DecodedToken {
  sub: string;
  role: string;
}

const DropdownArrow = () => (
  <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white" />
);

const PageUpdateCVContent = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const sidebarSections = [
    { id: "info", title: t.sidebar.personalInfo, isHidden: false },
    { id: "contact", title: t.sidebar.contact, isHidden: false },
    { id: "summary", title: t.sidebar.careerObjective, isHidden: false },
    { id: "experience", title: t.sidebar.workExperience, isHidden: false },
    { id: "education", title: t.sidebar.education, isHidden: false },
    { id: "skills", title: t.sidebar.skills, isHidden: false },
    { id: "certification", title: t.sidebar.certification, isHidden: true },
    { id: "achievement", title: t.sidebar.achievement, isHidden: true },
    { id: "hobby", title: t.sidebar.hobby, isHidden: true },
    { id: "Project", title: t.sidebar.project, isHidden: true },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const cvId = searchParams.get("id");
  const { currentTemplate, userData, loadTemplate, updateUserData, getSectionPositions, updateSectionPositions } = useCV();

  // --- REFS ĐỂ TRÁNH STALE CLOSURE (LỖI QUAN TRỌNG ĐÃ SỬA) ---
  const currentTemplateRef = useRef(currentTemplate);
  const userDataRef = useRef(userData);

  // Đồng bộ Ref với State
  useEffect(() => {
    currentTemplateRef.current = currentTemplate;
  }, [currentTemplate]);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvData, setCvData] = useState<CV | null>(null);
  const [cvTitle, setCvTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showLayoutPopup, setShowLayoutPopup] = useState(false);

  const templateDropdownRef = useRef(null);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));

  useEffect(() => {
    if (!jobDescription || jobDescription === "") {
      const jd = localStorage.getItem("jobDescription");
      if (jd) setJobDescription(jd);
    }
    
    const loadCVDataAndTemplate = async (id: string) => {
      try {
        const cv = await getCVById(id);
        if (!cv) throw new Error(t.alerts.cvNotFound);

        setCvData(cv);
        setCvTitle(cv.title || "Untitled CV");

        if (!cv.cvTemplateId) throw new Error(t.alerts.templateIdMissing);

        const template = await getCVTemplateById(cv.cvTemplateId);
        if (!template) throw new Error(t.alerts.templateNotFound);

        loadTemplate(template);

        if (cv.content?.userData) {
          // Cập nhật positions cho template hiện tại từ dữ liệu đã lưu
          if (cv.content.userData.sectionPositions && cv.cvTemplateId) {
            updateSectionPositions(cv.cvTemplateId, cv.content.userData.sectionPositions);
          }
          updateUserData(cv.content.userData);
        }
      } catch (error) {
        console.error(t.alerts.loadCVError, error);
        alert(error instanceof Error ? error.message : t.alerts.cantLoadCV);
        router.push("/myDocuments");
      }
    };

    getCVTemplates().then(setAllTemplates);

    if (cvId) {
      setLoading(true);
      loadCVDataAndTemplate(cvId).finally(() => setLoading(false));
    } else {
      alert(t.alerts.noCVId);
      router.push("/myDocuments");
    }
  }, [cvId, loadTemplate, updateUserData, router, t, jobDescription, updateSectionPositions]);

  // --- HÀM XỬ LÝ CHỌN TEMPLATE (ĐÃ SỬA) ---
  const handleTemplateSelect = async (selectedTemplate: CVTemplate) => {
    setShowTemplatePopup(false);
    if (currentTemplate?._id === selectedTemplate._id) return;

    try {
      setLoading(true);
      const newTemplateData = await getCVTemplateById(selectedTemplate._id);

      if (newTemplateData) {
        // QUAN TRỌNG: Lấy layout chuẩn của template mới (Reset layout về mặc định của template đó)
        // Điều này đảm bảo khi đổi template, layout được reset về default của template mới
        const correctPositions = 
          newTemplateData.data?.sectionPositions || 
          getDefaultSectionPositions(newTemplateData.title);

        console.log("[handleTemplateSelect] Changing template:", {
          oldTemplateId: currentTemplate?._id,
          oldTemplateTitle: currentTemplate?.title,
          newTemplateId: newTemplateData._id,
          newTemplateTitle: newTemplateData.title,
          newPositions: correctPositions
        });

        // Load template mới TRƯỚC
        loadTemplate(newTemplateData);
        
        // Update sectionPositions của template MỚI vào provider
        // Điều này đảm bảo khi render, nó sẽ lấy đúng positions của template mới
        updateSectionPositions(newTemplateData._id, correctPositions);

        // Cập nhật ngay lập tức vào userData để giao diện update
        // QUAN TRỌNG: Phải dùng correctPositions của template mới, không dùng positions cũ
        const newUserData = { 
          ...userData, 
          sectionPositions: correctPositions  // Reset về default của template mới
        };

        updateUserData(newUserData);
        
        setIsDirty(true);
      }
    } catch (error) {
       console.error(t.alerts.changeTemplateError, error);
       alert(t.alerts.changeTemplateError);
    } finally { 
       setLoading(false); 
    }
  };

  const handleDataUpdate = (updatedData: any) => {
    updateUserData(updatedData);
    setIsDirty(true);
  };

  const handleLayoutChange = (newPositions: any) => {
    if (currentTemplate) {
      updateSectionPositions(currentTemplate._id, newPositions);
      // Cập nhật trực tiếp vào userData để render lại ngay lập tức
      updateUserData({ ...userData, sectionPositions: newPositions });
      setIsDirty(true);
    }
  };

  const calculatePlaceAndOrder = (
    sectionId: string,
    currentPositions: any,
    templateTitle: string
  ) => {
    const defaultPositions = getDefaultSectionPositions(templateTitle);
    const isMinimalist1 =
      templateTitle === "The Vanguard" ||
      templateTitle?.includes("Vanguard");
    const isModern2 =
      templateTitle === "The Modern" || templateTitle?.includes("Modern");

    let targetPlace = 2;

    if (isMinimalist1) {
      if (sectionId === "hobby") {
        targetPlace = 2;
      } else if (
        sectionId === "certification" ||
        sectionId === "achievement" ||
        sectionId === "Project"
      ) {
        targetPlace = 3;
      }
    } else if (isModern2) {
      targetPlace = 3;
    } else {
      if (sectionId === "hobby") {
        targetPlace = 1;
      } else if (
        sectionId === "certification" ||
        sectionId === "achievement" ||
        sectionId === "Project"
      ) {
        targetPlace = 2;
      }
    }

    const targetPlaceSections = Object.entries(currentPositions)
      .filter(([_, pos]: [string, any]) => pos.place === targetPlace)
      .sort(([, a]: [string, any], [, b]: [string, any]) => a.order - b.order);

    if (targetPlaceSections.length > 0) {
      const lastOrder = (
        targetPlaceSections[targetPlaceSections.length - 1][1] as any
      ).order;
      return { place: targetPlace, order: lastOrder + 1 };
    }

    return { place: targetPlace, order: 0 };
  };

  // --- HÀM LƯU VÀO DB (SỬ DỤNG REF ĐỂ SỬA LỖI) ---
  const handleSaveToDB = async (): Promise<boolean> => {
    // QUAN TRỌNG: Lấy dữ liệu từ REF thay vì STATE để tránh lỗi Stale Closure
    const safeUserData = userDataRef.current;
    const safeTemplate = currentTemplateRef.current;

    if (!safeUserData || !cvId || !safeTemplate) {
      alert(t.alerts.updateMissingData);
      return false;
    }

    setIsSaving(true);
    try {
      // QUAN TRỌNG: Lấy sectionPositions với ưu tiên đúng
      // Ưu tiên: userData > provider > template data > default
      let sectionPositions = 
        safeUserData.sectionPositions || 
        getSectionPositions(safeTemplate._id) || 
        safeTemplate.data?.sectionPositions || 
        getDefaultSectionPositions(safeTemplate.title);
      
      // VALIDATION: Đảm bảo sectionPositions khớp với template HIỆN TẠI trước khi lưu
      // Nếu không khớp, reset về default để tránh lỗi layout khi load lại
      const defaultPositions = getDefaultSectionPositions(safeTemplate.title);
      const defaultSectionKeys = Object.keys(defaultPositions);
      const currentSectionKeys = Object.keys(sectionPositions);
      
      // Nếu sectionPositions thiếu hoặc thừa section so với default, reset về default
      if (defaultSectionKeys.length !== currentSectionKeys.length || 
          !defaultSectionKeys.every(key => currentSectionKeys.includes(key))) {
        console.warn("[handleSaveToDB] sectionPositions không khớp với template, reset về default trước khi lưu:", {
          cvId: cvId,
          templateTitle: safeTemplate.title,
          templateId: safeTemplate._id,
          defaultKeys: defaultSectionKeys,
          currentKeys: currentSectionKeys
        });
        sectionPositions = defaultPositions;
      }

      // Xây dựng completeUserData - đảm bảo TẤT CẢ fields nằm trong userData
      const completeUserData = {
        // Basic user info
        firstName: safeUserData.firstName || "",
        lastName: safeUserData.lastName || "",
        professional: safeUserData.professional || "",
        city: safeUserData.city || "",
        country: safeUserData.country || "",
        province: safeUserData.province || "",
        phone: safeUserData.phone || "",
        email: safeUserData.email || "",
        avatar: safeUserData.avatar || "",
        summary: safeUserData.summary || "",
        skills: safeUserData.skills || [],
        workHistory: safeUserData.workHistory || [],
        education: safeUserData.education || [],
        // Additional fields - TẤT CẢ phải nằm trong userData
        careerObjective: safeUserData.careerObjective || "",
        Project: safeUserData.Project || [],
        certification: safeUserData.certification || [],
        achievement: safeUserData.achievement || [],
        hobby: safeUserData.hobby || [],
        // Lưu sectionPositions của template HIỆN TẠI (đã được validate)
        sectionPositions: sectionPositions,
      };

      // Đảm bảo content CHỈ chứa userData (và uiTexts nếu có)
      const contentData: any = {
        userData: completeUserData
      };
      
      // Nếu có uiTexts, thêm vào (không nằm trong userData)
      if (safeUserData.uiTexts) {
        contentData.uiTexts = safeUserData.uiTexts;
      }

      const dataToUpdate: Partial<CV> = {
        content: contentData,
        title: cvTitle || safeUserData.firstName ? `CV - ${safeUserData.firstName}` : "Untitled CV",
        updatedAt: new Date().toISOString(),
        // QUAN TRỌNG: Lưu ID của template HIỆN TẠI (lấy từ Ref)
        cvTemplateId: safeTemplate._id,
      };

      console.log("[handleSaveToDB] Saving CV:", {
        cvId: cvId,
        templateId: safeTemplate._id,
        templateTitle: safeTemplate.title,
        sectionPositionsKeys: Object.keys(sectionPositions),
        dataToUpdate: {
          ...dataToUpdate,
          content: {
            ...dataToUpdate.content,
            userData: {
              ...dataToUpdate.content?.userData,
              // Chỉ log keys để không spam console
              sectionPositions: Object.keys(dataToUpdate.content?.userData?.sectionPositions || {})
            }
          }
        }
      });

      await updateCV(cvId, dataToUpdate);
      alert(t.alerts.updateSuccess);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error(t.alerts.updateCVError, error);
      alert(t.alerts.updateCVError);
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

  const handleSectionClick = (
    sectionId: string,
    event?: React.MouseEvent
  ) => {
    if (
      event &&
      (event.target as HTMLElement).closest(".section-toggle-icon")
    ) {
      event.stopPropagation();
      if (!currentTemplate) return;

      const currentPositions =
        userData.sectionPositions ||
        getSectionPositions(currentTemplate._id) ||
        currentTemplate.data?.sectionPositions ||
        getDefaultSectionPositions(currentTemplate.title);

      const sectionPosition = currentPositions[sectionId];
      const isInCV = sectionPosition && sectionPosition.place !== 0;

      if (isInCV) {
        const newPositions = {
          ...currentPositions,
          [sectionId]: { place: 0, order: 0 },
        };
        updateSectionPositions(currentTemplate._id, newPositions);
        updateUserData({ ...userData, sectionPositions: newPositions });
        setIsDirty(true);
      } else {
        const { place, order } = calculatePlaceAndOrder(
          sectionId,
          currentPositions,
          currentTemplate.title
        );
        const newPositions = {
          ...currentPositions,
          [sectionId]: { place, order },
        };
        updateSectionPositions(currentTemplate._id, newPositions);
        updateUserData({ ...userData, sectionPositions: newPositions });
        setIsDirty(true);
      }
      return;
    }

    if (sectionId == "avatar") {
      sectionId = "info";
    }
    setActivePopup(sectionId);
  };

  const renderCVForPDF = () => {
    // Dùng Ref ở đây cũng được để chắc chắn, nhưng thông thường user không click quá nhanh lúc render PDF
    const safeUserData = userDataRef.current;
    const safeTemplate = currentTemplateRef.current;

    if (!safeTemplate || !safeUserData) return null;
    const TemplateComponent = templateComponentMap?.[safeTemplate.title];
    if (!TemplateComponent) return null;

    const sectionPositions = 
      safeUserData.sectionPositions || 
      getSectionPositions(safeTemplate._id) || 
      safeTemplate.data?.sectionPositions || 
      getDefaultSectionPositions(safeTemplate.title); 

    const componentData = {
      ...safeTemplate.data,
      userData: safeUserData,
      sectionPositions: sectionPositions
    };

    // Font base64 place holder (giữ nguyên như cũ)
    const fontBase64 = "data:font/woff2;base64,d09GMgABAAAAA..."; 
    const fontName = 'CVFont';

    return (
      <div>
        <style>{`@font-face { font-family: '${fontName}'; src: url(${fontBase64}) format('woff2'); font-weight: normal; font-style: normal; }`}</style>
        <div style={{ fontFamily: `'${fontName}', sans-serif` }}>
           <TemplateComponent data={componentData} isPdfMode={true}  language={language} />
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
      alert(t.alerts.pdfCreateEnvError);
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
      
      await html2pdf().from(iframe.contentWindow.document.body).set({
        margin: 0,
        filename: `${cvTitle || "cv"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      }).save();
    } catch (error) {
      console.error(t.alerts.pdfCreateError, error);
      alert(t.alerts.pdfCreateError);
    } finally {
      if (root) root.unmount();
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }
  };
  
  const renderCVPreview = () => {
    if (loading || !currentTemplate || !userData) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" size={48}/></div>;
    }
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) {
      return <div>{t.content.templateComponentNotFound(currentTemplate.title)}</div>;
    }
    
    // QUAN TRỌNG: Lấy sectionPositions với ưu tiên đúng
    // Ưu tiên: userData.sectionPositions (đã được update khi đổi template) > provider > template data > default
    // Nhưng phải đảm bảo sectionPositions khớp với template hiện tại
    let sectionPositions = 
      userData.sectionPositions || 
      getSectionPositions(currentTemplate._id) || 
      currentTemplate.data?.sectionPositions || 
      getDefaultSectionPositions(currentTemplate.title);
    
    // VALIDATION: Đảm bảo sectionPositions có đầy đủ các section của template hiện tại
    // Nếu thiếu, reset về default
    const defaultPositions = getDefaultSectionPositions(currentTemplate.title);
    const defaultSectionKeys = Object.keys(defaultPositions);
    const currentSectionKeys = Object.keys(sectionPositions);
    
    // Nếu sectionPositions thiếu hoặc thừa section so với default, reset về default
    if (defaultSectionKeys.length !== currentSectionKeys.length || 
        !defaultSectionKeys.every(key => currentSectionKeys.includes(key))) {
      console.warn("[renderCVPreview] sectionPositions không khớp với template, reset về default:", {
        templateTitle: currentTemplate.title,
        templateId: currentTemplate._id,
        defaultKeys: defaultSectionKeys,
        currentKeys: currentSectionKeys
      });
      sectionPositions = defaultPositions;
      // Update lại vào userData và provider
      updateUserData({ ...userData, sectionPositions: defaultPositions });
      updateSectionPositions(currentTemplate._id, defaultPositions);
    }
    
    const componentData = { 
      ...currentTemplate.data, 
      userData: userData,
      sectionPositions: sectionPositions,
      templateTitle: currentTemplate.title // Pass template title để template có thể validate
    };
    
    const containerWidth = 700;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    return (
      <div className=" max-w-[1050px] origin-top ">
        <div style={{
            width: `${templateOriginalWidth}px`,
            height: `${templateOriginalWidth * (297 / 210)}px`,
            transformOrigin: "top",
            transform: `scale(${scaleFactor})`,
          }}>
          <TemplateComponent
            data={componentData}
            onSectionClick={handleSectionClick}
            onLayoutChange={handleLayoutChange}
            scale={scaleFactor}
            language={language}
          />
        </div>
      </div>
    );
  };

  const handleBackClick = () => {
    if (isDirty) {
      setActivePopup("confirmLeave");
    } else {
      router.push("/myDocuments");
    }
  };

  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleSave = () => {
    setIsEditingTitle(false);
    setIsDirty(true);
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setCvTitle(e.target.value);

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
      <header className="bg-slate-900 text-white pt-20 pb-6 px-8 flex justify-between items-center z-20" style={{ backgroundColor: "#0b1b34" }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input type="text" value={cvTitle} onChange={handleTitleChange} onBlur={handleTitleSave} onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()} className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-white" autoFocus />
                <button onClick={handleTitleSave} className="text-blue-400 hover:text-blue-300">
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-300 transition-colors" onClick={handleTitleEdit} title={t.header.editTitleTooltip}>
                {cvTitle || t.header.defaultTitle}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={templateDropdownRef}>
              <button onClick={() => setShowTemplatePopup(!showTemplatePopup)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-semibold">
                {t.header.templates}
              </button>
              {showTemplatePopup && (
                <div className="absolute top-full mt-3 bg-white rounded-md shadow-lg z-20 p-4 w-[450px]" style={{ left: "-200%" }}>
                  <DropdownArrow />
                  <div className="grid grid-cols-3 gap-4">
                    {allTemplates.map((item) => (
                      <button key={item._id} onClick={() => handleTemplateSelect(item)} className="relative rounded-md overflow-hidden border-2 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group">
                        <div className="aspect-[210/297]"><Image src={item.imageUrl} alt={item.title} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105"/></div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">{item.title}</p>
                        {currentTemplate?._id === item._id && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-60 flex items-center justify-center"><CheckCircle2 size={32} className="text-white" /></div>
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
          <button onClick={handleBackClick} disabled={isSaving} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
            <ArrowLeft size={18} /> {t.header.goBack}
          </button>
          <button onClick={handleFinish} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <CheckCircle2 size={18} />}
            {isSaving ? t.header.saving : t.header.update}
          </button>
        </div>
      </header>
      <main className="flex-grow flex overflow-hidden">
        <aside className="w-72 bg-white p-6 border-r border-slate-200 overflow-y-auto">
          <button
            onClick={() => setShowLayoutPopup(true)}
            className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium mb-2"
          >
            <LayoutTemplate size={20} /> {t.sidebar.customLayout}
          </button>
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">{t.sidebar.title}</h2>
          <nav className="flex flex-col gap-1">
            {sidebarSections.map((section) => {
              let isInCV = !section.isHidden;
              if (currentTemplate) {
                const currentPositions =
                  userData.sectionPositions ||
                  getSectionPositions(currentTemplate._id) ||
                  currentTemplate.data?.sectionPositions ||
                  getDefaultSectionPositions(currentTemplate.title);

                const sectionPosition = currentPositions?.[section.id];
                isInCV = sectionPosition
                  ? sectionPosition.place !== 0
                  : !section.isHidden;
              }

              return (
                <button
                  key={section.id}
                  onClick={(e) => {
                    handleSectionClick(section.id, e);
                    setActiveSection(section.id);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-md font-medium text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  title={
                    isInCV
                      ? "Click để chỉnh sửa, click icon để ẩn khỏi CV"
                      : "Click để thêm vào CV"
                  }
                >
                  <span className="flex-1">{section.title}</span>
                  <span
                    className={`section-toggle-icon flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer ${
                      isInCV
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                    onClick={(e) => handleSectionClick(section.id, e)}
                  >
                    {isInCV ? (
                      <Minus size={14} strokeWidth={3} />
                    ) : (
                      <Plus size={14} strokeWidth={3} />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex-grow bg-slate-100 p-8 flex justify-center items-start overflow-y-auto">{renderCVPreview()}</div>
        <aside className="w-72 bg-white p-6 border-l border-slate-200 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <button onClick={handleDownloadPDF} className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <FileDown size={20} /> {t.aside.download}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Printer size={20} /> {t.aside.print}
            </button>
            {/* <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Mail size={20} /> {t.aside.email}
            </button> */}
          </div>
        </aside>
      </main>
      {jobDescription && jobDescription !== "" ? (
        <CVAIEditorPopupsManager activePopup={activePopup} onClose={() => setActivePopup(null)} userData={userData} handleDataUpdate={handleDataUpdate} isSaving={isSaving} onLeaveWithoutSaving={() => router.push("/myDocuments")} onSaveAndLeave={async () => { if (await handleSaveToDB()) router.push("/myDocuments"); }} />
      ) : (
        <CVEditorPopupsManager activePopup={activePopup} onClose={() => setActivePopup(null)} userData={userData} handleDataUpdate={handleDataUpdate} isSaving={isSaving} onLeaveWithoutSaving={() => router.push("/myDocuments")} onSaveAndLeave={async () => { if (await handleSaveToDB()) router.push("/myDocuments"); }} />
      )}

      {/* --- POPUP LAYOUT EDITOR --- */}
      {showLayoutPopup && currentTemplate && (() => {
        const currentPositions = 
          userData?.sectionPositions || 
          getSectionPositions(currentTemplate._id) || 
          currentTemplate.data?.sectionPositions || 
          getDefaultSectionPositions(currentTemplate.title); 
        
        return (
          <CVTemplateLayoutPopup
            currentPositions={currentPositions}
            defaultPositions={getDefaultSectionPositions(currentTemplate.title)}
            templateTitle={currentTemplate.title}
            onSave={(newPositions) => {
              updateSectionPositions(currentTemplate._id, newPositions);
              updateUserData({ ...userData, sectionPositions: newPositions });
              setShowLayoutPopup(false);
            }}
            onClose={() => setShowLayoutPopup(false)}
          />
        );
      })()}
    </div>
  );
};

export default PageUpdateCVContent;