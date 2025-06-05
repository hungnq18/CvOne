'use client';

import React from 'react';
import { Table } from 'antd';
import { FaFileAlt } from 'react-icons/fa';
import { CV } from '@/app/userDashboard/page';

interface CVListProps {
    cvList: CV[];
}

const CVList: React.FC<CVListProps> = ({ cvList }) => {
    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (text: string) => <img src={text} alt="CV preview" className="w-12 h-auto rounded" />,
        },
        {
            title: 'Name',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => text || 'Untitled',
        },
        {
            title: 'Creation',
            dataIndex: 'create_at',
            key: 'create_at',
        },
    ];

    return (
        <div className=" mt-6">
            <div className="flex items-center mb-4">
                <FaFileAlt className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Danh sách CV đã tạo</h2>
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