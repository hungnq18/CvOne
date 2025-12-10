"use client";

import {
  createCV,
  CV,
  CVTemplate,
  getCVById,
  getCVTemplateById,
  getCVTemplates,
  updateCV,
  translateCV,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { CVEditorPopupsManager } from "@/components/forms/CVEditorPopups";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useCV } from "@/providers/cv-provider";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Loader2,
  Mail,
  Printer,
  Minus,
  Plus,
  Languages,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
// BƯỚC 1: Import hook để lấy ngôn ngữ
import { useLanguage } from "@/providers/global_provider";
import CVTemplateLayoutPopup from "@/components/forms/CVTemplateLayoutPopup";
import { getDefaultSectionPositions } from "../cvTemplate/defaultSectionPositions";
import { notify } from "@/lib/notify";
import TranslateCVModal from "@/components/modals/TranslateCVModal";

// --- BƯỚC 2: TẠO ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    // Sidebar Sections
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
    templateComponentNotFound: (title: string) =>
      `Component for "${title}" not found.`,

    // Actions
    download: "Download",
    print: "Print CV",
    email: "Email",

    // Alerts & Messages
    errorDecodingToken: "Error decoding token:",
    noDataToSave: "No data or CV template to save.",
    cvDataEmpty: "CV data is empty, cannot save.",
    saveSuccess: "CV saved successfully!",
    saveError: "An error occurred while saving your CV.",
    pdfCreateEnvError: "Cannot create environment to export PDF.",
    pdfCreateError: "An error occurred while exporting the PDF file.",
    translate: "Translate CV",
    translateSuccess: "CV translated successfully!",
    translateError: "An error occurred while translating your CV.",

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
    certification: "Chứng chỉ",
    achievement: "Thành tựu",
    hobby: "Sở thích",
    project: "Dự án",
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
    templateComponentNotFound: (title: string) =>
      `Không tìm thấy component cho "${title}".`,

    // Actions
    download: "Tải về",
    print: "In CV",
    email: "Email",

    // Alerts & Messages
    errorDecodingToken: "Lỗi giải mã token:",
    noDataToSave: "Chưa có dữ liệu hoặc mẫu CV để lưu.",
    cvDataEmpty: "Dữ liệu CV trống, không thể lưu.",
    saveSuccess: "Lưu CV thành công!",
    saveError: "Có lỗi xảy ra khi lưu CV của bạn.",
    pdfCreateEnvError: "Không thể tạo môi trường để xuất PDF.",
    pdfCreateError: "Đã có lỗi xảy ra khi xuất file PDF.",
    translate: "Dịch CV",
    translateSuccess: "Dịch CV thành công!",
    translateError: "Có lỗi xảy ra khi dịch CV của bạn.",

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

