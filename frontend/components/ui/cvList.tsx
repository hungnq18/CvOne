'use client';

import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { FaFileAlt } from 'react-icons/fa';
import { CV, CVTemplate, getCVTemplates } from '@/api/cvapi';
import { useLanguage } from '@/providers/global-provider';
import { templateComponentMap } from '@/components/cvTemplate/index';

const translations = {
    vi: {
        listTitle: "Danh sách CV đã tạo",
        image: "Ảnh",
        name: "Tên CV",
        creation: "Ngày tạo",
        untitled: "Chưa đặt tên",
    },
    en: {
        listTitle: "Created CV List",
        image: "Image",
        name: "CV Name",
        creation: "Creation",
        untitled: "Untitled",
    }
};

interface CVListProps {
    cvList: CV[];
}

const CVList: React.FC<CVListProps> = ({ cvList }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const [templates, setTemplates] = useState<CVTemplate[]>([]);
    useEffect(() => {
        getCVTemplates().then(setTemplates);
    }, []);

    const containerWidth = 120; // even larger thumbnail size
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    const columns = [
        {
            title: t.image,
            dataIndex: '_id',
            key: 'image',
            render: (_: any, cv: CV) => {
                const template = templates.find((t) => t._id === cv.cvTemplateId);
                const TemplateComponent = templateComponentMap?.[template?.title || ''];
                if (!TemplateComponent || !cv.content?.userData) return <span className="text-gray-400">No preview</span>;
                const componentData = {
                    ...template?.data,
                    userData: cv.content.userData,
                };
                return (
                    <div className="relative w-32 h-44 bg-gray-100 border rounded overflow-hidden">
                        <div
                            style={{
                                width: `${templateOriginalWidth}px`,
                                height: `${templateOriginalWidth * (297 / 210)}px`,
                                transform: `scale(${scaleFactor})`,
                                transformOrigin: 'top left',
                                background: 'white',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            <TemplateComponent data={componentData} />
                        </div>
                    </div>
                );
            },
        },
        {
            title: t.name,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => text || t.untitled,
        },
        {
            title: t.creation,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
    ];

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <FaFileAlt className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">{t.listTitle}</h2>
            </div>
            <Table
                dataSource={cvList}
                columns={columns}
                rowKey="_id"
                pagination={cvList.length > 5 ? { pageSize: 5, hideOnSinglePage: true } : false}
                className="bg-white rounded-lg"
                rowClassName="hover:bg-blue-50 transition-colors duration-200"
            />
        </div>
    );
};

export default CVList;