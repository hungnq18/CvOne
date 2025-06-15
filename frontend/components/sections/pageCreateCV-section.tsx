"use client";

import { CVTemplate, getCVTemplateById } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PageCreateCVSection = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [template, setTemplate] = useState<CVTemplate | null>(null);

  useEffect(() => {
    if (id) {
      getCVTemplateById(id).then((data) => {
        if (data) setTemplate(data);
      });
    }
  }, [id]);

  if (!template) return <p>Loading...</p>;

  // Dùng title để lấy component phù hợp
  const TemplateComponent = templateComponentMap[template.title];

  if (!TemplateComponent)
    return <div>Không tìm thấy template phù hợp cho "{template.title}".</div>;
  return (
    <div>
      <div className="cv-a4">
        <TemplateComponent data={template.data} />
      </div>
      <style jsx>{`
        .cv-a4 {
          margin-top: 100px;
          align-items: center;
          justify-content: center;
          width: 1050px;
          height: 1480px;
          transform: scale(0.8)
          /* ... các style khác và transform: scale(0.7) */
        }
      `}</style>
    </div>
  );
};

export default PageCreateCVSection;
