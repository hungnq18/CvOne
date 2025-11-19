"use client";

import Image from "next/image";
import React from "react";
import { getDefaultSectionPositions } from "./defaultSectionPositions";

// --- TRANSLATIONS ---
const translations = {
  en: {
    workExperience: "WORK EXPERIENCE",
    education: "EDUCATION",
    personalInfo: "PERSONAL INFORMATION",
    careerObjective: "CAREER OBJECTIVE",
    skills: "SKILLS",
    personalInfoLower: "Personal Information",
    careerObjectiveLower: "Career Objective",
    skillsLower: "Skills",
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    present: "Present",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    defaultProfessional: "Professional",
  },
  vi: {
    workExperience: "KINH NGHIỆM LÀM VIỆC",
    education: "HỌC VẤN",
    personalInfo: "THÔNG TIN CÁ NHÂN",
    careerObjective: "MỤC TIÊU SỰ NGHIỆP",
    skills: "KỸ NĂNG",
    personalInfoLower: "Thông tin cá nhân",
    careerObjectiveLower: "Mục tiêu sự nghiệp",
    skillsLower: "Kỹ năng",
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    present: "Hiện tại",
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    defaultProfessional: "Chuyên gia",
  },
};

// --- PROPS ---
interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  className?: string;
  isPdfMode?: boolean;
}

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
}

interface CVTemplateProps {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
}

// --- COMPONENTS ---
const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  className,
  isPdfMode = false,
}) => {
  if (isPdfMode) {
    return <>{children}</>;
  }

  const hoverEffectMap: { [key: string]: string } = {
    experience: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    education: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    info: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    contact: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    summary: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    skills: "hover:scale-105 hover:bg-gray-50 hover:shadow-lg",
    avatar: "hover:scale-105",
  };

  const finalClassName = `
    relative group cursor-pointer transition-all duration-300 ease-in-out
    ${hoverEffectMap[sectionId] || ""}
    ${className || ""}
  `;

  const isAvatar = sectionId === "avatar";
  const showBorder = !isPdfMode;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      {showBorder && (
        <>
          <div
            className={`absolute inset-0 border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
              isAvatar ? "rounded-full" : "rounded-lg"
            }`}
          ></div>
          <div
            className="absolute bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
            style={
              isAvatar
                ? {
                    top: "-2px",
                    left: "-15%",
                    borderRadius: "4px 10px 4px 10px",
                    marginTop: "-6%",
                  }
                : {
                    top: "0",
                    left: "1%",
                    transform: "translateY(-50%)",
                    borderRadius: "4px 10px 0 0",
                    marginTop: "-2%",
                  }
            }
          >
            {label}
          </div>
        </>
      )}
    </div>
  );
};

