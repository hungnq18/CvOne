import React from "react";
import { Table, Card, Row, Col, Dropdown, Menu, Button } from "antd";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import { CV } from "@/api/cvapi";
import { DownOutlined } from "@ant-design/icons";
import { useLanguage } from "@/providers/global-provider";

import dynamic from "next/dynamic";

// Dynamic import giúp tránh lỗi hydration mismatch
const CardMyCV = dynamic(() => import("@/components/card/card-MyCV"), {
  ssr: false,
});

interface CVListProps {
  cvList: CV[];
  viewMode: "grid" | "list";
}

const translations = {
  en: {
    title: "CV List",
    new: "New CV",
    status: {
      final: "Final",
      draft: "Draft",
    },
    actions: {
      edit: "Edit",
      duplicate: "Duplicate",
      tailor: "Tailor for a job",
      download: "Download",
      delete: "Delete",
    },
    fields: {
      title: "Title",
      createdAt: "Creation",
      status: "Status",
      edited: "Edited {hours} hours ago",
    },
    tip: "TIP: Did you know that if you tailor your CV to the job description, you double your chances to get an interview?",
  },
  vi: {
    title: "Danh sách CV",
    new: "CV mới",
    status: {
      final: "Hoàn thành",
      draft: "Bản nháp",
    },
    actions: {
      edit: "Chỉnh sửa",
      duplicate: "Nhân bản",
      tailor: "Điều chỉnh cho công việc",
      download: "Tải xuống",
      delete: "Xóa",
    },
    fields: {
      title: "Tiêu đề",
      createdAt: "Ngày tạo",
      status: "Trạng thái",
      edited: "Chỉnh sửa {hours} giờ trước",
    },
    tip: "MẸO: Bạn có biết rằng nếu bạn điều chỉnh CV của mình theo mô tả công việc, bạn sẽ tăng gấp đôi cơ hội được phỏng vấn?",
  },
};

const CVList: React.FC<CVListProps> = ({ cvList, viewMode }) => {
  const { language } = useLanguage();
  const t = translations[language];

  const columns = [
    {
      title: t.fields.title,
      dataIndex: "title",
      key: "title",
      render: (text: string) => text || "Untitled",
    },
    {
      title: t.fields.createdAt,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date | undefined) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: t.fields.status,
      dataIndex: "finalize",
      key: "finalize",
      render: (finalize: boolean) => t.status[finalize ? "final" : "draft"],
    },
  ];

  const menu = (cv: CV) => (
    <Menu>
      <Menu.Item key="edit">{t.actions.edit}</Menu.Item>
      <Menu.Item key="tailor">{t.actions.tailor}</Menu.Item>
      <Menu.Item key="download">{t.actions.download}</Menu.Item>
      <Menu.Item key="delete">{t.actions.delete}</Menu.Item>
    </Menu>
  );

  if (viewMode === "grid") {
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
            className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
            href="/cvTemplates"
          >
            {t.new}
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {/* New Resume Card */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card
              hoverable
              className="min-h-[315px] flex items-center justify-center bg-blue-50 border border-blue-200"
              styles={{ body: { padding: "20px", textAlign: "center" } }}
            >
              <Button
                type="primary"
                shape="circle"
                icon={<FaPlus />}
                href="/cvTemplates"
                size="large"
                className="mb-4 bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300"
              />
              <h3 className="text-lg font-semibold">{t.new}</h3>
              <p className="text-gray-600 text-sm">{t.tip}</p>
            </Card>
          </Col>
          <CardMyCV />
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
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg"
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
