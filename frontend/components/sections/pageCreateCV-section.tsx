"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import {
  getCVTemplateById,
  getCVTemplates,
  getCVById,
  createCV,
  updateCV,
  CVTemplate,
  CV,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import {
  FileDown,
  Printer,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useCV } from "@/providers/cv-provider";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { jwtDecode } from "jwt-decode";
import { CVEditorPopupsManager } from "@/components/forms/CVEditorPopups";

// --- INTERFACES & TYPES ---
interface DecodedToken {
  sub: string;
  role: string;
}

const DropdownArrow = () => (
  <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white" />
);

const sidebarSections = [
  { id: "info", title: "Thông tin cá nhân" },
  { id: "contact", title: "Liên hệ" },
  { id: "summary", title: "Mục tiêu sự nghiệp" },
  { id: "experience", title: "Kinh nghiệm làm việc" },
  { id: "education", title: "Học vấn" },
  { id: "skills", title: "Kỹ năng" },
];


const PageCreateCVContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const { currentTemplate, userData, loadTemplate, updateUserData } = useCV();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [cvId, setCvId] = useState<string | null>(id);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvTitle, setCvTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const templateDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));
  useOnClickOutside(colorDropdownRef, () => setShowColorPopup(false));

  useEffect(() => {
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
            // Ưu tiên userData từ context, nếu không có thì mới lấy từ DB
            if ((!userData || Object.keys(userData).length === 0) && templateData.content?.userData) {
              updateUserData(templateData.content.userData);
            }
          }
          setLoading(false);
        })
        .catch(() => {
          console.log("Đang tải template để tạo mới...");
          setCvId(null);
          getCVTemplateById(idFromUrl).then((templateData) => {
            if (templateData) {
              loadTemplate(templateData);
              // Ưu tiên userData từ context, nếu không có thì mới lấy từ DB
              if ((!userData || Object.keys(userData).length === 0) && templateData.data?.userData) {
                updateUserData(templateData.data.userData);
              }
              setCvTitle(`CV - ${templateData.title}`);
            }
            setLoading(false);
          });
        });
    } else {
      setLoading(false);
    }
  }, [id, loadTemplate, updateUserData, userData]);

  const handleTemplateSelect = (selectedTemplate: CVTemplate) => {
    router.push(
      `/createCV?id=${selectedTemplate._id}`
    );
    setCvTitle(`CV - ${selectedTemplate.title}`);
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

    setIsSaving(true);
    try {
      if (cvId) {
        const dataToUpdate: Partial<CV> = {
          content: { userData },
          title: cvTitle || `CV for ${userData.firstName || "Untitled"}`,
          updatedAt: new Date().toISOString(),
        };
        await updateCV(cvId, dataToUpdate);
      } else {
        const dataToCreate: Omit<CV, "_id"> = {
          userId: userId || "", 
          title: cvTitle || `CV for ${userData.firstName} ${userData.lastName}`,
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
          router.replace(`/createCV?id=${newCV.id}`, { scroll: false });
        }
      }
      alert("Lưu CV thành công!");
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu CV:", error);
      alert("Có lỗi xảy ra khi lưu CV của bạn.");
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

    // LƯU Ý: Bạn vẫn cần lấy chuỗi Base64 của font chữ mà bạn đang dùng và thay vào đây.
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
             <TemplateComponent data={componentData} isPdfMode={true} />
        </div>
      </div>
    );
  };

  // HÀM TẠO PDF PHIÊN BẢN CUỐI CÙNG, SỬ DỤNG IFRAME
  const handleDownloadPDF = async () => {
    // 1. Tạo một iframe ẩn để tạo môi trường render biệt lập
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '794px';
    iframe.style.height = '1123px'; // Tỷ lệ A4
    iframe.style.left = '-9999px'; // Đẩy ra ngoài màn hình
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert("Không thể tạo môi trường để xuất PDF.");
      document.body.removeChild(iframe);
      return;
    }
    
    // 2. Sao chép tất cả các file CSS từ trang chính vào iframe
    const head = iframeDoc.head;
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
        head.appendChild(node.cloneNode(true));
    });

    // 3. Tạo một div root bên trong iframe để React render vào
    const mountNode = iframeDoc.createElement('div');
    iframeDoc.body.appendChild(mountNode);

    let root: any = null;
    
    try {
      // Đợi một chút để CSS trong iframe được áp dụng
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. Render component vào root của iframe bằng API của React 18
      const { createRoot } = await import('react-dom/client');
      root = createRoot(mountNode);
      root.render(renderCVForPDF());
      
      // Đợi thêm một chút cho React render và các tài nguyên (ảnh) tải xong
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const html2pdf = (await import("html2pdf.js"))?.default || (await import("html2pdf.js"));
      
      // 5. Xuất PDF từ body của iframe
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
      console.error("Lỗi khi tạo PDF:", error);
      alert("Đã có lỗi xảy ra khi xuất file PDF.");
    } finally {
      // 6. Luôn dọn dẹp iframe sau khi xong việc để tránh rò rỉ bộ nhớ
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
                title="Click để chỉnh sửa tiêu đề"
              >
                {cvTitle || (currentTemplate ? currentTemplate.title : "Chỉnh Sửa CV")}
              </h1>
            )}
          </div>
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
            <ArrowLeft size={18} /> Quay Lại
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
            {isSaving ? "Đang lưu..." : "Hoàn Thành"}{" "}
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
            <button
              className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
              onClick={handleDownloadPDF}
            >
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
    </div>
  );
};

export default PageCreateCVContent;