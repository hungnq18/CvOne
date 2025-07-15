import React from "react";
import { Modal } from "antd";
import CVTemplatePreview from "@/components/hr/CVCLPreview";

interface PreviewCVCLModalProps {
    open: boolean;
    type: "cv" | "cl" | null;
    cvData?: any;
    clData?: any;
    onClose: () => void;
}

const PreviewCVCLModal: React.FC<PreviewCVCLModalProps> = ({ open, type, cvData, clData, onClose }) => {
    return (
        <>
            {/* Modal Preview CV */}
            <Modal
                open={open && type === "cv"}
                onCancel={onClose}
                footer={null}
                width={650}
                centered
                title="CV Preview"
                styles={{ body: { background: "#f9f9f9" } }}
            >
                {cvData && cvData.cvImage ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: 400,
                        }}
                    >
                        <img
                            src={cvData.cvImage}
                            style={{
                                maxWidth: 600,
                                maxHeight: 800,
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                background: "#fff",
                                border: "1px solid #eee",
                            }}
                        />
                    </div>
                ) : cvData && (cvData.templateId || cvData.cvTemplateId) && cvData.content?.userData ? (
                    <CVTemplatePreview
                        templateId={cvData.templateId || cvData.cvTemplateId}
                        userData={cvData.content.userData}
                    />
                ) : (
                    <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                        Không tìm thấy dữ liệu CV.
                    </div>
                )}
            </Modal>
            {/* Modal Preview Cover Letter */}
            <Modal
                open={open && type === "cl"}
                onCancel={onClose}
                footer={null}
                width={600}
                centered
                title="Cover Letter Preview"
            >
                <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                    Chức năng xem Cover Letter đang phát triển.
                </div>
            </Modal>
        </>
    );
};

export default PreviewCVCLModal; 