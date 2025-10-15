"use client";

import {
    CV,
    CVTemplate,
    deleteCV,
    getAllCVs,
    getCVTemplates,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useLanguage } from "@/providers/global_provider";
import { Card } from "antd";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    cardMyCV: {
      timeAgo: {
        seconds: (s: number) => `${s} second${s > 1 ? "s" : ""} ago`,
        minutes: (m: number) => `${m} minute${m > 1 ? "s" : ""} ago`,
        hours: (h: number) => `${h} hour${h > 1 ? "s" : ""} ago`,
      },
      deleteDialog: {
        confirm: (title: string) =>
          `Are you sure you want to delete the CV "${title}"? This action cannot be undone.`,
        success: "CV deleted successfully!",
        error: "An error occurred while deleting the CV. Please try again.",
      },
      errors: {
        fetch: "Error fetching CVs or templates:",
        delete: "Error deleting CV:",
      },
      emptyState: {
        title: "No CVs yet",
        subtitle: "Create your first CV to get started",
      },
      card: {
        unnamed: "Unnamed CV",
        edited: "Edited",
        creation: "Creation:",
        status: "Status:",
        statusFinal: "Final",
        statusDraft: "Draft",
      },
      buttons: {
        edit: "Edit",
        deleteTooltip: "Delete this CV",
        deleting: "Deleting...",
        delete: "Delete",
      },
    },
  },
  vi: {
    cardMyCV: {
      timeAgo: {
        seconds: (s: number) => `${s} giây trước`,
        minutes: (m: number) => `${m} phút trước`,
        hours: (h: number) => `${h} giờ trước`,
      },
      deleteDialog: {
        confirm: (title: string) =>
          `Bạn có chắc chắn muốn xóa CV "${title}"? Hành động này không thể hoàn tác.`,
        success: "Xóa CV thành công!",
        error: "Có lỗi xảy ra khi xóa CV. Vui lòng thử lại.",
      },
      errors: {
        fetch: "Lỗi khi gọi getAllCVs hoặc getAllTemplates:",
        delete: "Lỗi khi xóa CV:",
      },
      emptyState: {
        title: "Chưa có CV nào",
        subtitle: "Tạo CV đầu tiên của bạn để bắt đầu",
      },
      card: {
        unnamed: "CV chưa có tên",
        edited: "Đã chỉnh sửa",
        creation: "Ngày tạo:",
        status: "Trạng thái:",
        statusFinal: "Hoàn tất",
        statusDraft: "Bản nháp",
      },
      buttons: {
        edit: "Chỉnh sửa",
        deleteTooltip: "Xóa CV này",
        deleting: "Đang xóa...",
        delete: "Xóa",
      },
    },
  },
};

const formatTimeAgo = (
  isoDate: string,
  t_timeAgo: typeof translations.vi.cardMyCV.timeAgo,
  locale: string
) => {
  const date = new Date(isoDate);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return t_timeAgo.seconds(diff);
  if (diff < 3600) return t_timeAgo.minutes(Math.floor(diff / 60));
  if (diff < 86400) return t_timeAgo.hours(Math.floor(diff / 3600));
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
};

const CardMyCV: React.FC<{}> = ({}) => {
  const { language } = useLanguage();
  const t = translations[language].cardMyCV;

  const [cvList, setCvList] = useState<CV[]>([]);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [deletingCVId, setDeletingCVId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [cvs, templatesData] = await Promise.all([
        getAllCVs(),
        getCVTemplates(),
      ]);
      setCvList(cvs);
      setTemplates(templatesData);
    } catch (err) {
      console.error(t.errors.fetch, err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerWidth = 180;
  const templateOriginalWidth = 794;
  const scaleFactor = containerWidth / templateOriginalWidth;

  const handleDeleteCV = async (cvId: string, cvTitle: string) => {
    const isConfirmed = window.confirm(t.deleteDialog.confirm(cvTitle));

    if (!isConfirmed) return;

    try {
      setDeletingCVId(cvId);
      await deleteCV(cvId);

      setCvList((prevList) => prevList.filter((cv) => cv._id !== cvId));

      alert(t.deleteDialog.success);
    } catch (error) {
      console.error(t.errors.delete, error);
      alert(t.deleteDialog.error);
    } finally {
      setDeletingCVId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {cvList.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <div className="text-gray-500">
            <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t.emptyState.title}</p>
            <p className="text-sm">{t.emptyState.subtitle}</p>
          </div>
        </div>
      ) : (
        cvList.map((cv) => {
          const template = templates.find(
            (temp) => temp._id === cv.cvTemplateId
          );
          const TemplateComponent =
            templateComponentMap?.[template?.title || ""];

          const hasUserData = !!cv.content?.userData;
          const componentData = hasUserData
            ? {
                ...template?.data,
                userData: cv.content!.userData,
              }
            : undefined;

          return (
            <Card key={cv._id} hoverable>
              <motion.div className="bg-white rounded-xl overflow-hidden w-[350px] h-[260px] items-start">
                <div className="bg-white overflow-hidden w-[350px] h-[260px] flex gap-4 items-start">
                  <div className="relative shrink-0 w-[180px] aspect-[210/350] bg-gray-100 border rounded-md overflow-hidden">
                    <div
                      className="absolute bg-white"
                      style={{
                        position: "absolute",
                        width: `${templateOriginalWidth}px`,
                        height: `${templateOriginalWidth * (350 / 210)}px`,
                        transformOrigin: "top left",
                        transform: `scale(${scaleFactor})`,
                        backgroundColor: "white",
                      }}
                    >
                      <div className="pointer-events-none ">
                        {TemplateComponent && componentData ? (
                          <TemplateComponent data={componentData} language={language} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                            {template?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={template.imageUrl}
                                alt={template?.title || "CV template"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span>Preview unavailable</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {cv.title || t.card.unnamed}
                        </h3>
                      </div>
                      <p className="text-sm text-blue-500 mt-1">
                        {t.card.edited}{" "}
                        {formatTimeAgo(cv.updatedAt, t.timeAgo, language)}
                      </p>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>
                          {t.card.creation}{" "}
                          {new Date(cv.createdAt).toLocaleDateString(
                            language === "vi" ? "vi-VN" : "en-US"
                          )}
                        </p>
                        <p>
                          {t.card.status}{" "}
                          {cv.isFinalized
                            ? t.card.statusFinal
                            : t.card.statusDraft}
                        </p>
                      </div>
                    </div>

                    <div className={` ${
                            deletingCVId === cv._id && language === "vi"
                              ? "w-[120px]"
                              : "w-[90px]"
                          } mt-3 flex flex-col gap-2`}>
                      <Link href={`/updateCV?id=${cv._id}`}>
                        <button
                          className={`flex ${
                            language === "vi"
                              ? "w-[110px]"
                              : "w-[90px]"
                          } items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors bg-gray-100 hover:bg-blue-100 text-blue-600 hover:text-blue-700`}
                        >
                          <Edit size={16} /> {t.buttons.edit}
                        </button>
                      </Link>
                      <div>
                        <button
                          onClick={() =>
                            handleDeleteCV(cv._id, cv.title || t.card.unnamed)
                          }
                          disabled={deletingCVId === cv._id}
                          className={`flex ${
                            language === "vi"
                              ? "w-[110px]"
                              : "w-[90px]"
                          } items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors ${
                            deletingCVId === cv._id
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gray-100 hover:bg-red-100 text-red-600 hover:text-red-700"
                          }`}
                          title={t.buttons.deleteTooltip}
                        >
                          {deletingCVId === cv._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              {t.buttons.deleting}
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} /> {t.buttons.delete}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default CardMyCV;
