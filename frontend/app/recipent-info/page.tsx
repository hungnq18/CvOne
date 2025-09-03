"use client";

import {
  District,
  getDistrictsByProvinceCode,
  getProvinces,
  Province,
} from "@/api/locationApi";
import { useLanguage } from "@/providers/global-provider";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const recipientInfoTranslations = {
  en: {
    heading: "Who are you writing to?",
    subheading: "Enter the recipient's information for your cover letter.",
    requiredNotice: "* indicates a required field",
    firstName: "FIRST NAME",
    lastName: "LAST NAME",
    companyName: "COMPANY NAME",
    city: "CITY/PROVINCE",
    state: "DISTRICT",
    phone: "PHONE NUMBER",
    email: "EMAIL ADDRESS",
    placeholder: {
      firstName: "Recipient's First Name",
      lastName: "Recipient's Last Name",
      companyName: "e.g. Google, Microsoft",
      city: "Select city/province",
      state: "Select district",
      phone: "e.g. +84123456789",
      email: "recipient.email@example.com",
    },
    back: "Back",
    continue: "Continue",
    errors: {
      firstName: "First name is required",
      lastName: "Last name is required",
      companyName: "Company name is required",
      emailRequired: "Email address is required",
      emailInvalid: "Please enter a valid email address",
      phoneInvalid: "Phone number must be 10 digits",
    },
  },
  vi: {
    heading: "Bạn đang viết thư cho ai?",
    subheading: "Nhập thông tin người nhận cho thư xin việc của bạn.",
    requiredNotice: "* là trường bắt buộc",
    firstName: "TÊN",
    lastName: "HỌ",
    companyName: "TÊN CÔNG TY",
    city: "TỈNH/THÀNH PHỐ",
    state: "QUẬN/HUYỆN",
    phone: "SỐ ĐIỆN THOẠI",
    email: "ĐỊA CHỈ EMAIL",
    placeholder: {
      firstName: "Tên người nhận",
      lastName: "Họ người nhận",
      companyName: "VD: Google, Microsoft",
      city: "Chọn tỉnh/thành phố",
      state: "Chọn quận/huyện",
      phone: "VD: +84123456789",
      email: "nguoinhan@email.com",
    },
    back: "Quay lại",
    continue: "Tiếp tục",
    errors: {
      firstName: "Vui lòng nhập tên",
      lastName: "Vui lòng nhập họ",
      companyName: "Vui lòng nhập tên công ty",
      emailRequired: "Vui lòng nhập email",
      emailInvalid: "Email không hợp lệ",
      phoneInvalid: "Số điện thoại phải có 10 chữ số",
    },
  },
};