const PageCreateCVContent = () => {
  // BƯỚC 3: SỬ DỤNG HOOK VÀ LẤY ĐÚNG BỘ TỪ ĐIỂN
  const { language } = useLanguage();
  const t = translations[language];

  // BƯỚC 4: TẠO MẢNG sidebarSections ĐỘNG
  const sidebarSections = [
    { id: "info", title: t.personalInfo, isHidden: false },
    { id: "contact", title: t.contact, isHidden: false },
    { id: "summary", title: t.careerObjective, isHidden: false },
    { id: "experience", title: t.workExperience, isHidden: false },
    { id: "education", title: t.education, isHidden: false },
    { id: "skills", title: t.skills, isHidden: false },
    { id: "certification", title: t.certification, isHidden: true },
    { id: "achievement", title: t.achievement, isHidden: true },
    { id: "hobby", title: t.hobby, isHidden: true },
    { id: "Project", title: t.project, isHidden: true },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const {
    currentTemplate,
    userData,
    loadTemplate,
    updateUserData,
    getSectionPositions,
    updateSectionPositions,
  } = useCV();

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
  const [cvUiTexts, setCvUiTexts] = useState<any>(null);

  const templateDropdownRef = useRef(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [showLayoutPopup, setShowLayoutPopup] = useState(false);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));

  useEffect(() => {
    getCVTemplates().then((data) => setAllTemplates(data));
    const idFromUrl = id;

    if (idFromUrl) {
      setLoading(true);
      // First try to get as CV ID (for update flow)
      getCVById(idFromUrl)
        .then((templateData) => {
          if (templateData) {
            loadTemplate(templateData);
            if (templateData.title) {
              setCvTitle(templateData.title);
            }
            if (
              (!userData || Object.keys(userData).length === 0) &&
              templateData.content?.userData
            ) {
              updateUserData(templateData.content.userData);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          setCvId(null);
          getCVTemplateById(idFromUrl)
            .then((templateData) => {
              if (templateData) {
                loadTemplate(templateData);
                if (
                  (!userData || Object.keys(userData).length === 0) &&
                  templateData.data?.userData
                ) {
                  updateUserData(templateData.data.userData);
                }
                setCvTitle(t.cvTitleDefault(templateData.title));
              } else {
                console.error(
                  "[CreateCV] Template not found with ID:",
                  idFromUrl
                );
              }
              setLoading(false);
            })
            .catch((templateError) => {
              console.error(
                "[CreateCV] Error loading template:",
                templateError
              );
              setLoading(false);
            });
        });
    } else {
      setLoading(false);
    }
  }, [id, loadTemplate, updateUserData, userData, t]);

  const handleTemplateSelect = async (selectedTemplate: CVTemplate) => {
    setShowTemplatePopup(false);
    if (currentTemplate?._id === selectedTemplate._id) return;

    try {
      setLoading(true);
      const newTemplateData = await getCVTemplateById(selectedTemplate._id);

      if (newTemplateData) {
        loadTemplate(newTemplateData);
        const correctPositions =
          newTemplateData.data?.sectionPositions ||
          getDefaultSectionPositions(newTemplateData.title);

        updateSectionPositions(selectedTemplate._id, correctPositions);

        const templateUserData =
          newTemplateData.data?.userData &&
          Object.keys(newTemplateData.data.userData).length > 0
            ? newTemplateData.data.userData
            : userData || {};

        const newUserData = {
          ...templateUserData,
          sectionPositions: correctPositions,
        };

        updateUserData(newUserData);
        setCvTitle(t.cvTitleDefault(newTemplateData.title));
        setIsDirty(true);
        router.push(`/createCV?id=${selectedTemplate._id}`, { scroll: false });
      }
    } catch (error) {
      console.error("[handleTemplateSelect] Failed to change template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = (updatedData: any) => {
    updateUserData(updatedData);
    setIsDirty(true);
  };

  // --- HÀM XỬ LÝ KHI KÉO THẢ TRÊN TEMPLATE ---
  const handleLayoutChange = (newPositions: any) => {
    if (currentTemplate) {
      updateSectionPositions(currentTemplate._id, newPositions);
      setIsDirty(true); // Đánh dấu là đã thay đổi để hiện popup xác nhận khi thoát
    }
  };

  const calculatePlaceAndOrder = (
    sectionId: string,
    currentPositions: any,
    templateTitle: string
  ) => {
    // Lấy default positions của template
    const defaultPositions = getDefaultSectionPositions(templateTitle);

    // Lấy vị trí mặc định của section từ defaultPositions
    const defaultSectionPos = defaultPositions[sectionId];
    if (!defaultSectionPos || defaultSectionPos.place === 0) {
      // Nếu không có trong default hoặc bị ẩn, dùng logic fallback
      const isMinimalist1 =
        templateTitle === "The Vanguard" || templateTitle?.includes("Vanguard");
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
        .sort(
          ([, a]: [string, any], [, b]: [string, any]) => a.order - b.order
        );

      if (targetPlaceSections.length > 0) {
        const lastOrder = (
          targetPlaceSections[targetPlaceSections.length - 1][1] as any
        ).order;
        return { place: targetPlace, order: lastOrder + 1 };
      }

      return { place: targetPlace, order: 0 };
    }

    // Sử dụng vị trí mặc định từ defaultPositions
    const targetPlace = defaultSectionPos.place;
    const targetOrder = defaultSectionPos.order;

    // Tìm tất cả các section trong cùng place và có order >= targetOrder
    const sectionsToShift = Object.entries(currentPositions)
      .filter(([key, pos]: [string, any]) => {
        return (
          key !== sectionId &&
          pos.place === targetPlace &&
          pos.order >= targetOrder
        );
      })
      .sort(([, a]: [string, any], [, b]: [string, any]) => a.order - b.order);

    // Đẩy các section khác xuống (tăng order lên 1)
    sectionsToShift.forEach(([key]) => {
      currentPositions[key] = {
        ...currentPositions[key],
        order: currentPositions[key].order + 1,
      };
    });

    return { place: targetPlace, order: targetOrder };
  };

  const handleSectionClick = (sectionId: string, event?: React.MouseEvent) => {
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
        // Thêm vào CV - tạo bản copy để tránh modify trực tiếp
        const positionsCopy = { ...currentPositions };
        const { place, order } = calculatePlaceAndOrder(
          sectionId,
          positionsCopy,
          currentTemplate.title
        );
        // Sử dụng positionsCopy đã được update bởi calculatePlaceAndOrder
        const newPositions = {
          ...positionsCopy,
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
      notify.error(t.noDataToSave);
      return false;
    }
    if (Object.keys(userData).length === 0) {
      notify.error(t.cvDataEmpty);
      return false;
    }

    setIsSaving(true);
    try {
      // Get sectionPositions from provider
      const sectionPositions =
        getSectionPositions(currentTemplate._id) ||
        currentTemplate.data?.sectionPositions ||
        getDefaultSectionPositions(currentTemplate.title);

      // Prepare complete userData with all fields inside userData object
      // Extract all fields that should be in userData, removing any duplicates
      const completeUserData = {
        // Basic user info
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        professional: userData.professional || "",
        city: userData.city || "",
        country: userData.country || "",
        province: userData.province || "",
        phone: userData.phone || "",
        email: userData.email || "",
        avatar: userData.avatar || "",
        summary: userData.summary || "",
        skills: userData.skills || [],
        workHistory: userData.workHistory || [],
        education: userData.education || [],
        // All additional fields MUST be inside userData
        careerObjective: userData.careerObjective || "",
        Project: userData.Project || [],
        certification: userData.certification || [],
        achievement: userData.achievement || [],
        hobby: userData.hobby || [],
        sectionPositions: sectionPositions,
      };

      // Ensure content ONLY contains userData, nothing else
      const contentData: any = {
        userData: completeUserData,
      };

      // Nếu có cvUiTexts, thêm vào (không nằm trong userData)
      if (cvUiTexts) {
        contentData.uiTexts = cvUiTexts;
      }

      if (cvId) {
        const dataToUpdate: Partial<CV> = {
          content: contentData,
          title: cvTitle || t.cvForUser(userData.firstName),
          updatedAt: new Date().toISOString(),
        };

        await updateCV(cvId, dataToUpdate);
      } else {
        const dataToCreate: Omit<CV, "_id"> = {
          userId: userId || "",
          title:
            cvTitle ||
            t.cvForUser(`${userData.firstName} ${userData.lastName}`),
          content: contentData,
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
          router.replace(`/createCV?id=${newCV.id}`, { scroll: false });
        }
      }
      notify.success(t.saveSuccess);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error(t.saveError, error);
      notify.error(t.saveError);
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

  const handleTranslateCV = async (targetLanguage: string) => {
    if (!userData || !currentTemplate) {
      notify.error(t.noDataToSave);
      return;
    }
    setIsTranslating(true);
    try {
      const defaultLabels =
        language === "vi"
          ? {
              personalInformation: "Thông tin cá nhân",
              contact: "Liên hệ",
              careerObjective: "Mục tiêu sự nghiệp",
              workExperience: "Kinh nghiệm làm việc",
              education: "Học vấn",
              skills: "Kỹ năng",
              certification: "Chứng chỉ",
              achievement: "Thành tựu",
              hobby: "Sở thích",
              project: "Dự án",
              phone: "Điện thoại:",
              email: "Email:",
              address: "Địa chỉ:",
              dateOfBirth: "Ngày sinh:",
              gender: "Giới tính:",
              avatar: "Ảnh đại diện",
              fullNameAndTitle: "Họ tên & Chức danh",
            }
          : {
              personalInformation: "Personal Information",
              contact: "Contact",
              careerObjective: "Career Objective",
              workExperience: "Work Experience",
              education: "Education",
              skills: "Skills",
              certification: "Certification",
              achievement: "Achievement",
              hobby: "Hobby",
              project: "Project",
              phone: "Phone:",
              email: "Email:",
              address: "Address:",
              dateOfBirth: "Date of Birth:",
              gender: "Gender:",
              avatar: "Avatar",
              fullNameAndTitle: "Full Name & Title",
            };

      const currentUiTexts = cvUiTexts || defaultLabels;

      const translatedData = await translateCV(
        userData,
        targetLanguage,
        currentUiTexts
      );

      const nextUserData =
        translatedData?.data?.data?.content?.userData ??
        translatedData?.data?.content?.userData;
      const nextUiTexts =
        translatedData?.data?.data?.uiTexts ??
        translatedData?.data?.uiTexts;

      if (nextUserData) {
        updateUserData(nextUserData);
        setIsDirty(true);

        if (nextUiTexts) {
          const mergedUiTexts = {
            ...(currentUiTexts || {}),
            ...nextUiTexts,
          };
          setCvUiTexts(mergedUiTexts);
        } else if (currentUiTexts) {
          setCvUiTexts(currentUiTexts);
        }

        setShowTranslateModal(false);
        notify.success(t.translateSuccess);
      } else {
        notify.error(t.translateError);
      }
    } catch (error) {
      notify.error(t.translateError);
    } finally {
      setIsTranslating(false);
    }
  };

  const renderCVForPDF = () => {
    if (!currentTemplate || !userData) return null;
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) return null;

    const sectionPositions =
      getSectionPositions(currentTemplate._id) ||
      currentTemplate.data?.sectionPositions ||
      getDefaultSectionPositions(currentTemplate.title);

    const componentData = {
      ...currentTemplate.data,
      userData: userData,
      sectionPositions,
    };

    const fontBase64 =
      "data:font/woff2;base64,d09GMgABAAAAA... (thay bằng chuỗi Base64 thật của font bạn dùng)";
    const fontName = "CVFont";

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
          <TemplateComponent
            data={componentData}
            isPdfMode={true}
            language={language}
            cvUiTexts={cvUiTexts}
          />
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "794px";
    iframe.style.height = "1123px";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      notify.error(t.pdfCreateEnvError);
      document.body.removeChild(iframe);
      return;
    }

    const head = iframeDoc.head;
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => {
        head.appendChild(node.cloneNode(true));
      });

    const mountNode = iframeDoc.createElement("div");
    iframeDoc.body.appendChild(mountNode);

    let root: any = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const { createRoot } = await import("react-dom/client");
      root = createRoot(mountNode);
      root.render(renderCVForPDF());

      await new Promise((resolve) => setTimeout(resolve, 500));

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(iframe.contentWindow.document.body, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.tracking-wider');
            elements.forEach((el) => {
                (el as HTMLElement).style.letterSpacing = 'normal';
            });
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`${cvTitle || "cv"}.pdf`);
    } catch (error) {
      console.error(t.pdfCreateError, error);
      notify.error(t.pdfCreateError);
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
    const sectionPositions =
      getSectionPositions(currentTemplate._id) ||
      currentTemplate.data?.sectionPositions ||
      getDefaultSectionPositions(currentTemplate.title);

    const componentData = {
      ...currentTemplate.data,
      userData: userData,
      sectionPositions,
    };

    const containerWidth = 700;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    return (
      <div className="max-w-[1050px] origin-top pb-24" ref={previewRef}>
        <div
          style={{
            width: `${templateOriginalWidth}px`,
            height: `${templateOriginalWidth * (297 / 210)}px`,
            transformOrigin: "top",
            transform: `scale(${scaleFactor})`,
          }}
        >
          {/* BƯỚC QUAN TRỌNG: Truyền scaleFactor vào component con */}
          <TemplateComponent
            data={componentData}
            onSectionClick={handleSectionClick}
            onLayoutChange={handleLayoutChange}
            language={language}
            scale={scaleFactor}
            cvUiTexts={cvUiTexts}
          />
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

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
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
                  onKeyPress={(e) => e.key === "Enter" && handleTitleSave()}
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
                {cvTitle ||
                  (currentTemplate
                    ? t.cvTitleDefault(currentTemplate.title)
                    : t.editCv)}
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
                  style={{ left: "-200%" }}
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
                        <div className="aspect-[210/297] relative bg-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                            onError={(e) => {
                              // Fallback khi image lỗi (đặc biệt cho Cốc Cốc)
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200';
                                fallback.innerHTML = `<span class="text-gray-400 text-xs text-center px-2">${item.title}</span>`;
                                parent.appendChild(fallback);
                              }
                            }}
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
          <button
            onClick={() => setShowLayoutPopup(true)}
            className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
          >
            ⚙️ Tùy chỉnh bố cục
          </button>
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">
            {t.cvSections}
          </h2>
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
                  className={`w-full flex items-center gap-3 p-3 rounded-md font-medium text-left transition-colors
                    ${
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
            <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Printer size={20} /> {t.print}
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
              onClick={() => setShowTranslateModal(true)}
            >
              <Languages size={20} /> {t.translate}
            </button>
            {/* <button className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
              <Mail size={20} /> {t.email}
            </button> */}
          </div>
        </aside>
      </main>

      <TranslateCVModal
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        onTranslate={handleTranslateCV}
        isTranslating={isTranslating}
      />

      <CVEditorPopupsManager
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
      {showLayoutPopup && currentTemplate && (
        <CVTemplateLayoutPopup
          currentPositions={getSectionPositions(currentTemplate._id)}
          defaultPositions={getDefaultSectionPositions(currentTemplate.title)}
          templateTitle={currentTemplate.title}
          onSave={(newPositions) => {
            updateSectionPositions(currentTemplate._id, newPositions);
            setShowLayoutPopup(false);
          }}
          onClose={() => setShowLayoutPopup(false)}
        />
      )}
    </div>
  );
};

export default PageCreateCVContent;
