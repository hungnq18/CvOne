import React from 'react';
import { Table, Card, Row, Col, Dropdown, Menu, Button } from 'antd';
import { FaEnvelope, FaPlus } from 'react-icons/fa';
import { CoverLetter } from '@/app/myDocuments/page';
import { DownOutlined } from '@ant-design/icons';

interface CoverLetterListProps {
    coverLetters: CoverLetter[];
    viewMode: 'grid' | 'list';
}

const CoverLetterList: React.FC<CoverLetterListProps> = ({ coverLetters, viewMode }) => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: Date) => date.toLocaleDateString(),
        },
        {
            title: 'Company',
            dataIndex: 'company_address',
            key: 'company_address',
        },
    ];

    const menu = (cl: CoverLetter) => (
        <Menu>
            <Menu.Item key="edit">Edit</Menu.Item>
            <Menu.Item key="duplicate">Duplicate</Menu.Item>
            <Menu.Item key="tailor">Tailor for a job</Menu.Item>
            <Menu.Item key="download">Download</Menu.Item>
            <Menu.Item key="delete">Delete</Menu.Item>
        </Menu>
    );

    if (viewMode === 'grid') {
        return (
            <div className="bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                    <FaEnvelope className="text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-600">Danh sách Cover Letters</h2>
                </div>
                <Row gutter={[16, 16]}>
                    {/* New Cover Letter Card */}
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
                                className="mb-4 bg-green-500 hover:bg-green-600"
                            />
                            <h3 className="text-lg font-semibold">New Cover Letter</h3>
                            <p className="text-gray-600 text-sm">
                                TIP: Did you know that if you tailor your cover letter to the job description, you double your chances to get an interview?
                            </p>
                        </Card>
                    </Col>
                    {coverLetters.map((cl) => (
                        <Col key={cl._id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                title={
                                    <div className="flex justify-between items-center">
                                        <span>{cl.title}</span>
                                        <Dropdown overlay={menu(cl)} trigger={['click']}>
                                            <Button type="link" icon={<DownOutlined />} />
                                        </Dropdown>
                                    </div>
                                }
                                extra={<span className="text-gray-500">Edited {Math.floor(Math.random() * 24)} hours ago</span>}
                            >
                                <p>Company: {cl.company_address}</p>
                                <p>Created: {cl.created_at.toLocaleDateString()}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
                <FaEnvelope className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Danh sách Cover Letters</h2>
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