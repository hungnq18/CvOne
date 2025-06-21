import React from 'react';
import { Card, Row, Col, Dropdown, Menu, Button, Modal, Table } from 'antd';
import { FaEnvelope, FaPlus, FaEdit, FaTrash, FaDownload, FaCopy, FaFileAlt } from 'react-icons/fa';
import { CL, CLTemplate } from '@/api/clApi';
import { DownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/providers/global-provider';
import Image from 'next/image';

interface CoverLetterListProps {
    coverLetters: CL[];
    viewMode: 'grid' | 'list';
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onCreateNew: () => void;
}

const translations = {
    en: {
        title: 'Cover Letter List',
        new: 'Create Cover Letter',
        actions: {
            edit: 'Edit',
            duplicate: 'Duplicate',
            tailor: 'Tailor for a job',
            download: 'Download',
            delete: 'Delete'
        },
        fields: {
            title: 'Title',
            template: 'Template',
            createdAt: 'Created At',
            lastUpdatedAt: 'Last Updated',
            actions: 'Actions',
            introduction: 'Introduction'
        },
        tip: 'TIP: Did you know that if you tailor your cover letter to the job description, you double your chances to get an interview?'
    },
    vi: {
        title: 'Danh sách thư xin việc',
        new: 'Tạo thư xin việc',
        actions: {
            edit: 'Chỉnh sửa',
            duplicate: 'Nhân bản',
            tailor: 'Điều chỉnh cho công việc',
            download: 'Tải xuống',
            delete: 'Xóa'
        },
        fields: {
            title: 'Tiêu đề',
            template: 'Mẫu',
            createdAt: 'Ngày tạo',
            lastUpdatedAt: 'Cập nhật lần cuối',
            actions: 'Hành động',
            introduction: 'Giới thiệu'
        },
        tip: 'MẸO: Bạn có biết rằng nếu bạn điều chỉnh thư xin việc của mình theo mô tả công việc, bạn sẽ tăng gấp đôi cơ hội được phỏng vấn?'
    }
};

const CoverLetterList: React.FC<CoverLetterListProps> = ({ coverLetters, viewMode, onDelete, onEdit, onCreateNew }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const menu = (cl: CL) => (
        <Menu onClick={({ key }) => {
            if (key === 'edit') {
                onEdit(cl._id!);
            } else if (key === 'delete') {
                Modal.confirm({
                    title: 'Xác nhận xóa',
                    content: 'Bạn có chắc chắn muốn xóa thư xin việc này không?',
                    onOk: () => onDelete(cl._id!),
                });
            }
        }}>
            <Menu.Item key="edit" icon={<FaEdit />}>{t.actions.edit}</Menu.Item>
            <Menu.Item key="tailor" icon={<FaCopy />}>{t.actions.tailor}</Menu.Item>
            <Menu.Item key="download" icon={<FaDownload />}>{t.actions.download}</Menu.Item>
            <Menu.Item key="delete" icon={<FaTrash />}>{t.actions.delete}</Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: t.fields.title,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="font-semibold">{text}</span>,
        },
        {
            title: t.fields.template,
            dataIndex: 'templateId',
            key: 'template',
            render: (template: CLTemplate) => template?.title || 'N/A',
        },
        {
            title: t.fields.createdAt,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: t.fields.lastUpdatedAt,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: t.fields.actions,
            key: 'actions',
            align: 'center' as const,
            render: (_: any, record: CL) => (
                <Dropdown overlay={menu(record)} trigger={['click']}>
                    <Button type="text" icon={<DownOutlined />} />
                </Dropdown>
            ),
        },
    ];

    if (viewMode === 'grid') {
        return (
            <div className="bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FaEnvelope className="text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-blue-600">{t.title}</h2>
                    </div>
                    <Button
                        type="primary"
                        icon={<FaPlus />}
                        onClick={onCreateNew}
                        className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
                    >
                        {t.new}
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {coverLetters.map((cl) => {
                        const template = cl.templateId as CLTemplate;
                        return (
                            <Col key={cl._id} xs={24} sm={12} md={8} lg={8}>
                                <Card
                                    hoverable
                                    className="bg-white border border-gray-200 group"
                                >
                                    <div className="flex">
                                        <div className="w-1/3">
                                            <Image
                                                src={template.imageUrl}
                                                alt={cl.title}
                                                width={150}
                                                height={210}
                                                className="object-cover rounded-l-md"
                                            />
                                        </div>
                                        <div className="w-2/3 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-lg mb-2">{cl.title}</h3>
                                                    <Dropdown overlay={menu(cl)} trigger={['click']}>
                                                        <Button type="text" icon={<DownOutlined />} />
                                                    </Dropdown>
                                                </div>
                                                <p className="text-sm text-gray-500">Created: {new Date(cl.createdAt).toLocaleDateString()}</p>
                                                <p className="text-sm text-gray-500">Last updated: {new Date(cl.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <FaFileAlt className="text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-600">{t.title}</h2>
                </div>
                <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={onCreateNew}
                    className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
                >
                    {t.new}
                </Button>
            </div>
            <Table
                dataSource={coverLetters}
                columns={columns}
                rowKey="_id"
                pagination={false}
                className="bg-white"
                rowClassName="hover:bg-blue-50 transition-colors duration-300"
            />
        </div>
    );
};

export default CoverLetterList;