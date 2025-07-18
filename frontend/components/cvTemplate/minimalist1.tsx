import Image from "next/image";
import React from "react";
// BƯỚC 1: Import hook để lấy ngôn ngữ
import { useLanguage } from "@/providers/global-provider";

// --- BƯỚC 2: TẠO ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    // Section Titles (UPPERCASE)
    workExperience: "WORK EXPERIENCE",
    education: "EDUCATION",
    personalInfo: "PERSONAL INFORMATION",
    careerObjective: "CAREER OBJECTIVE",
    skills: "SKILLS",

    // Lowercase Titles (for display inside sections)
    personalInfoLower: "Personal Information",
    careerObjectiveLower: "Career Objective",
    skillsLower: "Skills",

    // Hover Labels
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",

    // Content
    present: "Present",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    defaultProfessional: "Professional",
  },
  vi: {
    // Section Titles (UPPERCASE)
    workExperience: "KINH NGHIỆM LÀM VIỆC",
    education: "HỌC VẤN",
    personalInfo: "THÔNG TIN CÁ NHÂN",
    careerObjective: "MỤC TIÊU SỰ NGHIỆP",
    skills: "KỸ NĂNG",

    // Lowercase Titles
    personalInfoLower: "Thông tin cá nhân",
    careerObjectiveLower: "Mục tiêu sự nghiệp",
    skillsLower: "Kỹ năng",
    
    // Hover Labels
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",

    // Content
    present: "Hiện tại",
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    defaultProfessional: "Chuyên gia",
  },
};

// --- PROPS INTERFACES (Không đổi) ---
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
  onSectionClick?: (sectionId:string) => void;
  isPdfMode?: boolean;
}

// --- COMPONENTS (Được cập nhật) ---

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
  
  // Cải tiến: Dùng sectionId để quyết định style, không phụ thuộc vào ngôn ngữ
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
    relative 
    group 
    cursor-pointer
    transition-all 
    duration-300 
    ease-in-out
    ${hoverEffectMap[sectionId] || ""}
    ${className || ""}
  `;

  const isAvatar = sectionId === 'avatar';
  const showBorder = !isPdfMode;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      {showBorder && (
         <>
          <div className={`absolute inset-0 border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${isAvatar ? 'rounded-full' : 'rounded-lg'}`}></div>
          <div
            className="absolute bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
            style={isAvatar ? 
              { top: '-2px', left: '-15%', borderRadius: "4px 10px 4px 10px", marginTop: "-6%" } : 
              { top: '0', left: '1%', transform: 'translateY(-50%)', borderRadius: "4px 10px 0 0", marginTop: "-2%" }
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
}) => {
  // BƯỚC 3: SỬ DỤNG HOOK VÀ LẤY ĐÚNG BỘ TỪ ĐIỂN
  const { language } = useLanguage();
  const t = translations[language];

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

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col-reverse lg:flex-row min-h-screen">
      <div className="w-full lg:w-[65%]">
        <div className="flex items-center gap-6 mb-12">
          <div className="mt-4 ml-8 relative w-40 h-40 flex-shrink-0">
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

          <div className="w-full">
            <HoverableWrapper
              label={t.fullNameAndTitleLabel}
              sectionId={sectionMap.info}
              onClick={onSectionClick}
              className=" w-full"
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
        </div>

        <SectionWrapper
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
                  {job.isCurrent ||
                    job.endDate == "Present" ||
                    job.endDate == "Hiện tại"
                      ? t.present
                      : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                </span>
              </div>
              <h4 className="font-semibold text-md text-gray-700 mb-1">{job.company}</h4>
              {renderDescription(job.description)}
            </div>
          ))}
        </SectionWrapper>

        <SectionWrapper
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
      </div>

      <div className="w-full lg:w-[35%] bg-gray-50 p-4 lg:p-8">
        <div className="mb-10 w-[calc(100%+48px)] -ml-6">
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
                <span>{userData.city}, {userData.country}</span>
              </div>
            </div>
          </HoverableWrapper>
        </div>

        <div className="mb-10 w-[calc(100%+48px)] -ml-6">
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
            <p className="pl-4 pr-4 pb-4 text-gray-700 leading-relaxed">{userData.summary}</p>

          </HoverableWrapper>
        </div>

        {userData.skills?.length > 0 && (
          <div className="mb-10 w-[calc(100%+48px)] -ml-6">
            <HoverableWrapper
              label={t.skills}
              sectionId={sectionMap.skills}
              onClick={onSectionClick}
              className="p-4 relative"
              isPdfMode={isPdfMode}
            >
              <h2 className="pl-4 pt-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
                {t.skillsLower}
              </h2>
              <ul className="pl-4 pr-4 pb-4 list-inside list-disc space-y-2 text-gray-700">
                {userData.skills.map((skill: any, i: number) => (
                  <li key={i}>{skill.name}</li>
                ))}
              </ul>
            </HoverableWrapper>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVTemplateInspired;