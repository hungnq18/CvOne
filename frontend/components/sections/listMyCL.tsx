import React from 'react';
import { Table, Card, Row, Col, Dropdown, Menu, Button } from 'antd';
import { FaEnvelope, FaPlus } from 'react-icons/fa';
import { CoverLetter } from '@/app/myDocuments/page';
import { DownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/providers/global-provider';

interface CoverLetterListProps {
    coverLetters: CoverLetter[];
    viewMode: 'grid' | 'list';
}

const translations = {
    en: {
        title: 'Cover Letter List',
        new: 'New Cover Letter',
        actions: {
            edit: 'Edit',
            duplicate: 'Duplicate',
            tailor: 'Tailor for a job',
            download: 'Download',
            delete: 'Delete'
        },
        fields: {
            title: 'Title',
            company: 'Company',
            createdAt: 'Created At',
            edited: 'Edited {hours} hours ago',
            introduction: 'Introduction'
        },
        tip: 'TIP: Did you know that if you tailor your cover letter to the job description, you double your chances to get an interview?'
    },
    vi: {
        title: 'Danh sách thư xin việc',
        new: 'Thư xin việc mới',
        actions: {
            edit: 'Chỉnh sửa',
            duplicate: 'Nhân bản',
            tailor: 'Điều chỉnh cho công việc',
            download: 'Tải xuống',
            delete: 'Xóa'
        },
        fields: {
            title: 'Tiêu đề',
            company: 'Công ty',
            createdAt: 'Ngày tạo',
            edited: 'Chỉnh sửa {hours} giờ trước',
            introduction: 'Giới thiệu'
        },
        tip: 'MẸO: Bạn có biết rằng nếu bạn điều chỉnh thư xin việc của mình theo mô tả công việc, bạn sẽ tăng gấp đôi cơ hội được phỏng vấn?'
    }
};

const CoverLetterList: React.FC<CoverLetterListProps> = ({ coverLetters, viewMode }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const columns = [
        {
            title: t.fields.title,
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: t.fields.createdAt,
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: Date) => date.toLocaleDateString(),
        },
        {
            title: t.fields.company,
            dataIndex: 'company_address',
            key: 'company_address',
        },
    ];

    const menu = (cl: CoverLetter) => (
        <Menu>
            <Menu.Item key="edit">{t.actions.edit}</Menu.Item>
            <Menu.Item key="tailor">{t.actions.tailor}</Menu.Item>
            <Menu.Item key="download">{t.actions.download}</Menu.Item>
            <Menu.Item key="delete">{t.actions.delete}</Menu.Item>
        </Menu>
    );

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
                        className="bg-green-500 hover:bg-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
                    >
                        {t.new}
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {/* New Cover Letter Card */}
                    <Col xs={24} sm={12} md={8} lg={8}>
                        <Card
                            hoverable
                            className="min-h-[250px] flex items-center justify-center bg-green-50 border border-green-200"
                            bodyStyle={{ padding: '20px', textAlign: 'center' }}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<FaPlus />}
                                size="large"
                                className="mb-4 bg-green-500 hover:bg-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                            />
                            <h3 className="text-lg font-semibold">{t.new}</h3>
                            <p className="text-gray-600 text-sm">
                                {t.tip}
                            </p>
                        </Card>
                    </Col>
                    {coverLetters.map((cl) => (
                        <Col key={cl._id} xs={24} sm={12} md={8} lg={8}>
                            <Card
                                hoverable
                                className="min-h-[250px] bg-white border border-gray-200"
                                bodyStyle={{ padding: '16px' }}
                                title={
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-lg">{cl.title}</span>
                                        <Dropdown overlay={menu(cl)} trigger={['click']}>
                                            <Button type="link" icon={<DownOutlined />} />
                                        </Dropdown>
                                    </div>
                                }
                                extra={<span className="text-gray-500 text-sm">{t.fields.edited.replace('{hours}', Math.floor(Math.random() * 24).toString())}</span>}
                            >
                                <div className="space-y-2">
                                    <p className="text-sm">{t.fields.company}: {cl.company_address}</p>
                                    <p className="text-sm">{t.fields.createdAt}: {cl.created_at.toLocaleDateString()}</p>
                                    <p className="text-sm">{t.fields.introduction}: {cl.introduction?.substring(0, 100)}...</p>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <FaEnvelope className="text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-600">{t.title}</h2>
                </div>
                <Button
                    type="primary"
                    icon={<FaPlus />}
                    className="bg-green-500 hover:bg-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
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