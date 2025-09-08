import React from "react";
import { Table, Card, Row, Col, Button } from "antd";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import { CL } from "@/api/clApi";
import { useLanguage } from "@/providers/global-provider";

interface CLListProps {
  coverLetters: CL[];
  viewMode?: "grid" | "list";
}

const translations = {
  en: {
    title: "Cover Letters",
    new: "New Cover Letter",
    fields: {
      title: "Title",
      createdAt: "Created",
    },
  },
  vi: {
    title: "Thư xin việc",
    new: "Thư mới",
    fields: {
      title: "Tiêu đề",
      createdAt: "Ngày tạo",
    },
  },
};

const CoverLetterList: React.FC<CLListProps> = ({ coverLetters, viewMode }) => {
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
  ];

  if (viewMode === "grid") {
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
            href="/clTemplates"
            className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md"
          >
            {t.new}
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {coverLetters.map((cl) => (
            <Col xs={24} sm={12} md={8} lg={8} key={cl._id}>
              <Card hoverable className="min-h-[200px]">
                <h3 className="text-lg font-semibold">{cl.title}</h3>
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
          href="/clTemplates"
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md"
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
      />
    </div>
  );
};

export default CoverLetterList;
