"use client";

import React, { useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { templates, TemplateType } from "./templates/index";
import {
  createCL,
  getCLTemplateById,
  CLTemplate,
  CreateCLDto,
  getCLById,
  updateCL,
} from "@/api/clApi";
import Cookies from "js-cookie";
import { useLocations } from "@/hooks/useLocations";
import { fetchWithAuth } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiConfig";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/providers/global-provider";

interface LetterData {
  firstName: string;
  lastName: string;
  profession: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  date: string;
  recipientFirstName: string;
  recipientLastName: string;
  companyName: string;
  recipientCity: string;
  recipientState: string;
  recipientPhone: string;
  recipientEmail: string;
  subject: string;
  greeting: string;
  opening: string;
  body: string;
  callToAction: string;
  closing: string;
  signature: string;
}

const translations = {
  en: {
    sections: {
      name: "Name & Contact",
      date: "Date",
      recipient: "Recipient",
      subject: "Subject",
      greeting: "Greeting",
      opening: "Opening",
      body: "Letter Body",
      callToAction: "Call to Action",
      closing: "Closing",
    },
    modalTitles: {
      name: "Name & Contact",
      date: "Date",
      recipient: "Recipient",
      subject: "Subject Line",
      greeting: "Greeting",
      opening: "Opening Paragraph",
      body: "Letter Body",
      callToAction: "Call to Action",
      closing: "Closing",
    },
    labels: {
      firstName: "First Name",
      lastName: "Last Name",
      profession: "Profession",
      city: "City/Province",
      district: "District",
      phone: "Phone Number",
      email: "Email",
      recipientFirstName: "First Name",
      recipientLastName: "Last Name",
      companyName: "Company Name",
      recipientCity: "City/Province",
      recipientDistrict: "District",
      recipientPhone: "Phone Number",
      recipientEmail: "Email",
      subject: "Subject Line",
      greeting: "Greeting",
      opening: "Opening Paragraph",
      body: "Letter Body",
      callToAction: "Call to Action",
      closing: "Closing",
      signature: "Signature",
      date: "Date",
    },
    placeholders: {
      firstName: "e.g. John",
      lastName: "e.g. Smith",
      profession: "",
      phone: "e.g. +415-555-5555",
      email: "e.g. johnsmith@gmail.com",
      recipientFirstName: "e.g. John",
      recipientLastName: "e.g. Smith",
      companyName: "e.g. ACME Technologies",
      subject: "",
      greeting: "",
      opening: "",
      body: "",
      callToAction: "",
      closing: "e.g. Sincerely,",
      signature: "e.g. John Smith",
      date: "",
    },
    buttons: {
      cancel: "Cancel",
      save: "Save",
      goBack: "Go Back",
      finishLetter: "Finish Letter",
      saving: "Saving...",
    },
    titleModal: {
      title: "Please enter a title for your Cover Letter for easier management",
      subtitle: "e.g. FPT Application Letter, Marketing Position Letter...",
      placeholder: "Cover Letter Title",
      return: "Return",
      save: "Save",
    },
    alerts: {
      noTemplate: "Please select a template first.",
      noTitle: "Please enter a title for the Cover Letter.",
      saveSuccess: "Cover letter saved successfully!",
      updateSuccess: "Cover letter updated successfully!",
      saveFailed: "Failed to save cover letter. Please try again.",
      noUserData: "No user data found. Please try again.",
    },
    instructions: "Enter your contact information",
    extracting: "Analyzing data...",
    waitMessage: "This process may take a little time. Please wait.",
  },
  vi: {
    sections: {
      name: "Tên & Liên hệ",
      date: "Ngày",
      recipient: "Người nhận",
      subject: "Chủ đề",
      greeting: "Lời chào",
      opening: "Mở đầu",
      body: "Nội dung thư",
      callToAction: "Hành động kêu gọi",
      closing: "Kết thúc",
    },
    modalTitles: {
      name: "Tên & Liên hệ",
      date: "Ngày",
      recipient: "Người nhận",
      subject: "Dòng chủ đề",
      greeting: "Lời chào",
      opening: "Đoạn mở đầu",
      body: "Nội dung thư",
      callToAction: "Hành động kêu gọi",
      closing: "Kết thúc",
    },
    labels: {
      firstName: "Tên",
      lastName: "Họ",
      profession: "Nghề nghiệp",
      city: "Tỉnh/Thành phố",
      district: "Quận/Huyện",
      phone: "Số điện thoại",
      email: "Email",
      recipientFirstName: "Tên",
      recipientLastName: "Họ",
      companyName: "Tên công ty",
      recipientCity: "Tỉnh/Thành phố",
      recipientDistrict: "Quận/Huyện",
      recipientPhone: "Số điện thoại",
      recipientEmail: "Email",
      subject: "Dòng chủ đề",
      greeting: "Lời chào",
      opening: "Đoạn mở đầu",
      body: "Nội dung thư",
      callToAction: "Hành động kêu gọi",
      closing: "Kết thúc",
      signature: "Chữ ký",
      date: "Ngày",
    },
    placeholders: {
      firstName: "VD: Nguyễn",
      lastName: "VD: Văn A",
      profession: "",
      phone: "VD: +84-123-456-789",
      email: "VD: nguyenva@gmail.com",
      recipientFirstName: "VD: Nguyễn",
      recipientLastName: "VD: Văn A",
      companyName: "VD: Công ty FPT",
      subject: "",
      greeting: "",
      opening: "",
      body: "",
      callToAction: "",
      closing: "VD: Trân trọng,",
      signature: "VD: Nguyễn Văn A",
      date: "",
    },
    buttons: {
      cancel: "Hủy",
      save: "Lưu",
      goBack: "Quay lại",
      finishLetter: "Hoàn tất thư",
      saving: "Đang lưu...",
    },
    titleModal: {
      title: "Bạn vui lòng nhập tiêu đề Cover Letter để quản lý dễ dàng hơn",
      subtitle: "VD: Thư ứng tuyển FPT, Thư ứng tuyển vị trí Marketing...",
      placeholder: "Tiêu đề Cover Letter",
      return: "Quay lại",
      save: "Tiếp tục",
    },
    alerts: {
      noTemplate: "Vui lòng chọn mẫu trước.",
      noTitle: "Vui lòng nhập tiêu đề cho Cover Letter.",
      saveSuccess: "Lưu Cover Letter thành công!",
      updateSuccess: "Cập nhật Cover Letter thành công!",
      saveFailed: "Lưu Cover Letter thất bại. Vui lòng thử lại.",
      noUserData: "Không tìm thấy dữ liệu người dùng. Vui lòng thử lại.",
    },
    instructions: "Nhập thông tin liên hệ của bạn",
    extracting: "Đang phân tích dữ liệu...",
    waitMessage: "Quá trình này có thể mất một chút thời gian. Vui lòng chờ.",
  },
};

const CoverLetterBuilderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const clId = searchParams.get("clId");
  const initialFirstName = searchParams.get("firstName");
  const initialLastName = searchParams.get("lastName");
  const clFilename = searchParams.get("clFilename");
  const jdFilename = searchParams.get("jdFilename");
  const type = searchParams.get("type");

  const [selectedTemplateData, setSelectedTemplateData] =
    useState<CLTemplate | null>(null);
  const [templateName, setTemplateName] = useState<TemplateType>("cascade");
  const TemplateComponent = templates[templateName];
  const [isExtracting, setIsExtracting] = useState(false);

  const [letterData, setLetterData] = useState<LetterData>({
    firstName: "",
    lastName: "",
    profession: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    date: "",
    recipientFirstName: "",
    recipientLastName: "",
    companyName: "",
    recipientCity: "",
    recipientState: "",
    recipientPhone: "",
    recipientEmail: "",
    subject: "",
    greeting: "",
    opening: "",
    body: "",
    callToAction: "",
    closing: "",
    signature: "",
  });

  const {
    provinces,
    districts,
    recipientDistricts,
    fetchDistrictsForCity,
    fetchDistrictsForRecipientCity,
  } = useLocations();

  const { language } = useLanguage();
  const t = translations[language];

  // Chỉ chạy generateAiCv khi jdFilename hoặc type thay đổi, không phụ thuộc vào t
  useEffect(() => {
    const generateAiCv = async () => {
      if (jdFilename && type === "generate-by-ai") {
        const coverLetterDataString = localStorage.getItem("coverLetterData");
        if (!coverLetterDataString) {
          toast.error(t.alerts.noUserData);
          router.push("/personal-info");
          return;
        }
        const coverLetterData = JSON.parse(coverLetterDataString);

        const dto = {
          ...coverLetterData,
          jobDescriptionFileName: jdFilename,
          templateId: coverLetterData.templateId,
        };

        setIsExtracting(true);
        try {
          const response = await fetchWithAuth(
            API_ENDPOINTS.CL.GENERATE_CL_BY_AI,
            {
              method: "POST",
              body: JSON.stringify(dto),
            }
          );
          if (response && response.data) {
            setLetterData((prevData) => ({ ...prevData, ...response.data }));
            toast.success("Đã tạo nội dung bằng AI!");
          } else {
            toast.error(t.alerts.saveFailed);
          }
        } catch (error) {
          toast.error(t.alerts.saveFailed);
          console.error("AI generation failed:", error);
        } finally {
          setIsExtracting(false);
          localStorage.removeItem("coverLetterData");
        }
      }
    };
    generateAiCv();
  }, [jdFilename, type, router]); // Loại bỏ t khỏi dependencies

  useEffect(() => {
    const extractData = async () => {
      if (clFilename && jdFilename && templateId) {
        setIsExtracting(true);
        try {
          const extractedData = await fetchWithAuth(
            API_ENDPOINTS.CL.EXTRACT_COVER_LETTER,
            {
              method: "POST",
              body: JSON.stringify({
                coverLetterFileName: clFilename,
                jobDescriptionFileName: jdFilename,
                templateId,
              }),
            }
          );
          if (extractedData) {
            setLetterData((prevData) => ({
              ...prevData,
              ...extractedData.data,
            }));
            toast.success("Data extracted successfully!");
          }
        } catch (error) {
          toast.error(t.alerts.saveFailed);
          console.error("Extraction failed:", error);
        } finally {
          setIsExtracting(false);
        }
      }
    };

    extractData();
  }, [clFilename, jdFilename, templateId, t]);

  useEffect(() => {
    const fetchClData = async () => {
      if (clId) {
        try {
          const clData = await getCLById(clId);
          if (clData && clData.templateId) {
            const fetchedData = {
              ...clData.data,
              date: clData.data.date
                ? new Date(clData.data.date).toISOString().split("T")[0]
                : "",
            };
            setLetterData(fetchedData);
            setClTitle(clData.title || "");

            const templateIdentifier =
              typeof clData.templateId === "string"
                ? clData.templateId
                : (clData.templateId as CLTemplate)._id;

            const templateDetails = await getCLTemplateById(templateIdentifier);

            if (templateDetails) {
              setSelectedTemplateData(templateDetails);
              setTemplateName(
                templateDetails.title.toLowerCase() as TemplateType
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch CL data:", error);
        }
      }
    };

    const fetchTemplateData = async () => {
      if (templateId) {
        try {
          const data = await getCLTemplateById(templateId);
          if (data) {
            setSelectedTemplateData(data);
            setTemplateName(data.title.toLowerCase() as TemplateType);
          }
        } catch (error) {
          console.error("Failed to fetch CL template:", error);
        }
      }
    };

    if (clId) {
      fetchClData();
    } else if (templateId && !clFilename && !jdFilename) {
      fetchTemplateData();
    }
  }, [clId, templateId, clFilename, jdFilename]);

  const getInitialData = () => {
    if (!selectedTemplateData || !selectedTemplateData.data) {
      const firstName = initialFirstName || "";
      const lastName = initialLastName || "";
      return {
        firstName,
        lastName,
        profession: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        date: "",
        recipientFirstName: "",
        recipientLastName: "",
        companyName: "",
        recipientCity: "",
        recipientState: "",
        recipientPhone: "",
        recipientEmail: "",
        subject: "",
        greeting: "",
        opening: "",
        body: "",
        callToAction: "",
        closing: "",
        signature: `${firstName} ${lastName}`.trim(),
      };
    }

    const baseData = selectedTemplateData.data;
    const firstName = initialFirstName || baseData.firstName;
    const lastName = initialLastName || baseData.lastName;

    return {
      ...baseData,
      firstName,
      lastName,
      signature: `${firstName} ${lastName}`,
    };
  };

  useEffect(() => {
    if (!clId && !clFilename && !jdFilename) {
      setLetterData(getInitialData());
    }
  }, [
    selectedTemplateData,
    initialFirstName,
    initialLastName,
    clId,
    clFilename,
    jdFilename,
  ]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempData, setTempData] = useState<Partial<LetterData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [clTitle, setClTitle] = useState("");

  const saveCoverLetter = async (clDataToSave: LetterData, title: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (clId) {
        await updateCL(clId, { data: clDataToSave, title: title });
        alert(t.alerts.updateSuccess);
        router.push("/myDocuments");
      } else if (templateId) {
        const newCL: CreateCLDto = {
          templateId: templateId,
          title: title,
          data: clDataToSave,
          isSaved: true,
        };

        await createCL(newCL);
        localStorage.removeItem("pendingCL");
        alert(t.alerts.saveSuccess);
        router.push("/myDocuments");
      } else {
        alert(t.alerts.noTemplate);
      }
    } catch (error) {
      console.error("Failed to save cover letter:", error);
      alert(t.alerts.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishLetter = () => {
    const token = Cookies.get("token");
    if (!token) {
      if (!templateId) {
        alert(t.alerts.noTemplate);
        router.push("/clTemplate");
        return;
      }
      const pendingCL = {
        letterData,
        templateId,
      };
      localStorage.setItem("pendingCL", JSON.stringify(pendingCL));
      router.push("/login");
    } else {
      setIsTitleModalOpen(true);
    }
  };

  const handleSaveWithTitle = () => {
    if (!clTitle.trim()) {
      alert(t.alerts.noTitle);
      return;
    }
    saveCoverLetter(letterData, clTitle.trim());
    setIsTitleModalOpen(false);
  };

  const handleCityChange = async (cityValue: string, isRecipient: boolean) => {
    const fieldToUpdate = isRecipient ? "recipientCity" : "city";
    const districtFieldToUpdate = isRecipient ? "recipientState" : "state";

    handleInputChange(fieldToUpdate, cityValue);
    handleInputChange(districtFieldToUpdate, "");

    if (isRecipient) {
      await fetchDistrictsForRecipientCity(cityValue);
    } else {
      await fetchDistrictsForCity(cityValue);
    }
  };

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openModal = async (section: string) => {
    setActiveSection(section);
    const newTempData = { ...letterData };
    setTempData(newTempData);
    setIsModalOpen(true);

    if (section === "name" && newTempData.city) {
      await fetchDistrictsForCity(newTempData.city);
    } else if (section === "recipient" && newTempData.recipientCity) {
      await fetchDistrictsForRecipientCity(newTempData.recipientCity);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSection(null);
    setTempData({});
  };

  const saveChanges = () => {
    setLetterData((prev) => ({
      ...prev,
      ...tempData,
    }));
    closeModal();
  };

  const sections = [
    { id: "name", label: t.sections.name, icon: "" },
    { id: "date", label: t.sections.date, icon: "" },
    { id: "recipient", label: t.sections.recipient, icon: "" },
    { id: "subject", label: t.sections.subject, icon: "" },
    { id: "greeting", label: t.sections.greeting, icon: "" },
    { id: "opening", label: t.sections.opening, icon: "" },
    { id: "body", label: t.sections.body, icon: "" },
    { id: "callToAction", label: t.sections.callToAction, icon: "" },
    { id: "closing", label: t.sections.closing, icon: "" },
  ];

  const renderModalContent = () => {
    switch (activeSection) {
      case "name":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.firstName}
                </label>
                <input
                  type="text"
                  value={tempData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder={t.placeholders.firstName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.lastName}
                </label>
                <input
                  type="text"
                  value={tempData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder={t.placeholders.lastName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                {t.labels.profession}
              </label>
              <input
                type="text"
                value={tempData.profession || ""}
                onChange={(e) =>
                  handleInputChange("profession", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.city}
                </label>
                <select
                  value={tempData.city || ""}
                  onChange={(e) => handleCityChange(e.target.value, false)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="">{t.labels.city}</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.district}
                </label>
                <select
                  value={tempData.state || ""}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  disabled={!tempData.city}
                >
                  <option value="">{t.labels.district}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.phone}
                </label>
                <input
                  type="text"
                  value={tempData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t.placeholders.phone}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.labels.email}
                </label>
                <input
                  type="email"
                  value={tempData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t.placeholders.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
          </div>
        );
      case "date":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.date}
            </label>
            <input
              type="date"
              value={tempData.date || ""}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "recipient":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientFirstName}
                </label>
                <input
                  type="text"
                  value={tempData.recipientFirstName || ""}
                  onChange={(e) =>
                    handleInputChange("recipientFirstName", e.target.value)
                  }
                  placeholder={t.placeholders.recipientFirstName}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientLastName}
                </label>
                <input
                  type="text"
                  value={tempData.recipientLastName || ""}
                  onChange={(e) =>
                    handleInputChange("recipientLastName", e.target.value)
                  }
                  placeholder={t.placeholders.recipientLastName}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                {t.labels.companyName}
              </label>
              <input
                type="text"
                value={tempData.companyName || ""}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder={t.placeholders.companyName}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientCity}
                </label>
                <select
                  value={tempData.recipientCity || ""}
                  onChange={(e) => handleCityChange(e.target.value, true)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">{t.labels.recipientCity}</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientDistrict}
                </label>
                <select
                  value={tempData.recipientState || ""}
                  onChange={(e) =>
                    handleInputChange("recipientState", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={!tempData.recipientCity}
                >
                  <option value="">{t.labels.recipientDistrict}</option>
                  {recipientDistricts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientPhone}
                </label>
                <input
                  type="text"
                  value={tempData.recipientPhone || ""}
                  onChange={(e) =>
                    handleInputChange("recipientPhone", e.target.value)
                  }
                  placeholder={t.placeholders.phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.labels.recipientEmail}
                </label>
                <input
                  type="email"
                  value={tempData.recipientEmail || ""}
                  onChange={(e) =>
                    handleInputChange("recipientEmail", e.target.value)
                  }
                  placeholder={t.placeholders.email}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );
      case "subject":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.subject}
            </label>
            <input
              type="text"
              value={tempData.subject || ""}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "greeting":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.greeting}
            </label>
            <input
              type="text"
              value={tempData.greeting || ""}
              onChange={(e) => handleInputChange("greeting", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "opening":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.opening}
            </label>
            <textarea
              value={tempData.opening || ""}
              onChange={(e) => handleInputChange("opening", e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "body":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.body}
            </label>
            <textarea
              value={tempData.body || ""}
              onChange={(e) => handleInputChange("body", e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "callToAction":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
              {t.labels.callToAction}
            </label>
            <textarea
              value={tempData.callToAction || ""}
              onChange={(e) =>
                handleInputChange("callToAction", e.target.value)
              }
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case "closing":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                {t.labels.closing}
              </label>
              <input
                type="text"
                value={tempData.closing || ""}
                onChange={(e) => handleInputChange("closing", e.target.value)}
                placeholder={t.placeholders.closing}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                {t.labels.signature}
              </label>
              <input
                type="text"
                value={tempData.signature || ""}
                onChange={(e) => handleInputChange("signature", e.target.value)}
                placeholder={t.placeholders.signature}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );
      default:
        return <div>Select a section to edit</div>;
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(`${dateString}T00:00:00`);
      return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const displayLetterData = {
    ...letterData,
    date: formatDateForDisplay(letterData.date),
  };

  if (isExtracting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t.extracting}
        </h2>
        <p className="text-gray-600">{t.waitMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16">
      <div className="max-w-7xl mx-auto flex">
        <div className="w-80 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {language === "vi" ? "Các phần của thư" : "Letter sections"}
            </h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => openModal(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 bg-gray-50 flex items-center justify-center">
          <div className="transform scale-75 origin-top">
            {TemplateComponent && (
              <TemplateComponent
                letterData={displayLetterData}
                onSectionClick={openModal}
              />
            )}
          </div>
        </div>

        <div className="w-64 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              onClick={() => router.back()}
            >
              {t.buttons.goBack}
            </button>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              onClick={handleFinishLetter}
              disabled={isSaving}
            >
              {isSaving ? t.buttons.saving : t.buttons.finishLetter}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.modalTitles[activeSection as keyof typeof t.modalTitles]}
                </h2>
                {activeSection === "name" && (
                  <p className="text-gray-600">{t.instructions}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-8">{renderModalContent()}</div>
            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="px-8 py-3 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                {t.buttons.cancel}
              </button>
              <button
                onClick={saveChanges}
                className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
              >
                {t.buttons.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTitleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl transform transition-all">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              {t.titleModal.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t.titleModal.subtitle}
            </p>
            <input
              type="text"
              value={clTitle}
              onChange={(e) => setClTitle(e.target.value)}
              placeholder={t.titleModal.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsTitleModalOpen(false)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t.titleModal.return}
              </button>
              <button
                onClick={handleSaveWithTitle}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={!clTitle.trim() || isSaving}
              >
                {isSaving ? t.buttons.saving : t.titleModal.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CoverLetterBuilder = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoverLetterBuilderContent />
    </Suspense>
  );
};

export default CoverLetterBuilder;
