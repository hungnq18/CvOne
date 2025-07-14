import { hover } from "framer-motion";
import Image from "next/image";
import React from "react";

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

interface ModernCV1Props {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
}

// --- COMPONENTS ---

// Component đa dụng để tạo vùng hover, tích hợp tất cả các yêu cầu
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

  const labelsWithHoverEffect = [
    "Họ tên & Chức danh",
    "KINH NGHIỆM LÀM VIỆC",
    "HỌC VẤN",
  ];

  const labelsWithHoverGreenEffect = [
    "THÔNG TIN CÁ NHÂN",
    "MỤC TIÊU SỰ NGHIỆP",
    "KỸ NĂNG",
  ];

  const shouldApplyHover = labelsWithHoverEffect.includes(label);
  const shouldAvatar = "Avatar".includes(label);
  const shouldApplyHoverGreen = labelsWithHoverGreenEffect.includes(label);

  // 3. Tạo chuỗi className dựa trên điều kiện
  const finalClassName = `
    relative 
    group 
    cursor-pointer
    rounded-lg 
    transition-all 
    duration-300 
    ease-in-out
    ${shouldApplyHover ? "hover:scale-105 hover:bg-white hover:shadow-lg" : ""}
    ${shouldAvatar ? "hover:scale-105 hover:shadow-lg" : ""}
    ${
      shouldApplyHoverGreen
        ? "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg"
        : ""
    }

  `;
  // Quyết định class bo tròn dựa trên label
  const borderRadiusClass = label === "Avatar" ? "rounded-full" : "rounded-lg";

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      <div
        className={`absolute inset-0 ${borderRadiusClass} border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
      ></div>
      {label !== "Avatar" && (
        <div
          className="absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
          style={{
            borderRadius: "4px 10px 0 0",
            marginTop: "-2%",
            left: "1%",
          }}
        >
          {label}
        </div>
      )}
      {label === "Avatar" && (
        <div
          className="absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
          style={{
            borderRadius: "4px 10px 4px 10px",
            marginTop: "-2%",
            left: "-4%",
          }}
        >
          {label}
        </div>
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
    <ul className="list-disc pl-6 space-y-2 text-lg leading-relaxed">
      {lines.map((line, idx) => (
        <li key={idx}>{line}</li>
      ))}
    </ul>
  );
};

// Component Section: Bọc nội dung và truyền props xuống HoverableWrapper
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
        {/* Thêm padding vào đây để nội dung không bị sát lề khi wrapper chiếm 100% width */}
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
}) => {
  const userData = data?.userData || {};
  const professionalTitle = userData.professional || "Chuyên gia";

  // Ánh xạ giữa các phần trên CV và ID của popup
  const sectionMap = {
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
              label="Avatar"
              sectionId={sectionMap.info}
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
                  // Dùng <Image> của Next.js để tối ưu khi hiển thị trên web
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
          label="THÔNG TIN CÁ NHÂN"
          sectionId={sectionMap.contact}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
              THÔNG TIN CÁ NHÂN
            </h2>
            <div className="space-y-4 text-lg lg:text-xl">
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  Điện thoại:
                </strong>
                <span className="text-lg break-words">{userData.phone}</span>
              </div>
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  Email:
                </strong>
                <span className="text-lg break-words">{userData.email}</span>
              </div>
              <div>
                <strong className="w-32 shrink-0 block text-base font-bold text-white/70">
                  Địa chỉ:
                </strong>
                <span className="text-lg break-words">
                  {userData.city}, {userData.country}
                </span>
              </div>
            </div>
          </div>
        </HoverableWrapper>

        <HoverableWrapper
          label="MỤC TIÊU SỰ NGHIỆP"
          sectionId={sectionMap.summary}
          onClick={onSectionClick}
          isPdfMode={isPdfMode}
        >
          <div className="px-8 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
              MỤC TIÊU SỰ NGHIỆP
            </h2>
            <p className="text-lg lg:text-xl leading-loose">
              {userData.summary}
            </p>
          </div>
        </HoverableWrapper>

        {userData.skills?.length > 0 && (
          <HoverableWrapper
            label="KỸ NĂNG"
            sectionId={sectionMap.skills}
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
          >
            <div className="px-8 lg:px-12">
              <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50  pt-3">
                KỸ NĂNG
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
          label="Họ tên & Chức danh"
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
            title="KINH NGHIỆM LÀM VIỆC"
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
                    {job.endDate === "Present"
                      ? "Hiện tại"
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
            title="HỌC VẤN"
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
                  CHUYÊN NGÀNH: {edu.major}
                </h4>
                <p className="text-lg">Bằng cấp: {edu.degree}</p>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ModernCV1;
