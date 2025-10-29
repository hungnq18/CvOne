"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSharedCV, getCVTemplateById } from '@/api/cvapi';
import { templateComponentMap } from '@/components/cvTemplate/index';
import { Loader2 } from 'lucide-react';

// Dynamic import để tránh lỗi hydration
const CVShareSection = dynamic(() => import('@/components/sections/share-cv-section'), {
  ssr: false,
});

export default function ShareCVPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("CV ID is missing");
      setIsLoading(false);
      return;
    }

    const loadSharedCV = async () => {
      try {
        setIsLoading(true);
        const data = await getSharedCV(id);
        // Expect data shape { _id, title, content: { userData }, cvTemplateId }
        let cvTemplate = (data as any).cvTemplate;
        if (!cvTemplate && (data as any).cvTemplateId) {
          try {
            cvTemplate = await getCVTemplateById((data as any).cvTemplateId);
          } catch {}
        }
        const normalized = { ...data, cvTemplate };
        console.log("Loaded shared CV (normalized):", normalized);
        setCvData(normalized);
      } catch (err) {
        console.error("Error loading shared CV:", err);
        setError("Failed to load CV. Please check if the link is valid.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedCV();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!cvData || !cvData.content?.userData) {
      alert("CV data is not available");
      return;
    }

    try {
      const component = templateComponentMap?.[cvData.cvTemplate?.title || 'modern1'];
      
      if (!component) {
        alert("Template not found");
        return;
      }

      // Tạo iframe để render CV
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "794px";
      iframe.style.height = "1123px";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        alert("Cannot create environment to export PDF.");
        document.body.removeChild(iframe);
        return;
      }

      const head = iframeDoc.head;
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        head.appendChild(node.cloneNode(true));
      });

      const mountNode = iframeDoc.createElement("div");
      iframeDoc.body.appendChild(mountNode);

      let root: any = null;

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const { createRoot } = await import("react-dom/client");
        root = createRoot(mountNode);
        
        const componentData = {
          ...(cvData.cvTemplate?.data || {}),
          userData: cvData.content.userData,
        };

        const TemplateComponent = component;
        root.render(
          <TemplateComponent 
            data={componentData} 
            isPdfMode={true} 
          />
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        const html2pdf = (await import("html2pdf.js"))?.default || (await import("html2pdf.js"));

        await html2pdf()
          .from(iframe.contentWindow.document.body)
          .set({
            margin: 0,
            filename: `${cvData.title || "cv"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
          })
          .save();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while exporting the PDF file.");
      } finally {
        if (root) {
          root.unmount();
        }
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }
    } catch (err) {
      console.error("Error in download:", err);
      alert("Failed to generate PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-slate-500">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">No CV data available</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <CVShareSection
        userData={cvData.content?.userData}
        cvTitle={cvData.title}
        cvTemplate={cvData.cvTemplate}
        onDownloadPDF={handleDownloadPDF}
        isLoading={false}
      />
    </main>
  );
}