const InputField = ({
  label,
  field,
  formData,
  handleInputChange,
  handleProvinceChange,
  errors,
  loading,
  selectedProvinceCode,
  options = [],
  placeholder,
  required = false,
  type = "text",
  isDropdown = false,
}: {
  label: string;
  field: string;
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  handleProvinceChange: (value: string) => void;
  errors: { [key: string]: string };
  loading: boolean;
  selectedProvinceCode: number | null;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  type?: string;
  isDropdown?: boolean;
}) => {
  return (
    <div className="space-py-8">
      <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isDropdown ? (
        <div className="relative">
          <select
            value={formData[field as keyof typeof formData]}
            onChange={(e) => {
              if (field === "recipientCity") {
                handleProvinceChange(e.target.value);
              } else {
                handleInputChange(field, e.target.value);
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg bg-white appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors[field] ? "border-red-500" : "border-gray-300"
            }`}
            disabled={
              loading || (field === "recipientState" && !selectedProvinceCode)
            }
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      ) : (
        <input
          type={type}
          value={formData[field as keyof typeof formData]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[field] ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );
};

function RecipentInfoContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    recipientFirstName: "",
    recipientLastName: "",
    companyName: "",
    recipientCity: "",
    recipientState: "",
    recipientPhone: "",
    recipientEmail: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);

  const { language } = useLanguage();
  const t = recipientInfoTranslations[language];
  const [loading, setLoading] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      try {
        const provincesData = await getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // Load data from localStorage and initialize the form
  useEffect(() => {
    if (provinces.length > 0) {
      const savedDataString = localStorage.getItem("coverLetterData");
      if (savedDataString) {
        const coverLetterData = JSON.parse(savedDataString);
        setFormData({
          recipientFirstName: coverLetterData.recipientFirstName || "",
          recipientLastName: coverLetterData.recipientLastName || "",
          companyName: coverLetterData.companyName || "",
          recipientCity: coverLetterData.recipientCity || "",
          recipientState: coverLetterData.recipientState || "",
          recipientPhone: coverLetterData.recipientPhone || "",
          recipientEmail: coverLetterData.recipientEmail || "",
        });

        if (coverLetterData.recipientCity) {
          const selectedProvince = provinces.find(
            (p) => p.name === coverLetterData.recipientCity
          );
          if (selectedProvince) {
            setSelectedProvinceCode(selectedProvince.code);
          }
        }
      }
    }
  }, [provinces]);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvinceCode) {
        try {
          const districtsData = await getDistrictsByProvinceCode(
            selectedProvinceCode
          );
          setDistricts(districtsData);
        } catch (error) {
          console.error("Error loading districts:", error);
        }
      } else {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [selectedProvinceCode]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "recipientPhone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [field]: numericValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find((p) => p.name === value);
    setSelectedProvinceCode(selectedProvince ? selectedProvince.code : null);

    handleInputChange("recipientCity", value);
    // Reset state when city changes
    handleInputChange("recipientState", "");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.recipientFirstName.trim())
      newErrors.recipientFirstName = "First name is required";
    if (!formData.recipientLastName.trim())
      newErrors.recipientLastName = "Last name is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.recipientEmail.trim())
      newErrors.recipientEmail = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = "Please enter a valid email address";
    }

    if (
      formData.recipientPhone.trim() &&
      !/^\d{10}$/.test(formData.recipientPhone)
    ) {
      newErrors.recipientPhone = t.errors.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    const savedDataString = localStorage.getItem("coverLetterData");
    const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

    const updatedData = { ...coverLetterData, ...formData };
    localStorage.setItem("coverLetterData", JSON.stringify(updatedData));

    router.push(`/strengths`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-pb-14">
          <h1 className="text-2xl font-bold text-gray-900">{t.heading}</h1>
          <p className="text-gray-600">{t.subheading}</p>
        </div>

        {/* Required Field Notice */}
        <div className="text-sm text-gray-600">
          <span className="text-red-500">*</span> {t.requiredNotice}
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t.firstName}
              field="recipientFirstName"
              placeholder={t.placeholder.firstName}
              required
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
            <InputField
              label={t.lastName}
              field="recipientLastName"
              placeholder={t.placeholder.lastName}
              required
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
          </div>

          {/* Company */}
          <InputField
            label={t.companyName}
            field="companyName"
            placeholder={t.placeholder.companyName}
            required
            formData={formData}
            handleInputChange={handleInputChange}
            handleProvinceChange={handleProvinceChange}
            errors={errors}
            loading={loading}
            selectedProvinceCode={selectedProvinceCode}
          />

          {/* Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t.city}
              field="recipientCity"
              placeholder={
                loading ? "Loading provinces..." : t.placeholder.city
              }
              isDropdown
              options={provinces.map((p) => p.name)}
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
            <InputField
              label={t.state}
              field="recipientState"
              placeholder={
                !selectedProvinceCode ? t.placeholder.city : t.placeholder.state
              }
              isDropdown
              options={districts.map((d) => d.name)}
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t.phone}
              field="recipientPhone"
              placeholder={t.placeholder.phone}
              type="tel"
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
            <InputField
              label={t.email}
              field="recipientEmail"
              placeholder={t.placeholder.email}
              type="email"
              required
              formData={formData}
              handleInputChange={handleInputChange}
              handleProvinceChange={handleProvinceChange}
              errors={errors}
              loading={loading}
              selectedProvinceCode={selectedProvinceCode}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
          >
            {t.continue}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecipentInfoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipentInfoContent />
    </Suspense>
  );
}
