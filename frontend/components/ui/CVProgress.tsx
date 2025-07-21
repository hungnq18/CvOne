"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "antd";
import { FaUserEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import styles from "@/app/userDashboard/page.module.css";
import useAnimatedButtons from "@/app/userDashboard/page.modunle";
import { useLanguage } from "@/providers/global-provider";
import { CVTemplate, getCVTemplates } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";

const translations = {
  vi: {
    title: "Hồ sơ mới nhất",
    completed: "hoàn thành",
    update: "Cập nhật",
    create: "Tạo CV",
  },
  en: {
    title: "Latest profile",
    completed: "completed",
    update: "Update",
    create: "Create CV",
  },
};

interface ProfileProgressProps {
  cvId?: string;
  progress: number;
  cvImage?: string;
  cvTemplateId?: string;
  cvUserData?: any;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({
  cvId,
  progress,
  cvImage,
  cvTemplateId,
  cvUserData,
}) => {
  useAnimatedButtons();
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];

  const [templates, setTemplates] = useState<CVTemplate[]>([]);

  useEffect(() => {
    getCVTemplates().then(setTemplates);
  }, []);

  const handleCreateCV = () => {
    router.push("/cvTemplates");
  };

  const handleUpdateCV = () => {
    if (cvId) {
      router.push(`/updateCV?id=${cvId}`);
    }
  };

  // Find the template and render preview if possible
  let preview = null;
  if (cvTemplateId && cvUserData) {
    const template = templates.find((t) => t._id === cvTemplateId);
    const TemplateComponent = templateComponentMap?.[template?.title || ""];
    if (TemplateComponent) {
      const containerWidth = 240;
      const templateOriginalWidth = 794;
      const scaleFactor = containerWidth / templateOriginalWidth;
      const componentData = {
        ...template?.data,
        userData: cvUserData,
      };
      preview = (
        <div className="mt-4 flex justify-center">
          <div className="relative w-60 h-80 bg-gray-100 border rounded overflow-hidden">
            <div
              style={{
                width: `${templateOriginalWidth}px`,
                height: `${templateOriginalWidth * (297 / 210)}px`,
                transform: `scale(${scaleFactor})`,
                transformOrigin: "top left",
                background: "white",
                position: "absolute",
                top: 0,
                left: 0,
                
              }}
            >
              <div className="pointer-events-none ">
                <TemplateComponent data={componentData} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="top-22 left-13 w-[300px] z-30">
      <div className="bg-blue-100 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
        <div className="flex items-center mb-4">
          <FaUserEdit className="text-blue-600 text-lg mr-2" />
          <h2 className="text-xl font-semibold text-blue-600">{t.title}</h2>
        </div>

        {cvImage && (
          <div className="mt-4">
            <img
              src={cvImage}
              alt="CV preview"
              className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
            />
          </div>
        )}
        {preview}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className={`${styles["animated-button"]} flex-1`}
            onClick={handleUpdateCV}
          >
            <span className="block text-center text-sm leading-tight">
              {t.update}
            </span>
          </button>
          <button
            className={`${styles["animated-button"]} flex-1`}
            onClick={handleCreateCV}
          >
            <span className="block text-center text-sm leading-tight">
              {t.create}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileProgress;
