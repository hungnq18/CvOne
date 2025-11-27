"use client";

import {
  CV,
  CVTemplate,
  deleteCV,
  getAllCVs,
  getCVTemplates,
  getCVById,
} from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useLanguage } from "@/providers/global_provider";
import { Card } from "antd";
import { motion } from "framer-motion";
import { Edit, Trash2, Share2, ExternalLinkIcon, CopyIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDefaultSectionPositions } from "@/components/cvTemplate/defaultSectionPositions";
import { notify } from "@/lib/notify";

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
        openShare: "Open",
        share: "Share",
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
        openShare: "Mở",
        share: "Chia sẻ",
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

type CardMyCVProps = {
  cvListOverride?: CV[];
};

const CardMyCV: React.FC<CardMyCVProps> = ({ cvListOverride }) => {
  const { language } = useLanguage();
  const t = translations[language].cardMyCV;

  const [cvList, setCvList] = useState<CV[]>(cvListOverride || []);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [deletingCVId, setDeletingCVId] = useState<string | null>(null);
  const [shareCVId, setShareCVId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const enrichCVsWithUserData = async (list: CV[]): Promise<CV[]> => {
    // QUAN TRỌNG: Luôn fetch lại full CV data để đảm bảo có cvTemplateId và userData mới nhất
    // Điều này đảm bảo khi quay về từ trang update, CV sẽ hiển thị đúng template mới
    const results = await Promise.all(
      list.map(async (cv) => {
        try {
          // Luôn fetch lại full CV để có cvTemplateId và userData mới nhất
          const full = await getCVById(cv._id);
          if (full) {
            return {
              ...cv,
              cvTemplateId: full.cvTemplateId, // Đảm bảo có cvTemplateId mới nhất
              content: {
                ...(cv.content || {}),
                userData: full.content?.userData || cv.content?.userData || {},
              },
            } as CV;
          }
        } catch (err) {
          console.warn(`[card-MyCV] Failed to fetch full CV ${cv._id}:`, err);
        }
        return cv;
      })
    );
    return results;
  };

  const fetchData = async () => {
    try {
      const [cvs, templatesData] = await Promise.all([
        getAllCVs(),
        getCVTemplates(),
      ]);
      const enriched = await enrichCVsWithUserData(cvs || []);
      setCvList(enriched);
      setTemplates(templatesData);
    } catch (err) {
      console.error(t.errors.fetch, err);
    }
  };

  const fetchTemplatesOnly = async () => {
    try {
      const templatesData = await getCVTemplates();
      setTemplates(templatesData);
    } catch (err) {
      console.error(t.errors.fetch, err);
    }
  };

  useEffect(() => {
    if (cvListOverride) {
      enrichCVsWithUserData(cvListOverride).then(setCvList);
      fetchTemplatesOnly();
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvListOverride]);

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
      notify.success(t.deleteDialog.success);
    } catch (error) {
      console.error(t.errors.delete, error);
      notify.error(t.deleteDialog.error);
    } finally {
      setDeletingCVId(null);
    }
  };

  const openShareModal = (cvId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/share-cv/${cvId}`;
    setShareUrl(url);
    setShareCVId(cvId);
    setCopied(false);
  };

  const closeShareModal = () => {
    setShareCVId(null);
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
            // QUAN TRỌNG: Đảm bảo lấy đúng template từ cvTemplateId
            // Nếu không tìm thấy template, log warning và skip render
            const template = templates.find(
              (temp) => temp._id === cv.cvTemplateId
            );
            
            if (!template) {
              console.warn("[card-MyCV] Template not found:", {
                cvId: cv._id,
                cvTitle: cv.title,
                cvTemplateId: cv.cvTemplateId,
                availableTemplateIds: templates.map(t => ({ id: t._id, title: t.title }))
              });
              return null;
            }
            
            const TemplateComponent =
              templateComponentMap?.[template.title || ""];
            
            if (!TemplateComponent) {
              console.warn("[card-MyCV] Template component not found:", {
                cvId: cv._id,
                templateTitle: template.title,
                templateId: template._id,
                availableTemplates: Object.keys(templateComponentMap)
              });
              return null;
            }

            const userData = cv.content?.userData || {};
            
            // Lấy sectionPositions với ưu tiên: userData > default
            let sectionPositions =
              userData.sectionPositions ||
              getDefaultSectionPositions(template.title);
            
            // VALIDATION: Đảm bảo sectionPositions khớp với template hiện tại
            // Nếu không khớp (thiếu/thừa section), reset về default
            const defaultPositions = getDefaultSectionPositions(template.title);
            const defaultSectionKeys = Object.keys(defaultPositions);
            const currentSectionKeys = Object.keys(sectionPositions);
            
            // Nếu sectionPositions thiếu hoặc thừa section so với default, reset về default
            if (defaultSectionKeys.length !== currentSectionKeys.length || 
                !defaultSectionKeys.every(key => currentSectionKeys.includes(key))) {
              console.warn("[card-MyCV] sectionPositions không khớp với template, reset về default:", {
                cvId: cv._id,
                templateTitle: template.title,
                templateId: template._id,
                cvTemplateId: cv.cvTemplateId,
                defaultKeys: defaultSectionKeys,
                currentKeys: currentSectionKeys
              });
              sectionPositions = defaultPositions;
            }

            const componentData = {
              ...template.data,
              userData: userData,
              sectionPositions: sectionPositions,
              templateTitle: template.title, // Pass template title để template có thể validate
            };

            return (
              <Card key={cv._id} hoverable>
                <motion.div className="bg-white rounded-xl overflow-hidden w-[350px] h-[300px] items-start">
                  <div className="bg-white overflow-hidden w-[350px] h-[300px] flex gap-4 items-start">
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
                          {TemplateComponent ? (
                            <TemplateComponent
                              data={componentData}
                              language={language}
                              isPdfMode={true} // <--- QUAN TRỌNG: Giúp layout hiển thị đúng khi scale nhỏ
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                              {template?.imageUrl ? (
                                <img
                                  src={template.imageUrl}
                                  alt={template?.title || "CV template"}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
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

                      <div
                        className={` ${
                          deletingCVId === cv._id && language === "vi"
                            ? "w-[120px]"
                            : "w-[90px]"
                        } mt-3 flex flex-col gap-2`}
                      >
                        <Link href={`/updateCV?id=${cv._id}`}>
                          <button
                            className={`flex ${
                              language === "vi" ? "w-[110px]" : "w-[90px]"
                            } items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors bg-gray-100 hover:bg-blue-100 text-blue-600 hover:text-blue-700`}
                          >
                            <Edit size={16} /> {t.buttons.edit}
                          </button>
                        </Link>
                        <button
                          onClick={() => openShareModal(cv._id)}
                          className={`flex ${
                            language === "vi" ? "w-[110px]" : "w-[90px]"
                          } items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors bg-gray-100 hover:bg-blue-100 text-blue-600 hover:text-blue-700`}
                        >
                          <Share2 size={16} /> {t.buttons.share}
                        </button>

                        <div>
                          <button
                            onClick={() =>
                              handleDeleteCV(cv._id, cv.title || t.card.unnamed)
                            }
                            disabled={deletingCVId === cv._id}
                            className={`flex ${
                              language === "vi" ? "w-[110px]" : "w-[90px]"
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
      {shareCVId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-[40%] min-h-[120px] mx-4 rounded-lg shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "vi" ? "Chia sẻ liên kết CV" : "Share CV link"}
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
                <CopyIcon size={18} />{" "}
                {copied
                  ? language === "vi"
                    ? "Đã copy"
                    : "Copied"
                  : language === "vi"
                  ? "Copy"
                  : "Copy"}
              </button>
              <Link href={`/share-cv/${shareCVId}`}>
                <button
                  className={`flex ${
                    language === "vi" ? "w-[60px]" : "w-[45px]"
                  }items-center gap-1 px-3 py-2 rounded-md text-sm font-medium border border-gray-300`}
                >
                  <ExternalLinkIcon size={18} />
                  {t.buttons.openShare}
                </button>
              </Link>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {language === "vi"
                ? "Gửi liên kết này cho người nhận để xem CV của bạn."
                : "Send this link to let others view your CV."}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardMyCV;