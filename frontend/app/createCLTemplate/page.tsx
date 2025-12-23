"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Loader2, X } from "lucide-react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLanguage } from "@/providers/global_provider";

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

const DropdownArrow = () => (
  <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white" />
);

const CoverLetterBuilderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
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

  const letterPreviewRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement | null>(null);

  const [letterData, setLetterData] = useState<LetterData>({
    firstName: "",
    lastName: "",
    profession: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
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

  useEffect(() => {
    const generateAiCv = async () => {
      if (jdFilename && type === "generate-by-ai") {
        const coverLetterDataString = localStorage.getItem("coverLetterData");
        if (!coverLetterDataString) {
          toast.error(t.clBuilder.messages.noUserData);
          router.push("/personal-info");
          return;
        }
        const coverLetterData = JSON.parse(coverLetterDataString);

        // Set template name from localStorage first
        if (coverLetterData.templateId) {
          try {
            const templateData = await getCLTemplateById(
              coverLetterData.templateId
            );
            if (templateData) {
              setTemplateName(templateData.title.toLowerCase() as TemplateType);
            }
          } catch (error) {}
        }

        const dto = {
          ...coverLetterData,
          jobDescriptionFileName: jdFilename,
          templateId: coverLetterData.templateId, // Ensure templateId is explicitly passed
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
            toast.success(t.clBuilder.messages.aiGenerated);
          } else {
            toast.error(t.clBuilder.messages.aiNoData);
          }
        } catch (error) {
          toast.error(t.clBuilder.messages.aiFailed);
        } finally {
          setIsExtracting(false);
          localStorage.removeItem("coverLetterData");
        }
      }
    };
    generateAiCv();
  }, [jdFilename, type, router]);

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
            toast.success(t.clBuilder.messages.extractedSuccess);
          }
        } catch (error) {
          toast.error(t.clBuilder.messages.extractedFailed);
        } finally {
          setIsExtracting(false);
        }
      }
    };

    extractData();
  }, [clFilename, jdFilename, templateId]);

  useEffect(() => {
    const fetchClData = async () => {
      if (clId) {
        try {
          const clData = await getCLById(clId);
          if (clData && clData.templateId) {
            const existingDate = clData.data.date;
            let formattedDate = "";
            if (existingDate) {
              const d = new Date(existingDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split("T")[0];
              }
            }

            const fetchedData = {
              ...clData.data,
              date: formattedDate || new Date().toISOString().split("T")[0],
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
        } catch (error) {}
      }
    };

    const fetchTemplateData = async () => {
      const finalTemplateId =
        searchParams.get("templateId") ||
        (localStorage.getItem("coverLetterData")
          ? JSON.parse(localStorage.getItem("coverLetterData")!).templateId
          : null);
      if (finalTemplateId) {
        try {
          const data = await getCLTemplateById(finalTemplateId);
          if (data) {
            setSelectedTemplateData(data);
            setTemplateName(data.title.toLowerCase() as TemplateType);
          }
        } catch (error) {}
      }
    };

    if (clId) {
      fetchClData();
    } else if (type === "generate-by-ai") {
      // In AI flow, we let generateAiCv handle template setting.
      // We can also call fetchTemplateData here as a fallback or primary.
      fetchTemplateData();
    } else if (templateId && !clFilename && !jdFilename) {
      fetchTemplateData();
    }
  }, [clId, templateId, clFilename, jdFilename, type, router]);

  useEffect(() => {
    const loadFromLocalStorage = async () => {
      // Check for data passed from uploadJD page via localStorage
      const coverLetterDataString = localStorage.getItem("coverLetterData");

      // Chỉ load từ localStorage nếu KHÔNG PHẢI là các trường hợp khác (edit CL cũ, extract file, hay AI generate flow cũ)
      if (
        coverLetterDataString &&
        !clId &&
        !clFilename &&
        !jdFilename &&
        type !== "generate-by-ai"
      ) {
        try {
          const coverLetterData = JSON.parse(coverLetterDataString);

          // Nếu có templateId trong data, fetch và set template
          if (coverLetterData.templateId) {
            const templateData = await getCLTemplateById(
              coverLetterData.templateId
            );
            if (templateData) {
              setSelectedTemplateData(templateData);
              setTemplateName(templateData.title.toLowerCase() as TemplateType);
            }
          }

          // Fill data vào form
          if (coverLetterData.data) {
            setLetterData((prev) => ({
              ...prev,
              ...coverLetterData.data,
              // Đảm bảo date không bị undefined
              date:
                coverLetterData.data.date ||
                new Date().toISOString().split("T")[0],
            }));
            // toast.success("Đã tải dữ liệu từ phân tích AI!");
          }
        } catch (e) {}
      }
    };
    loadFromLocalStorage();
  }, [clId, clFilename, jdFilename, type]);

  const getInitialData = () => {
    const currentDate = new Date().toISOString().split("T")[0];
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
        date: currentDate,
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
      date: currentDate,
      signature: `${firstName} ${lastName}`,
    };
  };

  useEffect(() => {
    const hasLocalStorageData = !!localStorage.getItem("coverLetterData");

    if (!clId && !clFilename && !jdFilename) {
      if (hasLocalStorageData && type !== "generate-by-ai") {
        return;
      }
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
  const [clTitle, setClTitle] = useState("Cover Letter for ...");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const el = templateDropdownRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setShowTemplatePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveCoverLetter = async (clDataToSave: LetterData, title: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (clId) {
        // Update existing CL
        await updateCL(clId, { data: clDataToSave, title: title });
        toast.success(t.clBuilder.messages.clUpdated);
        // UAT done: bỏ feedback, chuyển thẳng về trang tài liệu
        setTimeout(() => router.push("/myDocuments"), 800);
      } else if (templateId) {
        // Create new CL
        const newCL: CreateCLDto = {
          templateId: templateId,
          title: title,
          data: clDataToSave,
          isSaved: true,
        };
        await createCL(newCL);
        localStorage.removeItem("pendingCL");
        toast.success(t.clBuilder.messages.clSaved);
        // UAT done: bỏ feedback, chuyển thẳng về trang tài liệu
        setTimeout(() => router.push("/myDocuments"), 800);
      } else {
        toast.error(t.clBuilder.messages.templateNotSelected);
      }
    } catch (error) {
      toast.error(t.clBuilder.messages.clSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishLetter = () => {
    const token = Cookies.get("token");
    if (!token) {
      if (!templateId) {
        toast.error(t.clBuilder.messages.selectTemplateFirst);
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
      toast.error(t.clBuilder.titleModal.requiredTitle);
      return;
    }
    saveCoverLetter(letterData, clTitle.trim());
    setIsTitleModalOpen(false);
  };

  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleSave = () => setIsEditingTitle(false);

  const handleCityChange = async (cityValue: string, isRecipient: boolean) => {
    const fieldToUpdate = isRecipient ? "recipientCity" : "city";
    const districtFieldToUpdate = isRecipient ? "recipientState" : "state";

    handleInputChange(fieldToUpdate, cityValue);
    handleInputChange(districtFieldToUpdate, ""); // Reset district

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
    { id: "name", label: t.clBuilder.sidebar.nameContact, icon: "" },
    { id: "date", label: t.clBuilder.sidebar.date, icon: "" },
    { id: "recipient", label: t.clBuilder.sidebar.recipient, icon: "" },
    { id: "subject", label: t.clBuilder.sidebar.subject, icon: "" },
    { id: "greeting", label: t.clBuilder.sidebar.greeting, icon: "" },
    { id: "opening", label: t.clBuilder.sidebar.opening, icon: "" },
    { id: "body", label: t.clBuilder.sidebar.body, icon: "" },
    { id: "callToAction", label: t.clBuilder.sidebar.callToAction, icon: "" },
    { id: "closing", label: t.clBuilder.sidebar.closing, icon: "" },
  ];

  const renderModalContent = () => {
    switch (activeSection) {
      case "name":
        return (
          <div className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.firstName}
                </label>
                <input
                  type="text"
                  value={tempData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="e.g. John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.lastName}
                </label>
                <input
                  type="text"
                  value={tempData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="e.g. Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                {t.clBuilder.form.profession}
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

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.cityProvince}
                </label>
                <select
                  value={tempData.city || ""}
                  onChange={(e) => handleCityChange(e.target.value, false)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="">
                    {t.clBuilder.form.selectCityProvince}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.district}
                </label>
                <select
                  value={tempData.state || ""}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  disabled={!tempData.city}
                >
                  <option value="">{t.clBuilder.form.selectDistrict}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.phoneNumber}
                </label>
                <input
                  type="text"
                  value={tempData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="e.g. +415-555-5555"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  {t.clBuilder.form.email}
                </label>
                <input
                  type="email"
                  value={tempData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="e.g. johnsmith@gmail.com"
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
              {t.clBuilder.sidebar.date}
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
                  {t.clBuilder.form.firstName}
                </label>
                <input
                  type="text"
                  value={tempData.recipientFirstName || ""}
                  onChange={(e) =>
                    handleInputChange("recipientFirstName", e.target.value)
                  }
                  placeholder="e.g. John"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.clBuilder.form.lastName}
                </label>
                <input
                  type="text"
                  value={tempData.recipientLastName || ""}
                  onChange={(e) =>
                    handleInputChange("recipientLastName", e.target.value)
                  }
                  placeholder="e.g. Smith"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                {t.clBuilder.form.companyName}
              </label>
              <input
                type="text"
                value={tempData.companyName || ""}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="e.g. ACME Technologies"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.clBuilder.form.cityProvince}
                </label>
                <select
                  value={tempData.recipientCity || ""}
                  onChange={(e) => handleCityChange(e.target.value, true)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">
                    {t.clBuilder.form.selectCityProvince}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.clBuilder.form.district}
                </label>
                <select
                  value={tempData.recipientState || ""}
                  onChange={(e) =>
                    handleInputChange("recipientState", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={!tempData.recipientCity}
                >
                  <option value="">{t.clBuilder.form.selectDistrict}</option>
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
                  {t.clBuilder.form.phoneNumber}
                </label>
                <input
                  type="text"
                  value={tempData.recipientPhone || ""}
                  onChange={(e) =>
                    handleInputChange("recipientPhone", e.target.value)
                  }
                  placeholder="e.g. +415-555-5555"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {t.clBuilder.form.email}
                </label>
                <input
                  type="email"
                  value={tempData.recipientEmail || ""}
                  onChange={(e) =>
                    handleInputChange("recipientEmail", e.target.value)
                  }
                  placeholder="e.g. johnsmith@gmail.com"
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
              {t.clBuilder.form.subjectLine}
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
              {t.clBuilder.sidebar.greeting}
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
              {t.clBuilder.form.openingParagraph}
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
              {t.clBuilder.sidebar.body}
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
              {t.clBuilder.sidebar.callToAction}
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
                {t.clBuilder.sidebar.closing}
              </label>
              <input
                type="text"
                value={tempData.closing || ""}
                onChange={(e) => handleInputChange("closing", e.target.value)}
                placeholder="e.g. Sincerely,"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                {t.clBuilder.form.signature}
              </label>
              <input
                type="text"
                value={tempData.signature || ""}
                onChange={(e) => handleInputChange("signature", e.target.value)}
                placeholder="e.g. Duong Viet Duy"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );
      default:
        return <div>{t.clBuilder.sidebar.selectSection}</div>;
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // The input date is YYYY-MM-DD, which is interpreted as midnight UTC.
      // To prevent off-by-one day errors in different timezones, we can treat it as a local date.
      const date = new Date(`${dateString}T00:00:00`);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString; // Fallback if formatting fails
    }
  };

  const displayLetterData = {
    ...letterData,
    date: formatDateForDisplay(letterData.date),
  };

  const handleDownloadPdf = async () => {
    const input = letterPreviewRef.current;
    if (input) {
      try {
        const canvas = await html2canvas(input, {
          scale: 1.2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          // Fix lỗi text bị lệch/nhảy chữ khi có letter-spacing
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll(".tracking-wider");
            elements.forEach((el) => {
              (el as HTMLElement).style.letterSpacing = "normal";
            });
          },
        });

        // Tạo PDF chuẩn A4 (đơn vị mm)
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();

        // Tính toán chiều cao ảnh để vừa khít chiều rộng trang A4
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.8),
          "JPEG",
          0,
          0,
          pdfWidth,
          imgHeight
        );
        pdf.save(clTitle ? `${clTitle}.pdf` : "cover-letter.pdf");
      } catch (error) {
        toast.error(t.clBuilder.messages.pdfError);
      }
    }
  };

  if (isExtracting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t.clBuilder.loading.analyzingData}
        </h2>
        <p className="text-gray-600">{t.clBuilder.loading.processTakesTime}</p>
      </div>
    );
  }

  const templateOptions = Object.keys(templates) as TemplateType[];
  const selectedTemplateLabel =
    selectedTemplateData?.title ||
    (templateName
      ? templateName.charAt(0).toUpperCase() + templateName.slice(1)
      : "");

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
      <header
        className="bg-slate-900 text-white pt-28 pb-6 px-8 flex justify-between items-center"
        style={{ backgroundColor: "#0b1b34" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={clTitle}
                  onChange={(e) => setClTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-white"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleTitleEdit}
              >
                {clTitle}
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            disabled={isSaving}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={18} /> {t.clBuilder.buttons.goBack}
          </button>
          <button
            onClick={handleFinishLetter}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {isSaving
              ? t.clBuilder.buttons.saving
              : t.clBuilder.buttons.complete}{" "}
          </button>
        </div>
      </header>

      <main className="flex-grow flex">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white p-6 shadow-sm overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t.clBuilder.sidebar.sections}
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
        </aside>

        {/* Main Content (Letter Preview) */}
        <div className="flex-grow p-8 bg-gray-50 flex justify-center items-start">
          <div className="origin-top" ref={letterPreviewRef}>
            {TemplateComponent && (
              <TemplateComponent
                letterData={displayLetterData}
                onSectionClick={openModal}
              />
            )}
          </div>
        </div>

        {/* Right Actions Panel (giữ nguyên như cũ) */}
        <aside className="w-64 bg-white p-6 shadow-sm overflow-y-auto">
          <div className="space-y-4">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              onClick={handleDownloadPdf}
            >
              {t.clBuilder.buttons.download}
            </button>
          </div>
        </aside>
      </main>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
                {activeSection === "name" && (
                  <p className="text-gray-600">
                    {t.clBuilder.sidebar.enterContactInfo}
                  </p>
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
                {t.clBuilder.buttons.cancel}
              </button>
              <button
                onClick={saveChanges}
                className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
              >
                {t.clBuilder.buttons.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Modal */}
      {isTitleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl transform transition-all">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              {t.clBuilder.titleModal.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t.clBuilder.titleModal.description}
            </p>
            <input
              type="text"
              value={clTitle}
              onChange={(e) => setClTitle(e.target.value)}
              placeholder={t.clBuilder.titleModal.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsTitleModalOpen(false)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t.clBuilder.titleModal.back}
              </button>
              <button
                onClick={handleSaveWithTitle}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={!clTitle.trim() || isSaving}
              >
                {isSaving
                  ? t.clBuilder.titleModal.saving
                  : t.clBuilder.titleModal.continue}
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
