"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { getDefaultSectionPositions } from "./defaultSectionPositions";
import { notify } from "@/lib/notify";

// --- TRANSLATIONS ---
const translations = {
  en: {
    workExperience: "WORK EXPERIENCE",
    education: "EDUCATION",
    personalInfo: "PERSONAL INFORMATION",
    contact: "CONTACT",
    careerObjective: "CAREER OBJECTIVE",
    skills: "SKILLS",
    personalInfoLower: "Personal Information",
    contactLower: "Contact",
    careerObjectiveLower: "Career Objective",
    skillsLower: "Skills",
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    present: "Present",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    defaultProfessional: "Professional",
    certificationLabel: "CERTIFICATION",
    achievementLabel: "ACHIEVEMENT",
    hobbyLabel: "HOBBY",
    projectLabel: "PROJECT",
  },
  vi: {
    workExperience: "KINH NGHIỆM LÀM VIỆC",
    education: "HỌC VẤN",
    personalInfo: "THÔNG TIN CÁ NHÂN",
    contact: "LIÊN HỆ",
    careerObjective: "MỤC TIÊU SỰ NGHIỆP",
    skills: "KỸ NĂNG",
    personalInfoLower: "Thông tin cá nhân",
    contactLower: "Liên hệ",
    careerObjectiveLower: "Mục tiêu sự nghiệp",
    skillsLower: "Kỹ năng",
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    present: "Hiện tại",
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    defaultProfessional: "Chuyên gia",
    certificationLabel: "CHỨNG CHỈ",
    achievementLabel: "THÀNH TỰU",
    hobbyLabel: "SỞ THÍCH",
    projectLabel: "DỰ ÁN",
  },
};

// --- PORTAL COMPONENT ---
const DragPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

// --- PROPS ---
interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  className?: string;
  isPdfMode?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
}

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
  place?: number; // Thêm place để xử lý style động
}

interface CVTemplateProps {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
  onLayoutChange?: (newPositions: any) => void;
  scale?: number;
  cvUiTexts?: any;
}

