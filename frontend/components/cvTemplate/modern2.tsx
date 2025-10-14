"use client";

import Image from "next/image";
import type React from "react";

// BƯỚC 1: Import hook để lấy ngôn ngữ
const translations = {
  en: {
    // Labels for HoverableWrapper
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    personalInfoLabel: "PERSONAL INFORMATION",
    careerObjectiveLabel: "CAREER OBJECTIVE",
    skillsLabel: "SKILLS",
    experienceLabel: "WORK EXPERIENCE",
    educationLabel: "EDUCATION",
    // Content
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    dateOfBirth: "Date of Birth:",
    gender: "Gender:",
    present: "Present",
    major: "MAJOR:",
    degree: "Degree:",
    defaultProfessional: "Professional",
  },
  vi: {
    // Labels for HoverableWrapper
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    personalInfoLabel: "THÔNG TIN CÁ NHÂN",
    careerObjectiveLabel: "MỤC TIÊU NGHỀ NGHIỆP",
    skillsLabel: "KỸ NĂNG",
    experienceLabel: "KINH NGHIỆP LÀM VIỆC",
    educationLabel: "HỌC VẤN",
    // Content
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    dateOfBirth: "Ngày sinh:",
    gender: "Giới tính:",
    present: "Hiện tại",
    major: "CHUYÊN NGÀNH:",
    degree: "Bằng cấp:",
    defaultProfessional: "Chuyên gia",
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

interface SectionProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
}

interface Modern2Props {
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
  isPdfMode = false,
}) => {
  if (isPdfMode) {
    return <>{children}</>;
  }

  const hoverEffectMap: { [key: string]: string } = {
    header: "hover:shadow-lg",
    info: "hover:shadow-lg",
    summary: "hover:shadow-lg",
    education: "hover:shadow-lg",
    experience: "hover:shadow-lg",
  };

  const hoverClass = hoverEffectMap[sectionId] || "";

  const finalClassName = `
    relative group cursor-pointer rounded-lg transition-all duration-300 ease-in-out
    ${hoverClass}
  `;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="absolute top-0 left-6 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold tracking-wider px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-full shadow-md">
        {label}
      </div>
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
    <ul className="space-y-2 text-base leading-relaxed">
      {lines.map((line, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="text-primary mt-1.5 shrink-0">•</span>
          <span className="text-foreground">{line}</span>
        </li>
      ))}
    </ul>
  );
};

