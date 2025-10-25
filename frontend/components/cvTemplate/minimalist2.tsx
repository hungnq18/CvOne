"use client";


import { Award, Briefcase, Globe, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type React from "react";

// --- TRANSLATIONS ---
const translations = {
  en: {
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    contactLabel: "CONTACT",
    careerObjectiveLabel: "CAREER OBJECTIVE",
    skillsLabel: "SKILLS",
    referenceLabel: "REFERENCE",
    experienceLabel: "RELATED EXPERIENCE",
    educationLabel: "EDUCATION",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    website: "Website:",
    present: "Present",
    major: "Major:",
    degree: "Degree:",
    defaultProfessional: "Professional",
    introLabel: "Introduction",
  },
  vi: {
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    contactLabel: "LIÊN LẠC",
    careerObjectiveLabel: "MỤC TIÊU NGHỀ NGHIỆP",
    skillsLabel: "KỸ NĂNG",
    referenceLabel: "REFERENCE",
    experienceLabel: "KINH NGHIỆM LIÊN QUAN",
    educationLabel: "HỌC VẤN",
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    website: "Website:",
    present: "Hiện tại",
    major: "Chuyên ngành:",
    degree: "Bằng cấp:",
    defaultProfessional: "Chuyên gia",
    introLabel: "Giới thiệu",
  },
};

// --- PROPS INTERFACES ---
interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
}

interface Minimalist2Props {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
  cvUiTexts?: any;
}

