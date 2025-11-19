"use client";

import Image from "next/image";
import type React from "react";
import { getDefaultSectionPositions } from "./defaultSectionPositions";

// --- TRANSLATIONS ---
const translations = {
  en: {
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    personalInfoLabel: "PERSONAL INFORMATION",
    careerObjectiveLabel: "CAREER OBJECTIVE",
    skillsLabel: "SKILLS",
    experienceLabel: "WORK EXPERIENCE",
    educationLabel: "EDUCATION",
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
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    personalInfoLabel: "THÔNG TIN CÁ NHÂN",
    careerObjectiveLabel: "MỤC TIÊU NGHỀ NGHIỆP",
    skillsLabel: "KỸ NĂNG",
    experienceLabel: "KINH NGHIỆM LÀM VIỆC",
    educationLabel: "HỌC VẤN",
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
    contact: "hover:shadow-lg",
    skills: "hover:shadow-lg",
  };

  const hoverClass = hoverEffectMap[sectionId] || "";

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ease-in-out ${hoverClass}`}
      onClick={() => onClick?.(sectionId)}
    >
      {children}
      <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="absolute top-0 left-6 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold tracking-wider px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-full shadow-md z-10">
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
    <div className="mb-6 px-8">
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
    info: "info",
    contact: "contact",
    summary: "summary",
    education: "education",
    experience: "experience",
    skills: "skills",
    avatar: "avatar",
  };

  // --- Tính toán vị trí hiển thị section ---
  const sectionPositions =
    data?.sectionPositions ||
    getDefaultSectionPositions(data?.templateTitle || "The Modern");

  type SectionPosition = { place: number; order: number };

  // --- LOGIC SẮP XẾP (SORTING) ---
  // Gộp tất cả thành 1 danh sách duy nhất và sắp xếp theo Place -> Order
  // Place 1 (Info) -> Place 2 (Contact) -> Place 3 (Content)
  const sortedSections = Object.entries(sectionPositions)
    .sort(([, a], [, b]) => {
      const posA = a as SectionPosition;
      const posB = b as SectionPosition;
      // Ưu tiên Place trước (1 -> 2 -> 3...)
      if (posA.place !== posB.place) return posA.place - posB.place;
      // Sau đó đến Order
      return posA.order - posB.order;
    })
    .map(([key]) => key);

  const styles = `
    .professional-card {
      transition: all 0.3s ease;
    }
    .professional-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  `;

  // --- Hàm Render ---
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      // --- AVATAR & INFO (HERO SECTION) - Place 1 ---
      case "info":
        return (
          <HoverableWrapper
            key="info"
            label={t.fullNameAndTitleLabel}
            sectionId={sectionMap.info}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 mb-6">
              <div className="flex items-center gap-8">
                {/* Avatar Image */}
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

                {/* Text Info */}
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
        );

      case "avatar":
        // Avatar đã được hiển thị bên trong block "info" ở trên
        return null;

      // --- CONTACT (INFO BAR) - Place 2 ---
      case "contact":
        return (
          <HoverableWrapper
            key="contact"
            label={t.personalInfoLabel}
            sectionId={sectionMap.contact}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="bg-slate-100 px-8 py-4 border-b-2 border-blue-600 mb-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {userData.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold">
                      {t.dateOfBirth}
                    </span>
                    <span className="text-slate-700">
                      {userData.dateOfBirth}
                    </span>
                  </div>
                )}
                {userData.gender && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold">
                      {t.gender}
                    </span>
                    <span className="text-slate-700">{userData.gender}</span>
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold">
                      {t.phone}
                    </span>
                    <span className="text-slate-700">{userData.phone}</span>
                  </div>
                )}
                {userData.email && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold">
                      {t.email}
                    </span>
                    <span className="text-slate-700 break-all">
                      {userData.email}
                    </span>
                  </div>
                )}
                {(userData.city || userData.country) && (
                  <div className="flex items-center gap-3 col-span-2">
                    <span className="text-slate-600 font-semibold">
                      {t.address}
                    </span>
                    <span className="text-slate-700">
                      {userData.city}
                      {userData.city && userData.country && ", "}
                      {userData.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </HoverableWrapper>
        );

      // --- CONTENT SECTIONS (SUMMARY, EXPERIENCE, ETC.) - Place 3 ---
      case "summary":
        return (
          userData.summary && (
            <Section
              key="summary"
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
          )
        );

      case "education":
        return (
          userData.education?.length > 0 && (
            <Section
              key="education"
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
          )
        );

      case "experience":
        return (
          userData.workHistory?.length > 0 && (
            <Section
              key="experience"
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
          )
        );

      case "skills":
        return (
          userData.skills?.length > 0 && (
            <Section
              key="skills"
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
          )
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="bg-slate-50 min-h-screen font-sans">
        <div className="max-w-4xl mx-auto bg-white shadow-sm min-h-screen pb-8">
          {/* Render tuần tự theo Place -> Order */}
          {sortedSections.map((id) => renderSection(id))}
        </div>
      </div>
    </>
  );
};

export default Modern2;