import Image from "next/image";
import React from "react";

// --- PROPS INTERFACES (Giữ nguyên) ---
interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  className?: string;
}

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
}

interface CVTemplateProps {
  data: any;
  onSectionClick?: (sectionId: string) => void;
}

// --- COMPONENTS ---

const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  // Nhận className từ props
  className,
}) => {
  const isAvatar = label === "Avatar";
  const borderRadiusClass = isAvatar ? "rounded-full" : "rounded-lg";

  return (
    <div
      className={`
        relative 
        group 
        cursor-pointer 
        transition-all 
        duration-300 
        ease-in-out 
        hover:scale-105 
        hover:shadow-xl
        ${isAvatar ? "overflow-hidden" : ""}
        ${borderRadiusClass} 
        ${className || ""}
      `}
      onClick={() => onClick?.(sectionId)}
    >
      {children}
      {/* Lớp viền xanh bây giờ sẽ luôn đúng hình dạng với wrapper */}
      <div
        className={`absolute inset-0 border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${borderRadiusClass}`}
      ></div>

      {/* Phần nhãn tên (giữ nguyên) */}
      <div
        className="absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
        style={{
          borderRadius: "4px 10px 4px 10px",
          marginTop: isAvatar ? "-2%" : "0",
          left: isAvatar ? "-4%" : "1%",
        }}
      >
        {label}
      </div>
    </div>
  );
};
/**
 * renderDescription: Giữ nguyên hàm helper để hiển thị mô tả công việc.
 */
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

/**
 * SectionWrapper: Một component mới để bọc các section chính (Kinh nghiệm, Học vấn)
 * với tiêu đề và đường gạch chân, theo phong cách của ảnh.
 */
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  children,
  sectionId,
  onSectionClick,
}) => {
  return (
    <div className="mb-10">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
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

// --- MAIN COMPONENT (Giao diện mới) ---
const CVTemplateInspired: React.FC<CVTemplateProps> = ({
  data,
  onSectionClick,
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
      {/* --- CỘT TRÁI (NỘI DUNG CHÍNH) --- */}
      <div className="w-full lg:w-[65%] p-8 lg:p-12">
        {/* --- Header: Avatar và Tên --- */}
        <div className="flex w-120 items-center gap-4 mb-12">
          <HoverableWrapper
            label="Avatar"
            sectionId={sectionMap.info}
            onClick={onSectionClick}
            className="w-40 h-40 lg:w-48 lg:h-48 shrink-0"
          >
            <Image
              src={userData.avatar || "/avatar-female.png"}
              alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </HoverableWrapper>

          <div className="p-4 w-100">
            <HoverableWrapper
              label="Họ tên & Chức danh"
              sectionId={sectionMap.info}
              onClick={onSectionClick}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 uppercase">
                {userData.firstName} {userData.lastName}
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-600 mt-2">
                {userData.professional || "Chuyên gia"}
              </h2>
            </HoverableWrapper>
          </div>
        </div>

        {/* --- Kinh nghiệm làm việc --- */}
        {/* Thẻ div thừa đã được xóa bỏ ở đây */}
        <SectionWrapper
          title="KINH NGHIỆM LÀM VIỆC"
          sectionId={sectionMap.experience}
          onSectionClick={onSectionClick}
        >
          {(userData.workHistory || []).map((job: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-gray-800">
                  {job.title}
                </h3>
                <span className="text-sm font-medium text-gray-600 shrink-0 ml-4">
                  {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                  {job.endDate === "Present"
                    ? "Hiện tại"
                    : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(
                        0,
                        4
                      )}`}
                </span>
              </div>
              <h4 className="font-semibold text-md text-gray-700 mb-1">
                {job.company}
              </h4>
              {renderDescription(job.description)}
            </div>
          ))}
        </SectionWrapper>

        {/* --- Học vấn --- */}
        <SectionWrapper
          title="HỌC VẤN"
          sectionId={sectionMap.education}
          onSectionClick={onSectionClick}
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
      </div> {/* <--- ĐÂY LÀ THẺ ĐÓNG CỦA CỘT TRÁI */}

      {/* --- CỘT PHẢI (THÔNG TIN PHỤ) -- */}
      <div className="w-full lg:w-[35%] bg-gray-50 p-8 lg:p-12">
        {/* --- Thông tin cá nhân --- */}
        <div className="mb-10">
          <HoverableWrapper
            label="THÔNG TIN CÁ NHÂN"
            sectionId={sectionMap.contact}
            onClick={onSectionClick}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
                Thông tin cá nhân
              </h2>
              <div className="space-y-4 text-gray-700">
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
                  <span>
                    {userData.city}, {userData.country}
                  </span>
                </div>
              </div>
            </div>
          </HoverableWrapper>
        </div>
        
        {/* --- Mục tiêu sự nghiệp --- */}
        <div className="mb-10">
          <HoverableWrapper
            label="MỤC TIÊU SỰ NGHIỆP"
            sectionId={sectionMap.summary}
            onClick={onSectionClick}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b-2 border-gray-300">
                Mục tiêu sự nghiệp
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {userData.summary}
              </p>
            </div>
          </HoverableWrapper>
        </div>

        

        {/* --- Kỹ năng --- */}
        {userData.skills?.length > 0 && (
          <div className="mb-10">
            <HoverableWrapper
              label="KỸ NĂNG"
              sectionId={sectionMap.skills}
              onClick={onSectionClick}
            >
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300">
                  Kỹ năng
                </h2>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {userData.skills.map((skill: any, i: number) => (
                    <li key={i}>{skill.name}</li>
                  ))}
                </ul>
              </div>
            </HoverableWrapper>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVTemplateInspired;
