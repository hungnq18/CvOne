import React from 'react';
import { Table, Card, Row, Col, Dropdown, Menu, Button } from 'antd';
import { FaFileAlt, FaPlus } from 'react-icons/fa';
import { CV } from '@/app/myDocuments/page';
import { DownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/providers/global-provider';

interface CVListProps {
    cvList: CV[];
    viewMode: 'grid' | 'list';
}

const translations = {
    en: {
        title: 'CV List',
        new: 'New CV',
        status: {
            final: 'Final',
            draft: 'Draft'
        },
        actions: {
            edit: 'Edit',
            duplicate: 'Duplicate',
            tailor: 'Tailor for a job',
            download: 'Download',
            delete: 'Delete'
        },
        fields: {
            title: 'Title',
            creation: 'Creation',
            status: 'Status',
            edited: 'Edited {hours} hours ago'
        },
        tip: 'TIP: Did you know that if you tailor your CV to the job description, you double your chances to get an interview?'
    },
    vi: {
        title: 'Danh sách CV',
        new: 'CV mới',
        status: {
            final: 'Hoàn thành',
            draft: 'Bản nháp'
        },
        actions: {
            edit: 'Chỉnh sửa',
            duplicate: 'Nhân bản',
            tailor: 'Điều chỉnh cho công việc',
            download: 'Tải xuống',
            delete: 'Xóa'
        },
        fields: {
            title: 'Tiêu đề',
            creation: 'Ngày tạo',
            status: 'Trạng thái',
            edited: 'Chỉnh sửa {hours} giờ trước'
        },
        tip: 'MẸO: Bạn có biết rằng nếu bạn điều chỉnh CV của mình theo mô tả công việc, bạn sẽ tăng gấp đôi cơ hội được phỏng vấn?'
    }
};

const CVList: React.FC<CVListProps> = ({ cvList, viewMode }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const columns = [
        {
            title: t.fields.title,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => text || 'Untitled',
        },
        {
            title: t.fields.creation,
            dataIndex: 'create_at',
            key: 'create_at',
            render: (date: Date) => date.toLocaleDateString(),
        },
        {
            title: t.fields.status,
            dataIndex: 'finalize',
            key: 'finalize',
            render: (finalize: boolean) => t.status[finalize ? 'final' : 'draft'],
        },
    ];

    const menu = (cv: CV) => (
        <Menu>
            <Menu.Item key="edit">{t.actions.edit}</Menu.Item>
            <Menu.Item key="duplicate">{t.actions.duplicate}</Menu.Item>
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
                        <FaFileAlt className="text-blue-600 mr-2" />
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
                    {/* New Resume Card */}
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            className="min-h-[300px] flex items-center justify-center bg-green-50 border border-green-200"
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
                    {cvList.map((cv) => (
                        <Col key={cv._id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                cover={cv.image && <img alt="CV preview" src={cv.image} />}
                                title={
                                    <div className="flex justify-between items-center">
                                        <span>{cv.title || 'Untitled'}</span>
                                        <Dropdown overlay={menu(cv)} trigger={['click']}>
                                            <Button type="link" icon={<DownOutlined />} />
                                        </Dropdown>
                                    </div>
                                }
                                extra={<span className="text-gray-500">{t.fields.edited.replace('{hours}', Math.floor(Math.random() * 24).toString())}</span>}
                            >
                                <p>{t.fields.creation}: {cv.create_at.toLocaleDateString()}</p>
                                <p>{t.fields.status}: {t.status[cv.finalize ? 'final' : 'draft']}</p>
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
                    <FaFileAlt className="text-blue-600 mr-2" />
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
                dataSource={cvList}
                columns={columns}
                rowKey="_id"
                pagination={false}
                className="bg-white"
                rowClassName="hover:bg-blue-50 transition-colors duration-300"
            />
        </div>
    );
};

export default CVList;