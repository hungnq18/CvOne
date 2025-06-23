"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CV, getAllCVs, CVTemplate, getCVTemplates } from "@/api/cvapi";
import { Edit, Share2, Trash2 } from "lucide-react";
import { Card } from "antd";
import { templateComponentMap } from "@/components/cvTemplate/index";

const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleDateString("vi-VN");
};

const CardMyCV: React.FC<{}> = ({}) => {
  const [cvList, setCvList] = useState<CV[]>([]);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cvs, templates] = await Promise.all([
          getAllCVs(),
          getCVTemplates(),
        ]);
        setCvList(cvs);
        setTemplates(templates);
      } catch (err) {
        console.error("Lỗi khi gọi getAllCVs hoặc getAllTemplates:", err);
      }
    };
    fetchData();
  }, []);

  const containerWidth = 180;
  const templateOriginalWidth = 794;
  const scaleFactor = containerWidth / templateOriginalWidth;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {cvList.map((cv) => {
        const template = templates.find((t) => t._id === cv.cvTemplateId);
        const TemplateComponent = templateComponentMap?.[template?.title || ""];

        const formattedDate = new Date(cv.updatedAt).toLocaleDateString(
          "vi-VN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

        if (!TemplateComponent || !cv.content?.userData) return null;

        const componentData = {
          ...template?.data,
          userData: cv.content.userData,
        };

        return (
          <Card hoverable>
            <motion.div
              key={cv._id}
              className="bg-white rounded-xl overflow-hidden
            w-[350px] h-[260px]
            items-start"
              initial
            >
              <div
                className="bg-white overflow-hidden
            w-[350px] h-[260px] flex gap-4 items-start"
              >
                {/* Preview CV */}
                <div className="relative shrink-0 w-[180px] aspect-[210/297] bg-gray-100 border rounded-md overflow-hidden">
                  <div
                    className="absolute bg-white"
                    style={{
                      position: "absolute",
                      width: `${templateOriginalWidth}px`,
                      height: `${templateOriginalWidth * (297 / 210)}px`,
                      transformOrigin: "top left",
                      transform: `scale(${scaleFactor})`,
                      backgroundColor: "white",
                    }}
                  >
                    <div className="pointer-events-none ">
                      <TemplateComponent data={componentData} />
                    </div>
                  </div>
                </div>

                {/* Thông tin bên phải */}
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {cv.title || "CV chưa có tên"}
                      </h3>
                    </div>
                    <p className="text-sm text-blue-500 mt-1">
                      Edited {formatTimeAgo(cv.updatedAt)}
                    </p>

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>
                        Creation:{" "}
                        {new Date(cv.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      <p>Status: {cv.isFinalized ? "Final" : "Draft"}</p>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-3 flex flex-col gap-2">
                    <Link href={`/createCV?id=${cv.cvTemplateId}`}>
                      <button className="flex w-[90px] items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-blue-600">
                        <Edit size={16} /> Edit
                      </button>
                    </Link>
                    <div>
                      <button className="flex w-[90px] items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-red-600">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        );
      })}
    </div>
  );
};

export default CardMyCV;