const renderDescription = (desc: string) => {
  if (!desc) return null;
  const lines = desc
    .split(".")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return (
    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
      {lines.map((line, idx) => (
        <li key={idx}>{line}</li>
      ))}
    </ul>
  );
};

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  children,
  sectionId,
  onSectionClick,
  isPdfMode = false,
}) => {
  return (
    <div className="mb-10">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
            {title}
          </h2>
          <div className="space-y-8">{children}</div>
        </div>
      </HoverableWrapper>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CVTemplateInspired: React.FC<CVTemplateProps> = ({
  data,
  onSectionClick,
  isPdfMode = false,
  language,
}) => {
  const lang = language || "en";
  const t = translations[lang as "en" | "vi"];
  const userData = data?.userData || {};

  const sectionMap = {
    info: "info",
    contact: "contact",
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
    avatar: "avatar",
  };

  // --- Logic lấy vị trí ---
  const sectionPositions =
    data?.sectionPositions ||
    getDefaultSectionPositions(data?.templateTitle || "The Vanguard");

  type SectionPosition = { place: number; order: number };

  // Phân loại section theo Place để giữ đúng layout
  // PLACE 1: Header Area (Avatar + Info)
  const headerSections = Object.entries(sectionPositions)
    .filter(([_, pos]) => (pos as SectionPosition).place === 1)
    .sort(([, a], [, b]) => (a as SectionPosition).order - (b as SectionPosition).order)
    .map(([key]) => key);

  // PLACE 3: Main Content Area (Experience, Education) - Dưới Header bên trái
  const mainSections = Object.entries(sectionPositions)
    .filter(([_, pos]) => (pos as SectionPosition).place === 3)
    .sort(([, a], [, b]) => (a as SectionPosition).order - (b as SectionPosition).order)
    .map(([key]) => key);

  // PLACE 2: Sidebar Area (Contact, Summary, Skills) - Cột phải
  const sidebarSections = Object.entries(sectionPositions)
    .filter(([_, pos]) => (pos as SectionPosition).place === 2)
    .sort(([, a], [, b]) => (a as SectionPosition).order - (b as SectionPosition).order)
    .map(([key]) => key);

  // --- Hàm Render ---
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      // --- HEADER ITEMS ---
      case "avatar":
        return (
          <div key="avatar" className="mt-4 ml-8 relative w-40 h-40 flex-shrink-0">
            <HoverableWrapper
              label={t.avatarLabel}
              sectionId={sectionMap.avatar}
              onClick={onSectionClick}
              className="w-full h-full"
              isPdfMode={isPdfMode}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/80">
                <div className="w-full h-full relative aspect-square">
                  {isPdfMode ? (
                    <img
                      src={userData.avatar || "/avatar-female.png"}
                      alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
                      crossOrigin="anonymous"
                      className="rounded-full w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={userData.avatar || "/avatar-female.png"}
                      alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-full"
                    />
                  )}
                </div>
              </div>
            </HoverableWrapper>
          </div>
        );

      case "info":
        return (
          <div key="info" className="w-full">
            <HoverableWrapper
              label={t.fullNameAndTitleLabel}
              sectionId={sectionMap.info}
              onClick={onSectionClick}
              className="w-full"
              isPdfMode={isPdfMode}
            >
              <h1 className="pt-12 pr-6 pl-6 text-4xl lg:text-5xl font-bold text-gray-900 uppercase">
                {userData.firstName} {userData.lastName}
              </h1>
              <h2 className="pb-6 pr-6 pl-6 text-xl lg:text-2xl text-gray-600 mt-2">
                {userData.professional || t.defaultProfessional}
              </h2>
            </HoverableWrapper>
          </div>
        );

      // --- MAIN CONTENT ITEMS (Place 3) ---
      case "experience":
        return (
          <SectionWrapper
            key="experience"
            title={t.workExperience}
            sectionId={sectionMap.experience}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            {(userData.workHistory || []).map((job: any, i: number) => (
              <div key={job.id || i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                  <span className="text-sm font-medium text-gray-600 shrink-0 ml-4">
                    {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                    {job.isCurrent || job.endDate == "Present" || job.endDate == "Hiện tại"
                      ? t.present
                      : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                  </span>
                </div>
                <h4 className="font-semibold text-md text-gray-700 mb-1">
                  {job.company}
                </h4>
                {renderDescription(job.description)}
              </div>
            ))}
          </SectionWrapper>
        );

      case "education":
        return (
          <SectionWrapper
            key="education"
            title={t.education}
            sectionId={sectionMap.education}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            {(userData.education || []).map((edu: any, i: number) => (
              <div key={edu.id || i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-lg">{edu.institution}</h3>
                  <span className="text-sm font-medium text-gray-600 shrink-0 ml-4">
                    {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </span>
                </div>
                <h4 className="font-semibold text-md text-gray-700">
                  {edu.degree} - {edu.major}
                </h4>
              </div>
            ))}
          </SectionWrapper>
        );

      // --- SIDEBAR ITEMS (Place 2) ---
      case "contact":
        return (
          <div key="contact" className="mb-10 w-[calc(100%+48px)] -ml-6">
            <HoverableWrapper
              label={t.personalInfo}
              sectionId={sectionMap.contact}
              onClick={onSectionClick}
              className="p-4 relative"
              isPdfMode={isPdfMode}
            >
              <h2 className="pt-4 pl-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
                {t.personalInfoLower}
              </h2>
              <div className="pl-4 pb-4 space-y-4 text-gray-700">
                <div>
                  <strong className="font-semibold block">{t.phone}</strong>
                  <span>{userData.phone}</span>
                </div>
                <div>
                  <strong className="font-semibold block">{t.email}</strong>
                  <span className="break-words">{userData.email}</span>
                </div>
                <div>
                  <strong className="font-semibold block">{t.address}</strong>
                  <span>
                    {userData.city}, {userData.country}
                  </span>
                </div>
              </div>
            </HoverableWrapper>
          </div>
        );

      case "summary":
        return (
          <div key="summary" className="mb-10 w-[calc(100%+48px)] -ml-6">
            <HoverableWrapper
              label={t.careerObjective}
              sectionId={sectionMap.summary}
              onClick={onSectionClick}
              className="p-4 relative"
              isPdfMode={isPdfMode}
            >
              <h2 className="pt-4 pl-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b-2 border-gray-300">
                {t.careerObjectiveLower}
              </h2>
              <p className="pl-4 pr-4 pb-4 text-gray-700 leading-relaxed">
                {userData.summary}
              </p>
            </HoverableWrapper>
          </div>
        );

      case "skills":
        return (
          userData.skills?.length > 0 && (
            <div key="skills" className="mb-10 w-[calc(100%+48px)] -ml-6">
              <HoverableWrapper
                label={t.skills}
                sectionId={sectionMap.skills}
                onClick={onSectionClick}
                className="p-4 relative"
                isPdfMode={isPdfMode}
              >
                <h2 className="pl-4 pt-4 text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                  {t.skillsLower}
                </h2>

                <div className="pl-4 pr-4 pb-4 space-y-6 text-gray-700">
                  {userData.skills.map((skill: any, i: number) => {
                    const rating = Math.max(
                      0,
                      Math.min(5, Number(skill.rating || 0))
                    );
                    const width = `${(rating / 5) * 100}%`;
                    return (
                      <div key={i} className="group">
                        <div className="flex items-center justify-between gap-6 mb-2">
                          <span className="text-gray-800 font-medium transition-colors group-hover:text-gray-600">
                            {skill.name}
                          </span>
                          <span className="text-gray-900 text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
                            {rating}/5
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full transition-all duration-300 group-hover:from-gray-600 group-hover:to-gray-700 group-hover:shadow-lg group-hover:shadow-gray-500/50"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </HoverableWrapper>
            </div>
          )
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col-reverse lg:flex-row min-h-screen">
      {/* --- CỘT TRÁI (Main Content) 65% --- */}
      <div className="w-full lg:w-[65%]">
        {/* Header Area (Place 1) - Được giữ trong flex container */}
        <div className="flex items-center gap-6 mb-12">
          {headerSections.map((id) => renderSection(id))}
        </div>

        {/* Main Body (Place 3) */}
        {mainSections.map((id) => renderSection(id))}
      </div>

      {/* --- CỘT PHẢI (Sidebar) 35% --- */}
      {/* Place 2 */}
      <div className="w-full lg:w-[35%] bg-gray-50 p-4 lg:p-8">
        {sidebarSections.map((id) => renderSection(id))}
      </div>
    </div>
  );
};

export default CVTemplateInspired;