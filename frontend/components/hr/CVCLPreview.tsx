import React from "react";
import { getCVTemplates, CVTemplate } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index";

interface CVTemplatePreviewProps {
    templateId: string;
    userData: any;
}

const CVTemplatePreview: React.FC<CVTemplatePreviewProps> = ({ templateId, userData }) => {
    const [templates, setTemplates] = React.useState<CVTemplate[]>([]);
    React.useEffect(() => {
        getCVTemplates().then(setTemplates);
    }, []);
    const template = templates.find((t) => t._id === templateId);
    const TemplateComponent = templateComponentMap?.[template?.title || ""];
    if (!TemplateComponent)
        return (
            <div style={{ textAlign: "center", color: "#888", padding: 40 }}>
                Không tìm thấy template CV.
            </div>
        );
    const containerWidth = 600;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    const componentData = { ...template?.data, userData };
    // Tĩnh hoàn toàn: không select, không thao tác, không context menu
    return (
        <div className="flex justify-center">
            <div
                className="relative"
                style={{
                    width: "600px",
                    height: "900px",
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #eee",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
                onContextMenu={(e) => e.preventDefault()}
                tabIndex={-1}
                draggable={false}
            >
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
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                    tabIndex={-1}
                    draggable={false}
                >
                    <TemplateComponent data={componentData} />
                </div>
            </div>
        </div>
    );
};

export default CVTemplatePreview; 