// --- HOVERABLE WRAPPER COMPONENT ---
const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  isPdfMode = false,
}) => {
  if (isPdfMode) {
    return <>{children}</>;
  }

  const hoverEffectMap: { [key: string]: string } = {
    avatar: "hover:shadow-2xl",
    contact: "hover:shadow-lg",
    skills: "hover:shadow-lg",
    reference: "hover:shadow-lg",
    info: "hover:shadow-xl",
    intro: "hover:shadow-lg",
    experience: "hover:shadow-lg",
    education: "hover:shadow-lg",
  };

  const hoverClass = hoverEffectMap[sectionId] || "";
  const borderRadiusClass =
    sectionId === "avatar" ? "rounded-full" : "rounded-lg";
  const labelPositionClass =
    sectionId === "avatar"
      ? "top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+8px)]"
      : "top-2 right-2";

  const labelRoundedClass = sectionId === "avatar" ? "rounded-lg" : "rounded";

  const finalClassName = `
    relative group cursor-pointer transition-all duration-300 ease-in-out
    ${hoverClass}
  `;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      <div
        className={`absolute inset-0 ${borderRadiusClass} border-2 border-green-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
      ></div>
      <div
        className={`absolute ${labelPositionClass} bg-green-600 text-white text-xs font-bold tracking-wider px-3 py-1.5 ${labelRoundedClass} opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg z-10 text-center whitespace-nowrap`}
      >
        {label}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Minimalist2: React.FC<Minimalist2Props> = ({
  data,
  onSectionClick,
  isPdfMode = false,
  language,
  cvUiTexts
}) => {
  const lang = language || "en";
  const defaultT = translations[lang as "en" | "vi"];
  
  // Merge với cvUiTexts từ prop
  const t = {
    ...defaultT,
    ...(cvUiTexts && {
      contactLabel: cvUiTexts.contact || defaultT.contactLabel,
      careerObjectiveLabel: cvUiTexts.careerObjective || defaultT.careerObjectiveLabel,
      skillsLabel: cvUiTexts.skills || defaultT.skillsLabel,
      experienceLabel: cvUiTexts.workExperience || defaultT.experienceLabel,
      educationLabel: cvUiTexts.education || defaultT.educationLabel,
      // personalInfoLabel: cvUiTexts.personalInformation || defaultT.personalInfoLabel,
    })
  };

  const userData = data?.userData || {};
  const professionalTitle = userData.professional || t.defaultProfessional;

  const sectionMap = {
    avatar: "avatar",
    info: "info",
    contact: "contact",
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
  };

  const renderDescription = (desc: string) => {
    if (!desc) return null;
    const lines = desc
      .split(".")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return (
      <ul className="list-disc pl-4 space-y-1 text-xs leading-snug text-gray-700">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col lg:flex-row shadow-2xl  mx-auto">
      {/* --- LEFT SIDEBAR (BEIGE) --- */}
      <div className="w-full lg:w-[38%] bg-gradient-to-br from-green-50 to-green-100/50 flex flex-col gap-8 py-10 relative border-r-4 border-green-700">
        {/* Avatar Section */}
        <div className="px-8 lg:px-10">
          <div className="flex justify-center mb-2">
            <HoverableWrapper
              label={t.avatarLabel}
              sectionId={sectionMap.avatar}
              onClick={onSectionClick}
              isPdfMode={isPdfMode}
            >
              <div className="w-36 h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-white border-6 border-white shadow-2xl ring-4 ring-green-700/20">
                {isPdfMode ? (
                  <img
                    src={userData.avatar || "/avatar-female.png"}
                    alt={`${userData.firstName || ""} ${
                      userData.lastName || ""
                    }`}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={userData.avatar || "/avatar-female.png"}
                    alt={`${userData.firstName || ""} ${
                      userData.lastName || ""
                    }`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </HoverableWrapper>
          </div>
        </div>

        {/* Contact Section */}
        <HoverableWrapper
          label={t.contactLabel}
          sectionId={sectionMap.contact}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-green-700 rounded-full"></div>
              <h2 className="text-lg font-bold tracking-wider text-green-900">
                {t.contactLabel}
              </h2>
            </div>
            <div className="space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-sm break-words text-gray-800 font-medium">
                    {userData.email}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-sm text-gray-800 font-medium">
                    {userData.phone}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-sm text-gray-800 font-medium">
                    {userData.city}, {userData.country}
                  </span>
                </div>
              </div>
              {userData.website && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-sm break-words text-gray-800 font-medium">
                      {userData.website}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </HoverableWrapper>

        {/* Career Objective Section */}
        {userData.summary && (
          <HoverableWrapper
            label={t.careerObjectiveLabel}
            sectionId={sectionMap.summary}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="px-8 lg:px-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 bg-green-700 rounded-full"></div>
                <h2 className="text-lg font-bold tracking-wider text-green-900">
                  {t.careerObjectiveLabel}
                </h2>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {userData.summary}
                </p>
              </div>
            </div>
          </HoverableWrapper>
        )}

        {/* Skills Section */}
        {userData.skills?.length > 0 && (
          <HoverableWrapper
            label={t.skillsLabel}
            sectionId={sectionMap.skills}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="w-full max-w-4xl mx-auto p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-green-700 rounded-full" />
                  <h2 className="text-lg font-bold tracking-wider text-green-900">
                    SKILLS
                  </h2>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md">
                <div className="space-y-4">
                  {userData.skills.map((skill: any, i: number) => {
                    const rating = Math.max(
                      0,
                      Math.min(5, Number(skill.rating || 0))
                    );
                    const width = `${(rating / 5) * 100}%`;
                    return (
                      <div key={i} className="group">
                        <div className="flex items-start justify-between gap-6 mb-3">
                          <span className="text-sm text-gray-800 font-medium leading-relaxed">
                            {skill.name}
                          </span>
                          <span className="text-green-800 text-xs font-semibold whitespace-nowrap">
                            {rating}/5
                          </span>
                        </div>
                        <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out group-hover:from-green-600 group-hover:to-green-700 group-hover:shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </HoverableWrapper>
        )}
      </div>

      {/* --- RIGHT CONTENT AREA (WHITE) --- */}
      <div className="w-full lg:w-[62%] bg-white">
        {/* Name and Title Section with Green Header */}
        <HoverableWrapper
          label={t.fullNameAndTitleLabel}
          sectionId={sectionMap.info}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="bg-gradient-to-r from-green-700 to-green-800 px-8 lg:px-12 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight leading-none mb-1">
                {userData.firstName}
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight leading-none mb-3">
                {userData.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1 w-12 bg-lime-500 rounded-full"></div>
                <p className="text-base lg:text-lg font-semibold tracking-widest text-lime-100 uppercase">
                  {professionalTitle}
                </p>
              </div>
            </div>
          </div>
        </HoverableWrapper>

        {/* Experience Section */}
        <HoverableWrapper
          label={t.experienceLabel}
          sectionId={sectionMap.experience}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 uppercase">
                {t.experienceLabel}
              </h2>
            </div>
            <div className="space-y-4">
              {(userData.workHistory || []).map((job: any, i: number) => (
                <div
                  key={i}
                  className="relative pl-6 pb-4 last:pb-0 border-l-2 border-green-200 last:border-l-0"
                >
                  <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-lime-500 -translate-x-[7px] ring-4 ring-white"></div>
                  <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-1 mb-2">
                      <h3 className="font-bold text-lg text-green-900">
                        {job.title}
                      </h3>
                      <span className="text-sm font-semibold text-gray-600 bg-green-50 px-3 py-1 rounded-full shrink-0">
                        {job.startDate?.slice(5, 7)}/
                        {job.startDate?.slice(0, 4)} -{" "}
                        {job.isCurrent ||
                        job.endDate === "Present" ||
                        job.endDate === "Hiện tại"
                          ? t.present
                          : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(
                              0,
                              4
                            )}`}
                      </span>
                    </div>
                    <h4 className="font-semibold text-base text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-lime-500"></div>
                      {job.company}
                    </h4>
                    {renderDescription(job.description)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HoverableWrapper>

        {/* Education Section */}
        <HoverableWrapper
          label={t.educationLabel}
          sectionId={sectionMap.education}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12 py-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 uppercase">
                {t.educationLabel}
              </h2>
            </div>
            <div className="space-y-4">
              {(userData.education || []).map((edu: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-lime-500"
                >
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {edu.major} - {edu.institution}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">{t.degree}</span>{" "}
                    {edu.degree}
                  </p>
                  <p className="text-sm font-medium text-green-700">
                    {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </HoverableWrapper>
      </div>
    </div>
  );
};

export default Minimalist2;
