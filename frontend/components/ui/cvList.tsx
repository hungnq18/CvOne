'use client';

import React from 'react';
import { Table } from 'antd';
import { FaFileAlt } from 'react-icons/fa';
import { CV } from '@/app/userDashboard/page';
import { useLanguage } from '@/providers/global-provider';

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

    const columns = [
        {
            title: t.image,
            dataIndex: 'image',
            key: 'image',
            render: (text: string) => <img src={text} alt="CV preview" className="w-12 h-auto rounded" />,
        },
        {
            title: t.name,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => text || t.untitled,
        },
        {
            title: t.creation,
            dataIndex: 'create_at',
            key: 'create_at',
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
                pagination={false}
                className="bg-white rounded-lg"
                rowClassName="hover:bg-blue-50 transition-colors duration-200"
            />
        </div>
    );
};

export default CVList;