// --- COMPONENTS ---
const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  className,
  isPdfMode = false,
  dragHandleProps,
  isDragging,
}) => {
  if (isPdfMode) {
    return <>{children}</>;
  }

  const hoverEffectMap: { [key: string]: string } = {
    experience: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    education: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    info: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    contact: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    summary: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    skills: "hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg",
    avatar: "hover:scale-[1.02]",
  };

  const finalClassName = `
    relative group cursor-pointer transition-all duration-300 ease-in-out
    ${hoverEffectMap[sectionId] || ""}
    ${className || ""}
    ${isDragging ? "z-50 shadow-2xl ring-4 ring-[#8BAAFC] opacity-100 bg-white rounded-lg scale-[1.02]" : ""}
  `;

  const isAvatar = sectionId === "avatar";
  const showBorder = !isPdfMode;

  return (
    <div className={finalClassName} onClick={() => onClick?.(sectionId)}>
       {/* --- DRAG HANDLE --- */}
       {!isPdfMode && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full 
                     w-8 h-8 flex items-center justify-center
                     bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 
                     text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50
                     cursor-grab active:cursor-grabbing 
                     opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-[100]"
          title="Kéo để sắp xếp vị trí"
          style={{
            left: isAvatar ? '0px' : undefined,
            transform: isAvatar ? 'translate(-120%, -50%)' : undefined
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          <GripVertical size={18} strokeWidth={2.5} />
        </div>
      )}

      {children}
      {showBorder && !isPdfMode && (
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
    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700 w-full break-words">
      {lines.map((line, idx) => (
        <li key={idx} className="break-words">{line}</li>
      ))}
    </ul>
  );
};

// Wrapper component cho các section tiêu chuẩn
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  children,
  sectionId,
  onSectionClick,
  isPdfMode = false,
  dragHandleProps,
  isDragging,
  place
}) => {
  // Logic style: Nếu ở Sidebar (place 2) thì padding nhỏ hơn
  const paddingClass = place === 2 ? "p-3" : "p-4";
  
  return (
    <div className="mb-8 w-full">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      >
        <div className={paddingClass}>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
            {title}
          </h2>
          <div className="space-y-6 w-full">{children}</div>
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
  cvUiTexts,
  onLayoutChange,
  scale = 1,
}) => {
  const lang = language || "en";
  const defaultT = translations[lang as "en" | "vi"];
  
  const t = {
    ...defaultT,
    ...(cvUiTexts && {
      personalInfo: cvUiTexts.personalInformation || defaultT.personalInfo,
      personalInfoLower: cvUiTexts.personalInformation || defaultT.personalInfoLower,
      careerObjective: cvUiTexts.careerObjective || defaultT.careerObjective,
      careerObjectiveLower: cvUiTexts.careerObjective || defaultT.careerObjectiveLower,
      skills: cvUiTexts.skills || defaultT.skills,
      skillsLower: cvUiTexts.skills || defaultT.skillsLower,
      workExperience: cvUiTexts.workExperience || defaultT.workExperience,
      education: cvUiTexts.education || defaultT.education,
      certificationLabel: cvUiTexts.certification || defaultT.certificationLabel,
      achievementLabel: cvUiTexts.achievement || defaultT.achievementLabel,
      hobbyLabel: cvUiTexts.hobby || defaultT.hobbyLabel,
      projectLabel: cvUiTexts.project || defaultT.projectLabel,
      avatarLabel: cvUiTexts.avatar || defaultT.avatarLabel,
      fullNameAndTitleLabel: cvUiTexts.fullNameAndTitle || defaultT.fullNameAndTitleLabel,
      
      phone: cvUiTexts.phone || defaultT.phone,
      email: cvUiTexts.email || defaultT.email,
      address: cvUiTexts.address || defaultT.address,
    }),
  };
  const userData = data?.userData || {};

  const sectionMap = {
    info: "info",
    contact: "contact",
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
    avatar: "avatar",
    certification: "certification",
    achievement: "achievement",
    hobby: "hobby",
    Project: "Project",
  };

  const sectionPositions =
    data?.sectionPositions ||
    getDefaultSectionPositions(data?.templateTitle || "The Vanguard");

  const dragWarningMessage =
    lang === "vi"
      ? "Bạn chỉ có thể thả mục trong khu vực bố cục cho phép."
      : "Please drop sections inside the allowed layout areas.";

  type SectionPosition = { place: number; order: number };

  const supportedSections = ["avatar", "info", "contact", "summary", "skills", "experience", "education", "certification", "achievement", "hobby", "Project"];
  
  // Helper filter sections
  const getSectionsByPlace = (placeId: number) => Object.entries(sectionPositions)
    .filter(([key, pos]) => {
      const p = (pos as SectionPosition).place;
      return p === placeId && p > 0 && supportedSections.includes(key);
    })
    .sort(([, a], [, b]) => (a as SectionPosition).order - (b as SectionPosition).order)
    .map(([key]) => key);

  const headerSections = getSectionsByPlace(1);
  const sidebarSections = getSectionsByPlace(2);
  const mainSections = getSectionsByPlace(3);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      notify.error(dragWarningMessage);
      return;
    }
    if (!onLayoutChange) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourcePlace = parseInt(source.droppableId);
    const destPlace = parseInt(destination.droppableId);
    
    // CHẶN: Không cho phép kéo thả sang place khác
    if (sourcePlace !== destPlace) {
      notify.error(dragWarningMessage);
      return;
    }
    
    const newPositions = { ...sectionPositions };

    const getKeys = (place: number) => Object.entries(newPositions)
      .filter(([_, pos]: [string, any]) => pos.place === place)
      .sort(([, a]: [string, any], [, b]: [string, any]) => a.order - b.order)
      .map(([key]) => key);

    const sourceKeys = getKeys(sourcePlace);
    const destKeys = [...sourceKeys];

    // Chỉ cho phép sắp xếp lại thứ tự trong cùng một place
    const [moved] = destKeys.splice(source.index, 1);
    destKeys.splice(destination.index, 0, moved);

    destKeys.forEach((key, index) => { 
      newPositions[key] = { place: destPlace, order: index }; 
    });

    onLayoutChange(newPositions);
  };

  // --- QUAN TRỌNG: HÀM XỬ LÝ STYLE CLASS ---
  // Nếu ở Sidebar (place 2): width full, margin 0.
  // Nếu ở Main (place 3): width tràn lề trái 1 chút để tạo style, margin âm.
  const getSectionContainerClass = (place?: number) => {
    if (place === 2) {
      return "w-full ml-0 mb-8"; // Reset style cho Sidebar
    }
    return "w-[calc(100%)] mb-10"; // Style gốc cho Main content
  };

  // Padding nội dung bên trong cũng cần điều chỉnh theo cột
  const getInnerPaddingClass = (place?: number) => {
    return place === 3 ? "p-3" : "p-4 pr-6 pl-6";
  };

  const renderSection = (sectionId: string, dragHandleProps?: any, isDragging?: boolean, place?: number) => {
    const containerClass = getSectionContainerClass(place);
    const innerPadding = getInnerPaddingClass(place);

    switch (sectionId) {
      case "avatar":
        return (
          <div key="avatar" className="mt-4 ml-8 relative w-40 h-40 flex-shrink-0">
            <HoverableWrapper
              label={t.avatarLabel}
              sectionId={sectionMap.avatar}
              onClick={onSectionClick}
              className="w-full h-full"
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/80 relative">
                {isPdfMode ? (
                  <div
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundImage: `url(${userData.avatar || "/avatar-female.png"})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '9999px'
                    }}
                  />
                ) : (
                  <Image
                    src={userData.avatar || "/avatar-female.png"}
                    alt="Avatar"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-full"
                  />
                )}
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
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h1 className="pt-12 pr-6 pl-6 text-4xl lg:text-5xl font-bold text-gray-900 uppercase break-words">
                {userData.firstName} {userData.lastName}
              </h1>
              <h2 className="pb-6 pr-6 pl-6 text-xl lg:text-2xl text-gray-600 mt-2 break-words">
                {userData.professional || t.defaultProfessional}
              </h2>
            </HoverableWrapper>
          </div>
        );

      case "experience":
        return (
          <SectionWrapper
            key="experience"
            title={t.workExperience}
            sectionId={sectionMap.experience}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
            place={place} // Truyền place để chỉnh padding
          >
            {(userData.workHistory || []).map((job: any, i: number) => (
              <div key={job.id || i} className="break-words w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                  <h3 className="font-bold text-lg text-gray-800 break-words">{job.title}</h3>
                  <span className="text-sm font-medium text-gray-600 shrink-0 sm:ml-4 mt-1 sm:mt-0">
                    {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                    {job.isCurrent || job.endDate == "Present" || job.endDate == "Hiện tại"
                      ? t.present
                      : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                  </span>
                </div>
                <h4 className="font-semibold text-md text-gray-700 mb-1 break-words">
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
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
            place={place}
          >
            {(userData.education || []).map((edu: any, i: number) => (
              <div key={edu.id || i} className="break-words w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                  <h3 className="font-bold text-lg break-words">{edu.institution}</h3>
                  <span className="text-sm font-medium text-gray-600 shrink-0 sm:ml-4 mt-1 sm:mt-0">
                    {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </span>
                </div>
                <h4 className="font-semibold text-md text-gray-700 break-words">
                  {edu.degree} - {edu.major}
                </h4>
              </div>
            ))}
          </SectionWrapper>
        );

      case "contact":
        return (
          <div key="contact" className={containerClass}>
            <HoverableWrapper
              label={t.personalInfo}
              sectionId={sectionMap.contact}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-full`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
                {t.personalInfoLower}
              </h2>
              <div className="space-y-4 text-gray-700 w-full">
                <div>
                  <strong className="font-semibold block">{t.phone}</strong>
                  <span className="break-words block">{userData.phone}</span>
                </div>
                <div>
                  <strong className="font-semibold block">{t.email}</strong>
                  <span className="break-all block">{userData.email}</span>
                </div>
                <div>
                  <strong className="font-semibold block">{t.address}</strong>
                  <span className="break-words block">
                    {userData.city}, {userData.country}
                  </span>
                </div>
              </div>
            </HoverableWrapper>
          </div>
        );

      case "summary":
        return (
          <div key="summary" className={containerClass}>
            <HoverableWrapper
              label={t.careerObjective}
              sectionId={sectionMap.summary}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-full`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-3 pb-2 border-b-2 border-gray-300 break-words">
                {t.careerObjectiveLower}
              </h2>
              <p className="text-gray-700 leading-relaxed break-words w-full">
                {userData.summary}
              </p>
            </HoverableWrapper>
          </div>
        );

      case "skills":
        return (
          userData.skills?.length > 0 && (
            <div key="skills" className={containerClass}>
              <HoverableWrapper
                label={t.skills}
                sectionId={sectionMap.skills}
                onClick={onSectionClick}
                className={`${innerPadding} relative w-full`}
                isPdfMode={isPdfMode}
                dragHandleProps={dragHandleProps}
                isDragging={isDragging}
              >
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-300 break-words">
                  {t.skillsLower}
                </h2>

                <div className="space-y-6 text-gray-700 w-full">
                  {userData.skills.map((skill: any, i: number) => {
                    const rating = Math.max(0, Math.min(5, Number(skill.rating || 0)));
                    const width = `${(rating / 5) * 100}%`;
                    return (
                      <div key={i} className="group w-full">
                        <div className="flex items-center justify-between gap-6 mb-2">
                          <span className="text-gray-800 font-medium transition-colors group-hover:text-gray-600 break-words">
                            {skill.name}
                          </span>
                          <span className="text-gray-900 text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
                            {rating}/5
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full">
                          <div
                            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full transition-all duration-300 group-hover:from-gray-600 group-hover:to-gray-700"
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

      case "certification":
        return userData.certification?.length > 0 && (
          <div key="certification" className={containerClass}>
            <HoverableWrapper
              label={t.certificationLabel}
              sectionId={sectionMap.certification}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-[100%]`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
                {t.certificationLabel}
              </h2>
              <div className="space-y-4 w-full">
                {userData.certification.map((cert: any, i: number) => (
                  <div key={i} className="w-full">
                    <h3 className="font-bold text-lg text-gray-800 break-words w-full">{cert.title}</h3>
                    <div className="flex flex-wrap gap-2 text-base text-gray-600 mt-1">
                      {cert.startDate && (
                        <span className="whitespace-nowrap">{new Date(cert.startDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}</span>
                      )}
                      {cert.endDate ? (
                        <span className="whitespace-nowrap">- {new Date(cert.endDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}</span>
                      ) : cert.startDate && (
                        <span className="whitespace-nowrap">- {t.present}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </HoverableWrapper>
          </div>
        );

      case "achievement":
        return userData.achievement?.length > 0 && (
          <div key="achievement" className={containerClass}>
            <HoverableWrapper
              label={t.achievementLabel}
              sectionId={sectionMap.achievement}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-full`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
                {t.achievementLabel}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 w-full">
                {userData.achievement.map((ach: string, i: number) => (
                  <li key={i} className="break-words">{ach}</li>
                ))}
              </ul>
            </HoverableWrapper>
          </div>
        );

      case "hobby":
        return userData.hobby?.length > 0 && (
          <div key="hobby" className={containerClass}>
            <HoverableWrapper
              label={t.hobbyLabel}
              sectionId={sectionMap.hobby}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-full`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
                {t.hobbyLabel}
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700 w-full break-words">
                {userData.hobby.map((h: string, i: number) => (
                  <li key={i} className="break-words text-base">{h}</li>
                ))}
              </ul>
            </HoverableWrapper>
          </div>
        );

      case "Project":
        return userData.Project?.length > 0 && (
          <div key="Project" className={containerClass}>
            <HoverableWrapper
              label={t.projectLabel}
              sectionId={sectionMap.Project}
              onClick={onSectionClick}
              className={`${innerPadding} relative w-full`}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b-2 border-gray-300 break-words">
                {t.projectLabel}
              </h2>
              <div className="space-y-4 w-full">
                {userData.Project.map((project: any, i: number) => (
                  <div key={i} className="w-full">
                    <h3 className="font-bold text-lg text-gray-800 break-words w-full">{project.title || project["title "]}</h3>
                    {project.startDate && (
                      <span className="text-base italic text-gray-600 whitespace-nowrap block mb-1">
                        {new Date(project.startDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
                        {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}` : ` - ${t.present}`}
                      </span>
                    )}
                    {project.summary && (
                      <p className="text-base text-gray-700 break-words w-full">{project.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </HoverableWrapper>
          </div>
        );

      default:
        return null;
    }
  };

  // --- DRAGGABLE ITEM ---
  const DraggableItem = ({ id, index, place }: { id: string, index: number, place: number }) => (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => {
        const child = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              ...(snapshot.isDragging ? {
                transform: `${provided.draggableProps.style?.transform || ''} scale(${scale})`,
                transformOrigin: "top left",
                zIndex: 9999,
              } : {})
            }}
          >
             {renderSection(id, provided.dragHandleProps, snapshot.isDragging, place)}
          </div>
        );

        if (snapshot.isDragging) {
          return <DragPortal>{child}</DragPortal>;
        }
        return child;
      }}
    </Draggable>
  );

  // --- PDF VIEW ---
  if (isPdfMode) {
    return (
      <div className="bg-white font-sans text-gray-800 flex flex-row min-h-screen">
        <div className="w-[65%]">
          <div className="flex items-center gap-6 mb-12">
            {headerSections.map(id => (
              <div key={id}>{renderSection(id, undefined, false, 1)}</div>
            ))}
          </div>
          {mainSections.map(id => (
            <div key={id}>{renderSection(id, undefined, false, 3)}</div>
          ))}
        </div>
        <div className="w-[35%] bg-gray-50 p-4">
          {sidebarSections.map(id => (
            <div key={id}>{renderSection(id, undefined, false, 2)}</div>
          ))}
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-white font-sans text-gray-800 flex flex-row min-h-screen">
        {/* LEFT COLUMN (MAIN CONTENT) */}
        <div className="w-[65%]">
          <Droppable droppableId="1" direction="horizontal">
            {(provided) => (
               <div 
                 ref={provided.innerRef} 
                 {...provided.droppableProps}
                 className="flex items-center gap-6 mb-12 min-h-[160px]"
               >
                 {headerSections.map((id, index) => <DraggableItem key={id} id={id} index={index} place={1} />)}
                 {provided.placeholder}
               </div>
            )}
          </Droppable>

          <Droppable droppableId="3">
            {(provided) => (
              <div 
                 ref={provided.innerRef} 
                 {...provided.droppableProps}
                 className="min-h-[300px]"
              >
                {mainSections.map((id, index) => <DraggableItem key={id} id={id} index={index} place={3} />)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* RIGHT SIDEBAR */}
        <Droppable droppableId="2">
          {(provided) => (
            <div 
               ref={provided.innerRef} 
               {...provided.droppableProps}
               className="w-[35%] bg-gray-50 p-4 min-h-[500px]"
            >
               {sidebarSections.map((id, index) => <DraggableItem key={id} id={id} index={index} place={2} />)}
               {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default CVTemplateInspired;