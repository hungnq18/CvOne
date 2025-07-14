"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, FC } from "react";
import {
  getCVTemplateById,
  getCVTemplates,
  getCVById,
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
  X,
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


const PageUpdateCVContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cvId = searchParams.get("id"); 
  const { currentTemplate, userData, loadTemplate, updateUserData } = useCV();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvData, setCvData] = useState<CV | null>(null);
  const [cvTitle, setCvTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const templateDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);

  useOnClickOutside(templateDropdownRef, () => setShowTemplatePopup(false));
  useOnClickOutside(colorDropdownRef, () => setShowColorPopup(false));

  useEffect(() => {
    const loadCVDataAndTemplate = async (id: string) => {
      try {
        const cv = await getCVById(id);
        if (!cv) throw new Error("Không tìm thấy CV với ID này.");
        
        setCvData(cv);
        setCvTitle(cv.title || "Untitled CV");
        
        if (!cv.cvTemplateId) throw new Error("CV không có template ID.");
        
        const template = await getCVTemplateById(cv.cvTemplateId);
        if (!template) throw new Error("Không tìm thấy template CV.");
        
        loadTemplate(template);
        
        if (cv.content?.userData) {
          updateUserData(cv.content.userData);
        }
      } catch (error) {
        console.error("Lỗi khi load CV data:", error);
        alert(error instanceof Error ? error.message : "Không thể tải CV.");
        router.push("/myDocuments");
      }
    };

    getCVTemplates().then(setAllTemplates);
    
    if (cvId) {
      setLoading(true);
      loadCVDataAndTemplate(cvId).finally(() => setLoading(false));
    } else {
      alert("Không tìm thấy ID CV.");
      router.push("/myDocuments");
    }
  }, [cvId, loadTemplate, updateUserData, router]);

  const handleTemplateSelect = async (selectedTemplate: CVTemplate) => {
    setShowTemplatePopup(false); 

    if (currentTemplate?._id === selectedTemplate._id) {
      return;
    }

    try {
      setLoading(true); 
      const newTemplateData = await getCVTemplateById(selectedTemplate._id);
      
      if (newTemplateData) {
        loadTemplate(newTemplateData);
        setIsDirty(true); 
      } else {
        throw new Error("Không thể tải dữ liệu template mới.");
      }
    } catch (error) {
      console.error("Lỗi khi đổi template:", error);
      alert("Có lỗi xảy ra khi đổi template.");
    } finally {
      setLoading(false); 
    }
  };

  const handleDataUpdate = (updatedData: any) => {
    updateUserData(updatedData);
    setIsDirty(true);
  };

  const handleSaveToDB = async (): Promise<boolean> => {
    if (!userData || !cvId || !currentTemplate) { 
      alert("Chưa có dữ liệu, ID CV hoặc mẫu CV để cập nhật.");
      return false;
    }

    setIsSaving(true);
    try {
      const dataToUpdate: Partial<CV> = {
        content: { userData },
        title: cvTitle,
        updatedAt: new Date().toISOString(),
        cvTemplateId: currentTemplate._id, 
      };
      
      await updateCV(cvId, dataToUpdate);
      alert("Cập nhật CV thành công!");
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật CV:", error);
      alert("Có lỗi xảy ra khi cập nhật CV của bạn.");
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
  
  // [SỬA LỖI] Đã loại bỏ CVProvider không cần thiết và gây lỗi.
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
           <TemplateComponent data={componentData} isPdfMode={true} />
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
      alert("Không thể tạo môi trường để xuất PDF.");
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
      console.error("Lỗi khi tạo PDF:", error);
      alert("Có lỗi xảy ra khi xuất file PDF.");
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
      return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" size={48}/></div>;
    }
    const TemplateComponent = templateComponentMap?.[currentTemplate.title];
    if (!TemplateComponent) {
      return <div>Không tìm thấy component cho "{currentTemplate.title}".</div>;
    }
    const componentData = { ...currentTemplate.data, userData: userData };
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
          <TemplateComponent data={componentData} onSectionClick={handleSectionClick}/>
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
                <button onClick={handleTitleSave} className="text-blue-400 hover:text-blue-300">
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <h1 
                className="text-2xl font-bold cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleTitleEdit}
                title="Click để chỉnh sửa tiêu đề"
              >
                {cvTitle || "Cập nhật CV"}
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
                <div className="absolute top-full mt-3 bg-white rounded-md shadow-lg" style={{ left: "-7%" }}>
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
                        key={item._id}
                        onClick={() => handleTemplateSelect(item)}
                        className="relative rounded-md overflow-hidden border-2 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                      >
                        <div className="aspect-[210/297]">
                          <Image src={item.imageUrl} alt={item.title} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105"/>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">{item.title}</p>
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
          <button onClick={handleBackClick} disabled={isSaving} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
            <ArrowLeft size={18} /> Quay Lại
          </button>
          <button onClick={handleFinish} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <CheckCircle2 size={18} />}
            {isSaving ? "Đang cập nhật..." : "Cập nhật CV"}
          </button>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        <aside className="w-72 bg-white p-6 border-r border-slate-200 overflow-y-auto">
          <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">CÁC MỤC CỦA CV</h2>
          <nav className="flex flex-col gap-1">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setActivePopup(section.id); }}
                className={`w-full flex items-center gap-3 p-3 rounded-md font-medium text-left transition-colors ${activeSection === section.id ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
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
            <button onClick={handleDownloadPDF} className="w-full flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-slate-100 font-medium">
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
        onLeaveWithoutSaving={() => router.push("/myDocuments")}
        onSaveAndLeave={async () => {
          if (await handleSaveToDB()) router.push("/myDocuments");
        }}
      />
    </div>
  );
};

export default PageUpdateCVContent;