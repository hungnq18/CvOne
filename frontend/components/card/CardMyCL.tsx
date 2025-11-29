"use client";

import { CL, CLTemplate, deleteCL, getCLs } from "@/api/clApi";
import { templates as clTemplateComponents } from "@/app/createCLTemplate/templates";
import { useLanguage } from "@/providers/global_provider";
import { Card } from "antd";
import { motion } from "framer-motion";
import { Edit, Trash2, Share2, ExternalLinkIcon, CopyIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";

const translations = {
  en: {
    cardMyCL: {
      timeAgo: {
        seconds: (s: number) => `${s} second${s > 1 ? "s" : ""} ago`,
        minutes: (m: number) => `${m} minute${m > 1 ? "s" : ""} ago`,
        hours: (h: number) => `${h} hour${h > 1 ? "s" : ""} ago`,
      },
      deleteDialog: {
        confirm: (title: string) =>
          `Are you sure you want to delete the Cover Letter "${title}"? This action cannot be undone.`,
        success: "Cover Letter deleted successfully!",
        error:
          "An error occurred while deleting the Cover Letter. Please try again.",
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
        openShare: "Open",
        share: "Share",
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
        confirm: (title: string) =>
          `Bạn có chắc chắn muốn xóa Thư xin việc "${title}"? Hành động này không thể hoàn tác.`,
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
        openShare: "Mở",
        share: "Chia sẻ",
        edit: "Chỉnh sửa",
        deleteTooltip: "Xóa CL này",
        deleting: "Đang xóa...",
        delete: "Xóa",
      },
    },
  },
};

const formatTimeAgo = (
  isoDate: string,
  t_timeAgo: typeof translations.vi.cardMyCL.timeAgo,
  locale: string
) => {
  const date = new Date(isoDate);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return t_timeAgo.seconds(diff);
  if (diff < 3600) return t_timeAgo.minutes(Math.floor(diff / 60));
  if (diff < 86400) return t_timeAgo.hours(Math.floor(diff / 3600));
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
};

type CardMyCLProps = {
  clListOverride?: CL[];
};

const CardMyCL: React.FC<CardMyCLProps> = ({ clListOverride }) => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations].cardMyCL;

  const [clList, setClList] = useState<CL[]>(clListOverride || []);
  const [deletingCLId, setDeletingCLId] = useState<string | null>(null);
  const [shareCLId, setShareCLId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const cls = await getCLs();

      setClList(cls);
    } catch (err) {
      console.error(t.errors.fetch, err);
    }
  };

  useEffect(() => {
    if (clListOverride) {
      setClList(clListOverride);
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clListOverride]);

  const containerWidth = 180;
  const templateOriginalWidth = 794;
  const scaleFactor = containerWidth / templateOriginalWidth;

  const handleDeleteCL = async (clId: string, clTitle: string) => {
    const isConfirmed = window.confirm(t.deleteDialog.confirm(clTitle));

    if (!isConfirmed) return;

    try {
      setDeletingCLId(clId);
      await deleteCL(clId);

      setClList((prevList: CL[]) =>
        prevList.filter((cl: CL) => cl._id !== clId)
      );

      notify.success(t.deleteDialog.success);
    } catch (error) {
      console.error(t.errors.delete, error);
      notify.error(t.deleteDialog.error);
    } finally {
      setDeletingCLId(null);
    }
  };

  const openShareModal = (clId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/share-cl/${clId}`;
    setShareUrl(url);
    setShareCLId(clId);
    setCopied(false);
  };

  const closeShareModal = () => {
    setShareCLId(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <>
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
          clList.map((cl: CL) => {
            const template = cl.templateId as CLTemplate;
            const TemplateComponent =
              template && template.title
                ? clTemplateComponents[
                    template.title.toLowerCase() as keyof typeof clTemplateComponents
                  ]
                : null;

            if (!TemplateComponent || !cl.data) return null;

            const componentData = {
              letterData: cl.data,
            };

            return (
              <Card key={cl._id} hoverable>
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
                          {t.card.edited}{" "}
                          {formatTimeAgo(cl.updatedAt, t.timeAgo, language)}
                        </p>
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          <p>
                            {t.card.creation}{" "}
                            {new Date(cl.createdAt).toLocaleDateString(
                              language === "vi" ? "vi-VN" : "en-US"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <Link href={`/createCLTemplate?clId=${cl._id}`}>
                          <button className="flex w-[110px] items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 hover:bg-blue-100 rounded-md text-blue-600 hover:text-blue-700">
                            <Edit size={16} /> {t.buttons.edit}
                          </button>
                        </Link>
                        <button
                          onClick={() => openShareModal(cl._id || "")}
                          className="flex w-[110px] items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors bg-gray-100 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                        >
                          <Share2 size={16} /> {t.buttons.share}
                        </button>
                        <div>
                          <button
                            onClick={() =>
                              handleDeleteCL(
                                cl._id || "",
                                cl.title || t.card.unnamed
                              )
                            }
                            disabled={deletingCLId === cl._id}
                            className={`flex w-[110px] items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors ${
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

      {shareCLId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-[40%] min-h-[120px] mx-4 rounded-lg shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "vi"
                  ? "Chia sẻ liên kết Cover Letter"
                  : "Share Cover Letter link"}
              </h3>
              <button
                onClick={closeShareModal}
                className="text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50 select-all"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <CopyIcon size={18} />
                {copied
                  ? language === "vi"
                    ? "Đã copy"
                    : "Copied"
                  : language === "vi"
                  ? "Copy"
                  : "Copy"}
              </button>
              <Link href={`/share-cl/${shareCLId}`}>
                <button className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium border border-gray-300">
                  <ExternalLinkIcon size={18} />
                  {t.buttons.openShare}
                </button>
              </Link>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {language === "vi"
                ? "Gửi liên kết này cho người nhận để xem Cover Letter của bạn."
                : "Send this link to let others view your Cover Letter."}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardMyCL;
