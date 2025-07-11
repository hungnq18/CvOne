import Image from "next/image";
import React from "react";

// --- PROPS INTERFACES ---
interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  className?: string;
  isPdfMode?: boolean; // [SỬA LỖI PDF] Thêm isPdfMode
}

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean; // [SỬA LỖI PDF] Thêm isPdfMode
}

interface CVTemplateProps {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
}

// --- COMPONENTS ---

const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  className,
  isPdfMode = false, // [SỬA LỖI PDF] Nhận prop isPdfMode
}) => {
  // [SỬA LỖI PDF] Nếu là chế độ PDF, không render hiệu ứng hover, chỉ trả về nội dung
  if (isPdfMode) {
    return <>{children}</>;
  }

  // --- Code hiển thị hiệu ứng hover cho web giữ nguyên ---
  const labelsWithHoverEffect = ["KINH NGHIỆM LÀM VIỆC", "HỌC VẤN"];
  const labelsWithHoverGreenEffect = [
    "Họ tên & Chức danh",
    "THÔNG TIN CÁ NHÂN",
    "MỤC TIÊU SỰ NGHIỆP",
    "KỸ NĂNG",
  ];
  const shouldApplyHover = labelsWithHoverEffect.includes(label);
  const shouldAvatar = "Avatar".includes(label);
  const shouldApplyHoverGreen = labelsWithHoverGreenEffect.includes(label);

  const finalClassName = `
    relative 
    group 
    cursor-pointer
    transition-all 
    duration-300 
    ease-in-out
    ${shouldApplyHover ? "hover:scale-105 hover:bg-gray-50 hover:shadow-lg" : ""}
    ${shouldAvatar ? "hover:scale-105" : ""}
    ${shouldApplyHoverGreen ? "hover:scale-105 hover:bg-gray-50 hover:shadow-lg" : ""}
    ${className || ""}
  `;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
      {children}
      {shouldAvatar && (
        <>
          <div className="absolute inset-0 rounded-full border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          <div
            className="absolute -top-2 left-0 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
            style={{ borderRadius: "4px 10px 4px 10px", marginTop: "-6%", left: "-15%" }}
          >
            {label}
          </div>
        </>
      )}
      {shouldApplyHoverGreen && (
        <>
          <div className="absolute rounded-lg inset-0 border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          <div
            className="absolute top-0 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
            style={{ borderRadius: "4px 10px 0 0", marginTop: "-3.5%", left: "1%" }}
          >
            {label}
          </div>
        </>
      )}
      {shouldApplyHover && (
        <>
          <div className="absolute inset-0 rounded-lg border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          <div
            className="absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
            style={{ borderRadius: "4px 10px 0 0", marginTop: "-2%", left: "1%" }}
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
  isPdfMode = false, // [SỬA LỖI PDF] Nhận isPdfMode
}) => {
  return (
    <div className="mb-10">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode xuống component con
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
  const userData = data?.userData || {};

  const sectionMap = {
    info: "info",
    contact: "contact",
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
  };

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col-reverse lg:flex-row min-h-screen">
      <div className="w-full lg:w-[65%]">
        <div className="flex items-center gap-6 mb-12">
          <div className="mt-4 ml-8 relative w-40 h-40 flex-shrink-0">
            <HoverableWrapper
              label="Avatar"
              sectionId={sectionMap.info}
              onClick={onSectionClick}
              className="w-full h-full"
              isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
            >
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/80">
                <div className="w-full h-full relative aspect-square">
                  {/* [SỬA LỖI PDF] Dùng <img> cho PDF và <Image> cho web */}
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
              label="Họ tên & Chức danh"
              sectionId={sectionMap.info}
              onClick={onSectionClick}
              className=" w-full"
              isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
            >
              <h1 className="pt-12 pr-6 pl-6 text-4xl lg:text-5xl font-bold text-gray-900 uppercase">
                {userData.firstName} {userData.lastName}
              </h1>
              <h2 className="pb-6 pr-6 pl-6 text-xl lg:text-2xl text-gray-600 mt-2">
                {userData.professional || "Chuyên gia"}
              </h2>
            </HoverableWrapper>
          </div>
        </div>

        <SectionWrapper
          title="KINH NGHIỆM LÀM VIỆC"
          sectionId={sectionMap.experience}
          onSectionClick={onSectionClick}
          isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
        >
          {(userData.workHistory || []).map((job: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                <span className="text-sm font-medium text-gray-600 shrink-0 ml-4">
                  {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                  {job.endDate === "Present"
                    ? "Hiện tại"
                    : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                </span>
              </div>
              <h4 className="font-semibold text-md text-gray-700 mb-1">{job.company}</h4>
              {renderDescription(job.description)}
            </div>
          ))}
        </SectionWrapper>

        <SectionWrapper
          title="HỌC VẤN"
          sectionId={sectionMap.education}
          onSectionClick={onSectionClick}
          isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
        >
          {(userData.education || []).map((edu: any, i: number) => (
            <div key={i}>
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
            label="THÔNG TIN CÁ NHÂN"
            sectionId={sectionMap.contact}
            onClick={onSectionClick}
            className="p-4 relative"
            isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
          >
            <h2 className="pt-4 pl-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
              Thông tin cá nhân
            </h2>
            <div className="pl-4 pb-4 space-y-4 text-gray-700">
              <div>
                <strong className="font-semibold block">Điện thoại:</strong>
                <span>{userData.phone}</span>
              </div>
              <div>
                <strong className="font-semibold block">Email:</strong>
                <span className="break-words">{userData.email}</span>
              </div>
              <div>
                <strong className="font-semibold block">Địa chỉ:</strong>
                <span>{userData.city}, {userData.country}</span>
              </div>
            </div>
          </HoverableWrapper>
        </div>

        <div className="mb-10 w-[calc(100%+48px)] -ml-6">
          <HoverableWrapper
            label="MỤC TIÊU SỰ NGHIỆP"
            sectionId={sectionMap.summary}
            onClick={onSectionClick}
            className="p-4 relative"
            isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
          >
            <h2 className="pt-4 pl-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b-2 border-gray-300">
              Mục tiêu sự nghiệp
            </h2>
            <p className="pl-4 pr-4 pb-4 text-gray-700 leading-relaxed">{userData.summary}</p>

          </HoverableWrapper>
        </div>

        {userData.skills?.length > 0 && (
          <div className="mb-10 w-[calc(100%+48px)] -ml-6">
            <HoverableWrapper
              label="KỸ NĂNG"
              sectionId={sectionMap.skills}
              onClick={onSectionClick}
              className="p-4 relative"
              isPdfMode={isPdfMode} // [SỬA LỖI PDF] Truyền isPdfMode
            >
              <h2 className="pl-4 pt-4 text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
                Kỹ năng
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