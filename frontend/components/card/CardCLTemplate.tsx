"use client";

import { motion } from "framer-motion";
import { CLTemplate } from "@/api/clApi";
import { templates as clTemplateComponents } from "@/app/createCLTemplate/templates";

const CardCLTemplate: React.FC<{ template: CLTemplate }> = ({ template }) => {
    const containerWidth = 350;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    const TemplateComponent = clTemplateComponents[template.title.toLowerCase() as keyof typeof clTemplateComponents];

    if (!TemplateComponent) {
        return <div>Template not found</div>;
    }

    const componentData = {
        letterData: template.data,
    };

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden w-full h-auto items-start"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative w-full aspect-[210/297] bg-gray-100 border rounded-md overflow-hidden">
                <div
                    className="absolute bg-white"
                    style={{
                        width: `${templateOriginalWidth}px`,
                        height: `${templateOriginalWidth * (297 / 210)}px`,
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
            <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {template.title}
                </h3>
            </div>
        </motion.div>
    );
};

export default CardCLTemplate;