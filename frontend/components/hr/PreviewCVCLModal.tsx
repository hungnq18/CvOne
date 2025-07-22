
"use client";

import React, { useMemo } from "react";
import { Modal } from "antd";
import { templates as clTemplateComponents } from "@/app/createCLTemplate/templates";
import CVTemplatePreview from "@/components/hr/CVCLPreview";

interface PreviewCVCLModalProps {
    open: boolean;
    type: "cv" | "cl" | null;
    cvData?: any;
    clData?: any;
    templateObj?: any;
    onClose: () => void;
}

const PreviewCVCLModal: React.FC<PreviewCVCLModalProps> = ({ open, type, cvData, clData, templateObj, onClose }) => {
    // Kích thước và tỷ lệ cho bản xem trước
    const containerWidth = 600;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    // Chọn TemplateComponent và cache với useMemo
    const TemplateComponent = React.useMemo(
        () =>
            templateObj?.title
                ? clTemplateComponents[templateObj.title.toLowerCase() as keyof typeof clTemplateComponents]
                : null,
        [templateObj]
    );
    // Cache componentData
    const componentData = React.useMemo(() => ({ letterData: clData?.data }), [clData]);

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
                width={650}
                centered
                title="Cover Letter Preview"
                styles={{ body: { background: "#f9f9f9" } }}
            >
                {clData && templateObj && TemplateComponent && clData.data ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: 400,
                        }}
                    >
                        <div
                            style={{
                                width: `${containerWidth}px`,
                                aspectRatio: "210/350",
                                background: "#fff",
                                border: "1px solid #eee",
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${templateOriginalWidth}px`,
                                    height: `${templateOriginalWidth * (350 / 210)}px`,
                                    transformOrigin: "top left",
                                    transform: `scale(${scaleFactor})`,
                                    backgroundColor: "white",
                                }}
                            >
                                <div className="pointer-events-none">
                                    <TemplateComponent {...componentData} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                        Không tìm thấy dữ liệu hoặc template cho Cover Letter.
                    </div>
                )}
            </Modal>
        </>
    );
};

export default PreviewCVCLModal;