const Section: React.FC<SectionProps> = ({
  title,
  children,
  sectionId,
  onSectionClick,
  isPdfMode = false,
}) => {
  return (
    <div className="mb-6">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
      >
        <div className="bg-card rounded-xl p-8 shadow-md border-2 border-border elegant-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>

          <div className="mb-4 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight">
                {title}
              </h2>
            </div>
            <div className="ml-6 w-20 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          <div className="text-card-foreground relative z-10">{children}</div>
        </div>
      </HoverableWrapper>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Modern2: React.FC<Modern2Props> = ({
  data,
  onSectionClick,
  isPdfMode = false,
  language,
}) => {
  const lang = language || "vi";
  const t = translations[lang as "en" | "vi"];

  const userData = data?.userData || {};
  const professionalTitle = userData.professional || t.defaultProfessional;

  const sectionMap = {
    header: "info",
    contact: "contact",
    summary: "summary",
    education: "education",
    experience: "experience",
    skills: "skills",
  };

  const styles = `
    .professional-card {
      transition: all 0.3s ease;
    }

    .professional-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .section-divider {
      height: 2px;
      background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, transparent 100%);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="bg-slate-50 min-h-screen font-sans">
        <div className="max-w-4xl mx-auto bg-white shadow-sm">
          {/* HEADER SECTION - Professional Layout */}
          <HoverableWrapper
            label={t.fullNameAndTitleLabel}
            sectionId={sectionMap.header}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
              <div className="flex items-center gap-8">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {isPdfMode ? (
                      <img
                        src={
                          userData.avatar || "/professional-woman-portrait.png"
                        }
                        alt={`${userData.firstName || ""} ${
                          userData.lastName || ""
                        }`}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={
                          userData.avatar || "/professional-woman-portrait.png"
                        }
                        alt={`${userData.firstName || ""} ${
                          userData.lastName || ""
                        }`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Name and Title */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-blue-300 text-base font-medium tracking-wide uppercase">
                    {professionalTitle}
                  </p>
                </div>
              </div>
            </div>
          </HoverableWrapper>

          {/* PERSONAL INFO BAR */}
          <HoverableWrapper
            label={t.personalInfoLabel}
            sectionId={sectionMap.contact}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="bg-slate-100 px-8 py-4 border-b-2 border-blue-600">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {userData.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-slate-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {userData.dateOfBirth}
                    </span>
                  </div>
                )}
                {userData.gender && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-slate-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {userData.gender}
                    </span>
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-slate-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {userData.phone}
                    </span>
                  </div>
                )}
                {userData.email && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-slate-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-slate-700 font-medium break-all">
                      {userData.email}
                    </span>
                  </div>
                )}
                {(userData.city || userData.country) && (
                  <div className="flex items-center gap-3 col-span-2">
                    <svg
                      className="w-4 h-4 text-slate-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {userData.city}
                      {userData.city && userData.country && ", "}
                      {userData.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </HoverableWrapper>

          <div className="px-8 py-6">
            {/* CAREER OBJECTIVE */}
            {userData.summary && (
              <Section
                title={t.careerObjectiveLabel}
                sectionId={sectionMap.summary}
                onSectionClick={onSectionClick}
                isPdfMode={isPdfMode}
              >
                <div className="professional-card bg-white p-6 border-l-4 border-blue-600">
                  <p className="text-slate-700 leading-relaxed text-pretty">
                    {userData.summary}
                  </p>
                </div>
              </Section>
            )}

            {/* EDUCATION */}
            {userData.education?.length > 0 && (
              <Section
                title={t.educationLabel}
                sectionId={sectionMap.education}
                onSectionClick={onSectionClick}
                isPdfMode={isPdfMode}
              >
                <div className="space-y-6">
                  {userData.education.map((edu: any, i: number) => (
                    <div
                      key={i}
                      className="professional-card bg-slate-50 p-6 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 mb-1">
                            {edu.degree}
                          </h3>
                          <p className="text-blue-700 font-semibold">
                            {edu.institution}
                          </p>
                        </div>
                        <span className="text-sm text-slate-600 bg-white px-4 py-1.5 rounded border border-slate-300 shrink-0 ml-4 font-medium">
                          {edu.startDate?.slice(0, 4)} -{" "}
                          {edu.endDate?.slice(0, 4)}
                        </span>
                      </div>
                      {edu.major && (
                        <p className="text-sm text-slate-600 mt-2">
                          <span className="font-semibold">{t.major}</span>{" "}
                          {edu.major}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* WORK EXPERIENCE */}
            {userData.workHistory?.length > 0 && (
              <Section
                title={t.experienceLabel}
                sectionId={sectionMap.experience}
                onSectionClick={onSectionClick}
                isPdfMode={isPdfMode}
              >
                <div className="space-y-4">
                  {userData.workHistory.map((job: any, i: number) => (
                    <div
                      key={i}
                      className="professional-card bg-slate-50 p-4 border-l-4 border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-blue-700 font-semibold">
                            {job.company}
                          </p>
                        </div>
                        <span className="text-sm text-slate-600 bg-white px-4 py-1.5 rounded border border-slate-300 shrink-0 ml-4 font-medium">
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
                      <div className="mt-3">
                        {renderDescription(job.description)}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* SKILLS with rating */}
          {userData.skills?.length > 0 && (
            <Section
              title={t.skillsLabel}
              sectionId={sectionMap.skills}
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                {userData.skills.map((skill: any, i: number) => {
                  const rating = Math.max(
                    0,
                    Math.min(5, Number(skill.rating || 0))
                  );
                  const width = `${(rating / 5) * 100}%`;
                  return (
                    <div
                      key={i}
                      className="group flex flex-col justify-between min-h-[40px]"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-medium text-slate-800 transition-colors group-hover:text-blue-600">
                          {skill.name}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-slate-700 text-xs font-semibold flex-shrink-0">
                          {rating}/5
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-300 group-hover:bg-gray-800 group-hover:shadow-lg group-hover:shadow-gray-500/50"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
};

export default Modern2;
