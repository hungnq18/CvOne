"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CL, getCLs, CLTemplate, deleteCL } from "@/api/clApi";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "antd";
import { templates as clTemplateComponents } from "@/app/createCLTemplate/templates";
import { useLanguage } from "@/providers/global-provider";

const translations = {
  en: {
    cardMyCL: {
      timeAgo: {
        seconds: (s: number) => `${s} second${s > 1 ? 's' : ''} ago`,
        minutes: (m: number) => `${m} minute${m > 1 ? 's' : ''} ago`,
        hours: (h: number) => `${h} hour${h > 1 ? 's' : ''} ago`,
      },
      deleteDialog: {
        confirm: (title: string) => `Are you sure you want to delete the Cover Letter "${title}"? This action cannot be undone.`,
        success: "Cover Letter deleted successfully!",
        error: "An error occurred while deleting the Cover Letter. Please try again.",
      },
      errors: {
        fetch: "Error fetching Cover Letters or templates:",
        delete: "Error deleting Cover Letter:",
      },
      emptyState: {
        title: "No Cover Letters yet",
        subtitle: "Create your first Cover Letter to get started",
      },
      card: {
        unnamed: "Unnamed CL",
        edited: "Edited",
        creation: "Creation:",
      },
      buttons: {
        edit: "Edit",
        deleteTooltip: "Delete this CL",
        deleting: "Deleting...",
        delete: "Delete",
      },
    },
  },
  vi: {
    cardMyCL: {
      timeAgo: {
        seconds: (s: number) => `${s} giây trước`,
        minutes: (m: number) => `${m} phút trước`,
        hours: (h: number) => `${h} giờ trước`,
      },
      deleteDialog: {
        confirm: (title: string) => `Bạn có chắc chắn muốn xóa Thư xin việc "${title}"? Hành động này không thể hoàn tác.`,
        success: "Xóa Thư xin việc thành công!",
        error: "Có lỗi xảy ra khi xóa Thư xin việc. Vui lòng thử lại.",
      },
      errors: {
        fetch: "Lỗi khi gọi getAllCLs hoặc getAllTemplates:",
        delete: "Lỗi khi xóa CL:",
      },
      emptyState: {
        title: "Chưa có Thư xin việc nào",
        subtitle: "Tạo Thư xin việc đầu tiên của bạn để bắt đầu",
      },
      card: {
        unnamed: "CL chưa có tên",
        edited: "Đã chỉnh sửa",
        creation: "Ngày tạo:",
      },
      buttons: {
        edit: "Chỉnh sửa",
        deleteTooltip: "Xóa CL này",
        deleting: "Đang xóa...",
        delete: "Xóa",
      },
    },
  },
};

const formatTimeAgo = (isoDate: string, t_timeAgo: typeof translations.vi.cardMyCL.timeAgo, locale: string) => {
  const date = new Date(isoDate);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return t_timeAgo.seconds(diff);
  if (diff < 3600) return t_timeAgo.minutes(Math.floor(diff / 60));
  if (diff < 86400) return t_timeAgo.hours(Math.floor(diff / 3600));
  return date.toLocaleDateString(locale === 'vi' ? "vi-VN" : "en-US");
};

const CardMyCL: React.FC<{}> = ({}) => {
  const { language } = useLanguage();
  const t = translations[language].cardMyCL;

  const [clList, setClList] = useState<CL[]>([]);
  const [deletingCLId, setDeletingCLId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const cls = await getCLs();
      console.log(cls);
      setClList(cls);
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

  const handleDeleteCL = async (clId: string, clTitle: string) => {
    const isConfirmed = window.confirm(t.deleteDialog.confirm(clTitle));

    if (!isConfirmed) return;

    try {
      setDeletingCLId(clId);
      await deleteCL(clId);

      setClList(prevList => prevList.filter(cl => cl._id !== clId));

      alert(t.deleteDialog.success);
    } catch (error) {
      console.error(t.errors.delete, error);
      alert(t.deleteDialog.error);
    } finally {
      setDeletingCLId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clList.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <div className="text-gray-500">
            <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t.emptyState.title}</p>
            <p className="text-sm">{t.emptyState.subtitle}</p>
          </div>
        </div>
      ) : (
        clList.map((cl) => {
          const template = cl.templateId as CLTemplate;
          const TemplateComponent = template && template.title ? clTemplateComponents[template.title.toLowerCase() as keyof typeof clTemplateComponents] : null;

          if (!TemplateComponent || !cl.data) return null;

          const componentData = {
            letterData: cl.data,
          };

          return (
            <Card key={cl._id} hoverable>
              <motion.div className="bg-white rounded-xl overflow-hidden w-[350px] h-[260px] items-start">
                <div className="bg-white overflow-hidden w-[350px] h-[260px] flex gap-4 items-start">
                  <div className="relative shrink-0 w-[180px] aspect-[210/350] bg-gray-100 border rounded-md overflow-hidden">
                    <div className="absolute bg-white" style={{
                      position: "absolute",
                      width: `${templateOriginalWidth}px`,
                      height: `${templateOriginalWidth * (350 / 210)}px`,
                      transformOrigin: "top left",
                      transform: `scale(${scaleFactor})`,
                      backgroundColor: "white",
                    }}>
                      <div className="pointer-events-none ">
                        <TemplateComponent {...componentData} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {cl.title || t.card.unnamed}
                        </h3>
                      </div>
                      <p className="text-sm text-blue-500 mt-1">
                        {t.card.edited} {formatTimeAgo(cl.updatedAt, t.timeAgo, language)}
                      </p>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>{t.card.creation} {new Date(cl.createdAt).toLocaleDateString(language === 'vi' ? "vi-VN" : "en-US")}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      <Link href={`/createCLTemplate?clId=${cl._id}`}>
                        <button className="flex w-[90px] items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-blue-600">
                          <Edit size={16} /> {t.buttons.edit}
                        </button>
                      </Link>
                      <div>
                        <button
                          onClick={() => handleDeleteCL(cl._id || '', cl.title || t.card.unnamed)}
                          disabled={deletingCLId === cl._id}
                          className={`flex w-[90px] items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors ${
                            deletingCLId === cl._id
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gray-100 hover:bg-red-100 text-red-600 hover:text-red-700"
                          }`}
                          title={t.buttons.deleteTooltip}
                        >
                          {deletingCLId === cl._id ? (
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

export default CardMyCL;