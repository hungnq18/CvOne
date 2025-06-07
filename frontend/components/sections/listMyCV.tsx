import React from 'react';
import { Table, Card, Row, Col, Dropdown, Menu, Button } from 'antd';
import { FaFileAlt, FaPlus } from 'react-icons/fa';
import { CV } from '@/app/myDocuments/page';
import { DownOutlined } from '@ant-design/icons';

interface CVListProps {
    cvList: CV[];
    viewMode: 'grid' | 'list';
}

const CVList: React.FC<CVListProps> = ({ cvList, viewMode }) => {
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
            render: (date: Date) => date.toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'finalize',
            key: 'finalize',
            render: (finalize: boolean) => (finalize ? 'Final' : 'Draft'),
        },
    ];

    const menu = (cv: CV) => (
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
                    <FaFileAlt className="text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-600">Danh sách CV</h2>
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
                                className="mb-4 bg-green-500 hover:bg-green-600"
                            />
                            <h3 className="text-lg font-semibold">New CV</h3>
                            <p className="text-gray-600 text-sm">
                                TIP: Did you know that if you tailor your CV to the job description, you double your chances to get an interview?
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
                                extra={<span className="text-gray-500">Edited {Math.floor(Math.random() * 24)} hours ago</span>}
                            >
                                <p>Created: {cv.create_at.toLocaleDateString()}</p>
                                <p>Status: {cv.finalize ? 'Final' : 'Draft'}</p>
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
                <FaFileAlt className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Danh sách CV</h2>
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