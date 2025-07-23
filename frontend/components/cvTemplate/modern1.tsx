import { hover } from "framer-motion";
import Image from "next/image";
import React from "react";
// BƯỚC 1: Import hook để lấy ngôn ngữ
import { Avatar } from "antd";

// --- BƯỚC 2: TẠO ĐỐI TƯỢNG TRANSLATIONS ---
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
    careerObjectiveLabel: "MỤC TIÊU SỰ NGHIỆP",
    skillsLabel: "KỸ NĂNG",
    experienceLabel: "KINH NGHIỆM LÀM VIỆC",
    educationLabel: "HỌC VẤN",

    // Content
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    present: "Hiện tại",
    major: "CHUYÊN NGÀNH:",
    degree: "Bằng cấp:",
    defaultProfessional: "Chuyên gia",
  },
};

// --- PROPS INTERFACES (Không đổi) ---
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

interface ModernCV1Props {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
}

// --- COMPONENTS (Được cập nhật) ---

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
  
  // Sửa logic để không phụ thuộc vào chuỗi text
  const hoverEffectMap: { [key: string]: string } = {
    info: "hover:scale-105 hover:bg-white hover:shadow-lg",
    experience: "hover:scale-105 hover:bg-white hover:shadow-lg",
    education: "hover:scale-105 hover:bg-white hover:shadow-lg",
    contact: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    summary: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    skills: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    avatar: "hover:scale-105 hover:bg-[#004D3F] hover:shadow-lg ",
  };
  
  const hoverClass = hoverEffectMap[sectionId] || "";

  const finalClassName = `
    relative group cursor-pointer rounded-lg transition-all duration-300 ease-in-out
    ${hoverClass}
  `;

  const borderRadiusClass = sectionId === "avatar" ? "rounded-full" : "rounded-lg";

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      <div
        className={`absolute inset-0 ${borderRadiusClass} border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
      ></div>
      <div
        className={`absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none`}
        style={{
          borderRadius: sectionId === 'avatar' ? "4px 10px 4px 10px" : "4px 10px 0 0",
          marginTop: "-2%",
          left: sectionId === 'avatar' ? "-4%" : "1%",
        }}
      >
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
    <ul className="list-disc pl-6 space-y-2 text-lg leading-relaxed">
      {lines.map((line, idx) => (
        <li key={idx}>{line}</li>
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
    <div className="mb-10">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
      >
        <div className="px-8 lg:px-12 py-4">
          <h2 className="text-gray-800 text-xl lg:text-2xl font-bold tracking-wider mb-1">
            {title}
          </h2>
          <div className="pt-3 border-t-2 border-[#004d40] leading-relaxed">
            {children}
          </div>
        </div>
      </HoverableWrapper>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ModernCV1: React.FC<ModernCV1Props> = ({
  data,
  onSectionClick,
  isPdfMode = false,
  language,
}) => {
  // BƯỚC 3: LẤY ĐÚNG BỘ TỪ ĐIỂN TỪ PROP
  const lang = language || "en";
  const t = translations[lang as "en" | "vi"];

  const userData = data?.userData || {};
  const professionalTitle = userData.professional || t.defaultProfessional;

  const sectionMap = {
    avatar:"avatar",
    info: "info",
    contact: "contact",
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
  };

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col lg:flex-row min-h-screen">
      {/* --- CỘT TRÁI (MÀU XANH) --- */}
      <div className="w-full lg:w-[38%] bg-[#004d40] text-white flex flex-col gap-8 py-8 lg:py-12">
        <div className="px-8 lg:px-12">
          <div className="flex justify-center">
            <HoverableWrapper
              label={t.avatarLabel}
              sectionId={sectionMap.avatar}
              onClick={onSectionClick}
              isPdfMode={isPdfMode}
            >
              <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/80">
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
                    width={300}
                    height={375}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </HoverableWrapper>
          </div>
        </div>

        <HoverableWrapper
          label={t.personalInfoLabel}
          sectionId={sectionMap.contact}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
              {t.personalInfoLabel}
            </h2>
            <div className="space-y-4 text-lg lg:text-xl">
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  {t.phone}
                </strong>
                <span className="text-lg break-words">{userData.phone}</span>
              </div>
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  {t.email}
                </strong>
                <span className="text-lg break-words">{userData.email}</span>
              </div>
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  {t.address}
                </strong>
                <span className="text-lg break-words">
                  {userData.city}, {userData.country}
                </span>
              </div>
            </div>
          </div>
        </HoverableWrapper>

        <HoverableWrapper
          label={t.careerObjectiveLabel}
          sectionId={sectionMap.summary}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
              {t.careerObjectiveLabel}
            </h2>
            <p className="text-lg lg:text-xl leading-loose">
              {userData.summary}
            </p>
          </div>
        </HoverableWrapper>

        {userData.skills?.length > 0 && (
          <HoverableWrapper
            label={t.skillsLabel}
            sectionId={sectionMap.skills}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="px-8 lg:px-12">
              <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50  pt-3">
                {t.skillsLabel}
              </h2>
              <ul className="list-disc pl-6 space-y-3 text-lg lg:text-xl">
                {userData.skills.map((skill: any, i: number) => (
                  <li key={i}>{skill.name}</li>
                ))}
              </ul>
            </div>
          </HoverableWrapper>
        )}
      </div>

      {/* --- CỘT PHẢI (MÀU TRẮNG) --- */}
      <div className="w-full lg:w-[62%]">
        <HoverableWrapper
          label={t.fullNameAndTitleLabel}
          sectionId={sectionMap.info}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="p-8 lg:p-12 lg:pt-14">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 uppercase">
              {userData.firstName} {userData.lastName}
            </h1>
            <div className="mt-3 inline-block h-max-100 mt-8">
              <span className="bg-[#4db6ac] text-white text-xl lg:text-2xl font-bold tracking-wider px-5 py-2">
                {professionalTitle.toUpperCase()}
              </span>
            </div>
          </div>
        </HoverableWrapper>

        <div className="pb-8 lg:pb-12">
          <Section
            title={t.experienceLabel}
            sectionId={sectionMap.experience}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            {(userData.workHistory || []).map((job: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{job.title}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                    {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                    {job.isCurrent ||
                    job.endDate == "Present" ||
                    job.endDate == "Hiện tại"
                      ? t.present
                      : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(
                          0,
                          4
                        )}`}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700 mb-3">
                  {job.company}
                </h4>
                {renderDescription(job.description)}
              </div>
            ))}
          </Section>

          <Section
            title={t.educationLabel}
            sectionId={sectionMap.education}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            {(userData.education || []).map((edu: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{edu.institution}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                    {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700">
                  {t.major} {edu.major}
                </h4>
                <p className="text-lg">{t.degree} {edu.degree}</p>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ModernCV1;