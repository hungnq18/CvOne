"use client";
import React, { useState, useEffect } from "react";
import {
  getApplyJobByHR,
  updateStatusByHr,
  deleteApplyJobByHR,
} from "@/api/apiApplyJob";
import ManageApplyJobTable from "@/components/hr/ManageApplyJobTable";
import PreviewCVCLModal from "@/components/hr/PreviewCVCLModal";
import { sendNotification } from "@/api/apiNotification";
import { getUserById } from "@/api/userApi";
import { getCLById, getCLTemplateById } from "@/api/clApi";
import html2pdf from "html2pdf.js";
import FilterByDateHr from "./filterBydateHr";
import { notify } from "@/lib/notify";
import { useSocket } from "@/providers/SocketProvider";

export default function ManageApplyJobClient() {
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: "cv" | "cl" | null;
    cvData?: any;
    clData?: any;
    templateObj?: any;
  }>({ open: false, type: null });
  useEffect(() => {
    getApplyJobByHR().then((data: any) => {
      let arr = Array.isArray(data) ? data : data && data.data ? data.data : [];
      setApplications(arr);
    });
  }, []);

  const handleUpdateStatus = async (
    applyJobId: string,
    newStatus: "approved" | "rejected" | "reviewed",
    candidateId: string
  ) => {
    try {
      const updateRes = await updateStatusByHr(applyJobId, newStatus);
      // Chỉ gửi notification nếu cập nhật trạng thái thành công
      if (newStatus === "approved" && candidateId && updateRes) {
        // Lấy thông tin ứng viên và vị trí ứng tuyển
        const app = applications.find((a) => a._id === applyJobId);
        const candidateName =
          app?.cvId?.content?.userData?.firstName &&
            app?.cvId?.content?.userData?.lastName
            ? `${app.cvId.content.userData.firstName} ${app.cvId.content.userData.lastName}`
            : app?.userId?.first_name && app?.userId?.last_name
              ? `${app.userId.first_name} ${app.userId.last_name}`
              : "Ứng viên";
        const jobTitle =
          app?.jobId?.title || app?.jobId?.["Job Title"] || "N/A";
        const jobrole = app?.jobId?.role || app?.jobId?.Role || "";
        // --- Lấy thông tin HR ---
        let hrEmail = "";
        let hrPhone = "";
        let hrUserId = app?.jobId?.user_id;
        if (hrUserId && typeof hrUserId === "object" && (hrUserId as any).$oid)
          hrUserId = (hrUserId as any).$oid;
        try {
          if (hrUserId) {
            const hrUser = await getUserById(hrUserId);
            hrPhone = hrUser?.phone || "";
            // Không lấy email nữa
          }
        } catch (e) {
          /* fallback giữ trống */
        }
        // --- End lấy thông tin HR ---
        const message = `Chúc mừng bạn, ${candidateName}, hồ sơ của bạn cho vị trí ${jobrole} của công việc ${jobTitle} đã được chấp nhận!`;
        const notifData = {
          title: "Application Approved",
          message,
          type: "info",
          link: "", // sẽ update sau khi tạo notification
          recipient: candidateId,
          candidateName,
          jobTitle,
          hrEmail,
          hrPhone,
          jobId: app?.jobId?._id || app?.jobId,
        };
        await sendNotification(notifData);
      } else if (newStatus === "rejected" && candidateId && updateRes) {
        // Lấy thông tin ứng viên và vị trí ứng tuyển
        const app = applications.find((a) => a._id === applyJobId);
        const candidateName =
          app?.cvId?.content?.userData?.firstName &&
            app?.cvId?.content?.userData?.lastName
            ? `${app.cvId.content.userData.firstName} ${app.cvId.content.userData.lastName}`
            : app?.userId?.first_name && app?.userId?.last_name
              ? `${app.userId.first_name} ${app.userId.last_name}`
              : "Ứng viên";
        const jobTitle =
          app?.jobId?.title || app?.jobId?.["Job Title"] || "N/A";
        const jobrole = app?.jobId?.role || app?.jobId?.Role || "";
        // --- Lấy thông tin HR ---
        let hrEmail = "";
        let hrPhone = "";
        let hrUserId = app?.jobId?.user_id;
        if (hrUserId && typeof hrUserId === "object" && (hrUserId as any).$oid)
          hrUserId = (hrUserId as any).$oid;
        try {
          if (hrUserId) {
            const hrUser = await getUserById(hrUserId);
            hrPhone = hrUser?.phone || "";
            // Không lấy email nữa
          }
        } catch (e) {
          /* fallback */
        }
        // --- End lấy thông tin HR ---
        const message = `Cảm ơn bạn, ${candidateName}, đã quan tâm và ứng tuyển vào vị trí ${jobrole} cho công việc ${jobTitle}. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu của vị trí ở thời điểm hiện tại. Chúng tôi trân trọng sự quan tâm của bạn và hy vọng sẽ có cơ hội hợp tác với bạn trong tương lai.`;
        const notifData = {
          title: "Application Rejected",
          message,
          type: "info",
          link: "", // sẽ update sau khi tạo notification
          recipient: candidateId,
          candidateName,
          jobTitle,
          hrEmail,
          hrPhone,
          jobId: app?.jobId?._id || app?.jobId,
        };
        await sendNotification(notifData);
      }
      getApplyJobByHR().then((data: any) => {
        let arr = Array.isArray(data)
          ? data
          : data && data.data
            ? data.data
            : [];
        setApplications(arr);
      });
    } catch (error) {
      notify.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleDeleteApplyJob = async (applyJobId: string) => {
    try {
      await deleteApplyJobByHR(applyJobId);
      getApplyJobByHR().then((data: any) => {
        let arr = Array.isArray(data)
          ? data
          : data && data.data
            ? data.data
            : [];
        setApplications(arr);
      });
    } catch (error) {
      notify.error("Xóa ứng viên thất bại!");
    }
  };

  const handleViewCV = (cvId: string) => {
    const app = applications.find(
      (a: any) => (a.cvId?._id || a.cv_id) === cvId
    );
    if (app?.cvId) {
      setPreviewModal({ open: true, type: "cv", cvData: app.cvId });
    }
  };
  const handleViewCoverLetter = async (coverLetterId: string) => {
    try {
      const clData = await getCLById(coverLetterId);
      if (clData) {
        const templateId =
          typeof clData.templateId === "string"
            ? clData.templateId
            : clData.templateId?._id;
        const templateObj = templateId
          ? await getCLTemplateById(templateId)
          : undefined;
        setPreviewModal({ open: true, type: "cl", clData, templateObj });
      } else {
        notify.error("Không tìm thấy dữ liệu Cover Letter.");
      }
    } catch (error) {
      notify.error("Đã có lỗi xảy ra khi lấy dữ liệu Cover Letter.");
    }
  };

  const handleDownloadCoverLetter = async (clId?: string, clUrl?: string) => {
    if (clUrl) {
      // Mở file trong tab mới thay vì tải về
      window.open(clUrl, "_blank");
      return;
    }
    if (!clId) return;
    try {
      const clData = await getCLById(clId);
      if (!clData) {
        notify.error("Không tìm thấy dữ liệu Cover Letter.");
        return;
      }
      const templateId =
        typeof clData.templateId === "string"
          ? clData.templateId
          : clData.templateId?._id;
      const templateObj = templateId
        ? await getCLTemplateById(templateId)
        : undefined;
      if (!templateObj) {
        notify.error("Không tìm thấy template phù hợp để xuất PDF");
        return;
      }
      const clTemplateModule = await import("@/app/createCLTemplate/templates");
      const clTemplateComponents = clTemplateModule.templates;
      type TemplateType = keyof typeof clTemplateComponents;
      const key = templateObj.title.toLowerCase() as TemplateType;
      const TemplateComponent = clTemplateComponents[
        key
      ] as React.ComponentType<any>;
      if (!TemplateComponent) {
        notify.error("Không tìm thấy component template để xuất PDF");
        return;
      }
      // Tạo iframe ẩn
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "794px";
      iframe.style.height = "1123px";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        notify.error("Không thể tạo môi trường để xuất PDF.");
        document.body.removeChild(iframe);
        return;
      }
      // Copy CSS
      const head = iframeDoc.head;
      document
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((node) => {
          head.appendChild(node.cloneNode(true));
        });
      // Mount node
      const mountNode = iframeDoc.createElement("div");
      iframeDoc.body.appendChild(mountNode);
      let root = null;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const { createRoot } = await import("react-dom/client");
        root = createRoot(mountNode);
        root.render(
          <div>
            <div style={{ fontFamily: "sans-serif" }}>
              <TemplateComponent
                letterData={clData.data}
                data={clData.data}
                isPdfMode={true}
              />
            </div>
          </div>
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        await html2pdf()
          .from(iframe.contentWindow.document.body)
          .set({
            margin: 0,
            filename: `${clData.title || "cover-letter"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
          })
          .save();
      } catch (error) {
        notify.error("Đã có lỗi xảy ra khi xuất file PDF.");
      } finally {
        if (root) root.unmount();
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }
    } catch (error) {
      notify.error("Đã có lỗi xảy ra khi xuất file PDF.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Job Applications</h1>
      </div>
      <ManageApplyJobTable
        applications={applications}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleViewCV={handleViewCV}
        handleViewCoverLetter={handleViewCoverLetter}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteApplyJob={handleDeleteApplyJob}
        handleDownloadCL={handleDownloadCoverLetter}
      />
      <PreviewCVCLModal
        open={previewModal.open}
        type={previewModal.type}
        cvData={previewModal.cvData}
        clData={previewModal.clData}
        templateObj={previewModal.templateObj}
        onClose={() => setPreviewModal({ open: false, type: null })}
      />
    </div>
  );
}
