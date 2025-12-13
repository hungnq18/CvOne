"use client";

import {
  Country,
  District,
  getCountries,
  getDistrictsByProvinceCode,
  getProvinces,
  Province,
} from "@/api/locationApi";
import { useLanguage } from "@/providers/global_provider";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const personalInfoTranslations = {
  en: {
    heading: "What's the best way for employers to contact you?",
    subheading: "We suggest including an email and phone number.",
    requiredNotice: "* indicates a required field",
    firstName: "FIRST NAME",
    lastName: "LAST NAME",
    profession: "PROFESSION",
    city: "CITY/PROVINCE",
    state: "DISTRICT",
    phone: "PHONE NUMBER",
    email: "EMAIL ADDRESS",
    placeholder: {
      firstName: "First Name",
      lastName: "Last Name",
      profession: "e.g. Graphic Designer",
      city: "Select your city/province",
      state: "Select your district",
      phone: "e.g. +84123456789",
      email: "e.g. john.doe@email.com",
    },
    back: "Back",
    continue: "Continue",
    errors: {
      firstName: "First name is required",
      lastName: "Last name is required",
      emailRequired: "Email address is required",
      emailInvalid: "Please enter a valid email address",
      phoneInvalid: "Phone number must be between 7 and 15 digits",
    },
  },
  vi: {
    heading: "Cách tốt nhất để nhà tuyển dụng liên hệ với bạn là gì?",
    subheading: "Chúng tôi khuyên bạn nên cung cấp email và số điện thoại.",
    requiredNotice: "* là trường bắt buộc",
    firstName: "TÊN",
    lastName: "HỌ",
    profession: "NGHỀ NGHIỆP",
    city: "TỈNH/THÀNH PHỐ",
    state: "QUẬN/HUYỆN",
    phone: "SỐ ĐIỆN THOẠI",
    email: "ĐỊA CHỈ EMAIL",
    placeholder: {
      firstName: "Tên",
      lastName: "Họ",
      profession: "VD: Nhà thiết kế đồ họa",
      city: "Chọn tỉnh/thành phố",
      state: "Chọn quận/huyện",
      phone: "VD: +84123456789",
      email: "VD: john.doe@email.com",
    },
    back: "Quay lại",
    continue: "Tiếp tục",
    errors: {
      firstName: "Vui lòng nhập tên",
      lastName: "Vui lòng nhập họ",
      emailRequired: "Vui lòng nhập email",
      emailInvalid: "Email không hợp lệ",
      phoneInvalid: "Số điện thoại phải có từ 7 đến 15 chữ số",
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
    <div className="space-y-2 ">
      <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isDropdown ? (
        <div className="relative">
          <select
            value={formData[field as keyof typeof formData]}
            onChange={(e) => {
              if (field === "city") {
                handleProvinceChange(e.target.value);
              } else {
                handleInputChange(field, e.target.value);
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg bg-white appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors[field] ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading || (field === "state" && !selectedProvinceCode)}
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

function PersonalInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    city: "",
    state: "",
    countryCode: "+84",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const t = personalInfoTranslations[language];

  // Load provinces and countries on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [provincesData, countriesData] = await Promise.all([
          getProvinces(),
          getCountries(),
        ]);
        setProvinces(provincesData);
        setCountries(countriesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load data from localStorage and initialize the form
  useEffect(() => {
    if (provinces.length > 0) {
      const savedDataString = localStorage.getItem("coverLetterData");
      let coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

      const templateId = searchParams.get("templateId");
      if (templateId) {
        coverLetterData.templateId = templateId;
      }

      setFormData({
        firstName: coverLetterData.firstName || "",
        lastName: coverLetterData.lastName || "",
        profession: coverLetterData.profession || "",
        city: coverLetterData.city || "",
        state: coverLetterData.state || "",
        countryCode: coverLetterData.countryCode || "+84",
        phone: coverLetterData.phone || "",
        email: coverLetterData.email || "",
      });

      if (coverLetterData.city) {
        const selectedProvince = provinces.find(
          (p) => p.name === coverLetterData.city
        );
        if (selectedProvince) {
          setSelectedProvinceCode(selectedProvince.code);
        }
      }

      localStorage.setItem("coverLetterData", JSON.stringify(coverLetterData));
    }
  }, [provinces, searchParams]);

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
    if (field === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 15) {
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

    handleInputChange("city", value);
    // Reset state when city changes
    handleInputChange("state", "");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim())
      newErrors.firstName = t.errors.firstName;
    if (!formData.lastName.trim()) newErrors.lastName = t.errors.lastName;
    if (!formData.email.trim()) newErrors.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }
    if (formData.phone.trim() && !/^\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = t.errors.phoneInvalid;
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

    router.push(`/recipent-info`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen pt-20 bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
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
              field="firstName"
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
              field="lastName"
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

          {/* Profession */}
          <InputField
            label={t.profession}
            field="profession"
            placeholder={t.placeholder.profession}
            formData={formData}
            handleInputChange={handleInputChange}
            handleProvinceChange={handleProvinceChange}
            errors={errors}
            loading={loading}
            selectedProvinceCode={selectedProvinceCode}
          />

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t.city}
              field="city"
              placeholder={t.placeholder.city}
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
              field="state"
              placeholder={t.placeholder.state}
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

          {/* Phone and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                {t.phone}
              </label>
              <div className="flex gap-2">
                <div className="relative w-32">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange("countryCode", e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg bg-white appearance-none pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.countryCode ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.phoneCode}>
                        {country.flag} {country.phoneCode}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t.placeholder.phone}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <InputField
              label={t.email}
              field="email"
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

export default function PersonalInfoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonalInfoContent />
    </Suspense>
  );
}
