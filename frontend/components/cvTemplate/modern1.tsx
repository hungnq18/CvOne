"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react"; 
import { getDefaultSectionPositions } from "./defaultSectionPositions";
import { notify } from "@/lib/notify";

// --- BƯỚC 2: TẠO ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    avatarLabel: "Avatar",
    fullNameAndTitleLabel: "Full Name & Title",
    personalInfoLabel: "PERSONAL INFORMATION",
    contactLabel: "CONTACT",
    careerObjectiveLabel: "CAREER OBJECTIVE",
    skillsLabel: "SKILLS",
    experienceLabel: "WORK EXPERIENCE",
    educationLabel: "EDUCATION",
    phone: "Phone:",
    email: "Email:",
    address: "Address:",
    present: "Present",
    major: "MAJOR:",
    degree: "Degree:",
    defaultProfessional: "Professional",
    certificationLabel: "CERTIFICATION",
    achievementLabel: "ACHIEVEMENT",
    hobbyLabel: "HOBBY",
    projectLabel: "PROJECT",
  },
  vi: {
    avatarLabel: "Ảnh đại diện",
    fullNameAndTitleLabel: "Họ tên & Chức danh",
    personalInfoLabel: "THÔNG TIN CÁ NHÂN",
    contactLabel: "LIÊN HỆ",
    careerObjectiveLabel: "MỤC TIÊU SỰ NGHIỆP",
    skillsLabel: "KỸ NĂNG",
    experienceLabel: "KINH NGHIỆM LÀM VIỆC",
    educationLabel: "HỌC VẤN",
    phone: "Điện thoại:",
    email: "Email:",
    address: "Địa chỉ:",
    present: "Hiện tại",
    major: "CHUYÊN NGÀNH:",
    degree: "Bằng cấp:",
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

interface HoverableWrapperProps {
  children: React.ReactNode;
  label: string;
  sectionId: string;
  onClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  sectionId: string;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
}

interface ModernCV1Props {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
  cvUiTexts?: any;
  onLayoutChange?: (newPositions: any) => void;
  scale?: number;
}

const HoverableWrapper: React.FC<HoverableWrapperProps> = ({
  children,
  label,
  sectionId,
  onClick,
  isPdfMode = false,
  dragHandleProps,
  isDragging,
}) => {
  if (isPdfMode) {
    return <>{children}</>;
  }

  // --- KHÔI PHỤC LẠI HOVER EFFECT GỐC ---
  const hoverEffectMap: { [key: string]: string } = {
    info: "hover:scale-105 hover:bg-white hover:shadow-lg",
    experience: "hover:scale-105 hover:bg-white hover:shadow-lg",
    education: "hover:scale-105 hover:bg-white hover:shadow-lg",
    contact: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    summary: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    skills: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg",
    hobby: "hover:scale-105 hover:bg-[#004d40] hover:shadow-lg", // Thêm hiệu ứng cho hobby
    avatar: "hover:scale-105 hover:bg-[#004D3F] hover:shadow-lg ",
  };

  const hoverClass = hoverEffectMap[sectionId] || "";
  const borderRadiusClass =
    sectionId === "avatar" ? "rounded-full" : "rounded-lg";

  return (
    <div
      className={`relative group cursor-pointer rounded-lg transition-all duration-300 ease-in-out ${hoverClass} ${
        // Khi đang kéo thì đè style lên để hiển thị đẹp
        isDragging ? "z-50 shadow-2xl ring-4 ring-[#8BAAFC] opacity-100 scale-105 bg-white" : ""
      }`}
      onClick={() => onClick?.(sectionId)}
    >
      {/* --- NÚT KÉO THẢ --- */}
      {!isPdfMode && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 -translate-x-full 
                     w-8 h-8 flex items-center justify-center
                     bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 
                     text-slate-400 hover:text-[#004d40] hover:border-[#8BAAFC] hover:bg-blue-50
                     cursor-grab active:cursor-grabbing 
                     opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-[100]"
          title="Kéo để sắp xếp vị trí"
          onClick={(e) => e.stopPropagation()} 
        >
          <GripVertical size={18} strokeWidth={2.5} />
        </div>
      )}

      {children}
      
      {/* --- VIỀN HOVER --- */}
      {!isPdfMode && (
        <>
          <div
            className={`absolute inset-0 ${borderRadiusClass} border-4 border-[#8BAAFC] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
          ></div>
          
          {/* --- LABEL --- */}
          <div
            className={`absolute top-0 left-4 -translate-y-1/2 bg-[#8BAAFC] text-white text-sm font-bold tracking-wide px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none`}
            style={{
              borderRadius:
                sectionId === "avatar" ? "4px 10px 4px 10px" : "4px 10px 0 0",
              marginTop: "-2%",
              left: sectionId === "avatar" ? "-4%" : "1%",
            }}
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
    .split(". ")
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
  dragHandleProps,
  isDragging
}) => {
  return (
    <div className="mb-10">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      >
        <div className="px-8 lg:px-12 py-4 overflow-hidden">
          <h2 className="text-white-800 text-xl lg:text-2xl font-bold tracking-wider mb-1 break-words">
            {title}
          </h2>
          <div className="pt-3 border-t-2 border-[#004d40] leading-relaxed break-words">
            {children}
          </div>
        </div>
      </HoverableWrapper>
    </div>
  );
};

const ModernCV1: React.FC<ModernCV1Props> = ({
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
      personalInfoLabel: cvUiTexts.personalInformation || defaultT.personalInfoLabel,
      careerObjectiveLabel: cvUiTexts.careerObjective || defaultT.careerObjectiveLabel,
      skillsLabel: cvUiTexts.skills || defaultT.skillsLabel,
      experienceLabel: cvUiTexts.workExperience || defaultT.experienceLabel,
      educationLabel: cvUiTexts.education || defaultT.educationLabel,
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
  
  const sectionPositions =
    data?.sectionPositions ||
    getDefaultSectionPositions(data?.templateTitle || "The Signature");

  const dragWarningMessage =
    lang === "vi"
      ? "Bạn chỉ có thể thả mục trong khu vực bố cục cho phép."
      : "Please drop sections inside the allowed layout areas.";

  const supportedSections = ["avatar", "info", "contact", "summary", "skills", "experience", "education", "certification", "achievement", "hobby", "Project"];
  
  const leftSections = Object.entries(sectionPositions)
    .filter(([key, pos]) => {
      const place = (pos as { place: number }).place;
      return place === 1 && place > 0 && supportedSections.includes(key);
    })
    .sort(([, a], [, b]) => (a as { order: number }).order - (b as { order: number }).order)
    .map(([key]) => key);

  const rightSections = Object.entries(sectionPositions)
    .filter(([key, pos]) => {
      const place = (pos as { place: number }).place;
      return place === 2 && place > 0 && supportedSections.includes(key);
    })
    .sort(([, a], [, b]) => (a as { order: number }).order - (b as { order: number }).order)
    .map(([key]) => key);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      notify.error(dragWarningMessage);
      return;
    }
    if (!onLayoutChange) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourcePlace = parseInt(source.droppableId);
    const destPlace = parseInt(destination.droppableId);
    
    // CHẶN: Không cho phép kéo thả sang place khác
    if (sourcePlace !== destPlace) {
      notify.error(dragWarningMessage);
      return;
    }
    
    const newPositions = { ...sectionPositions };

    const sourceKeys = Object.entries(newPositions)
      .filter(([_, pos]: [string, any]) => pos.place === sourcePlace)
      .sort(([, a]: [string, any], [, b]: [string, any]) => a.order - b.order)
      .map(([key]) => key);

    const destKeys = [...sourceKeys];

    // Chỉ cho phép sắp xếp lại thứ tự trong cùng một place
    const [moved] = destKeys.splice(source.index, 1);
    destKeys.splice(destination.index, 0, moved);

    destKeys.forEach((key, index) => {
      newPositions[key] = { place: destPlace, order: index };
    });

    onLayoutChange(newPositions);
  };

  const renderSectionContent = (sectionId: string, dragHandleProps?: any, isDragging?: boolean) => {
    switch (sectionId) {
      case "avatar":
        return (
          <div className="px-8 lg:px-12 w-full" key="avatar">
            <div className="flex justify-center">
              <HoverableWrapper
                label={t.avatarLabel}
                sectionId="avatar"
                onClick={onSectionClick}
                isPdfMode={isPdfMode}
                dragHandleProps={dragHandleProps}
                isDragging={isDragging}
              >
                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/80 relative">
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
                      alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              </HoverableWrapper>
            </div>
          </div>
        );

      case "contact":
        return (
          <HoverableWrapper
            key="contact"
            label={t.personalInfoLabel}
            sectionId="contact"
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="px-8 lg:px-12">
              <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
                {t.personalInfoLabel}
              </h2>
              <div className="space-y-4 text-lg lg:text-xl">
                <div>
                  <strong className="block text-base font-bold text-white/70">{t.phone}</strong>
                  <span className="text-lg break-words">{userData.phone}</span>
                </div>
                <div>
                  <strong className="block text-base font-bold text-white/70">{t.email}</strong>
                  <span className="text-lg break-words">{userData.email}</span>
                </div>
                <div>
                  <strong className="block text-base font-bold text-white/70">{t.address}</strong>
                  <span className="text-lg break-words">{userData.city}, {userData.country}</span>
                </div>
              </div>
            </div>
          </HoverableWrapper>
        );

      case "summary":
        return (
          <HoverableWrapper
            key="summary"
            label={t.careerObjectiveLabel}
            sectionId="summary"
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="px-8 lg:px-12">
              <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
                {t.careerObjectiveLabel}
              </h2>
              <p className="text-lg lg:text-xl leading-loose">{userData.summary}</p>
            </div>
          </HoverableWrapper>
        );

      case "skills":
        return userData.skills?.length > 0 && (
            <Section
              key="skills"
              title={t.skillsLabel}
              sectionId="skills"
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="space-y-8">
                {userData.skills.map((skill: any, i: number) => {
                  const rating = Math.max(0, Math.min(5, Number(skill.rating || 0)));
                  const width = `${(rating / 5) * 100}%`;
                  return (
                    <div key={i} className="group">
                      <div className="flex items-start justify-between gap-6 mb-3 text-white-600 group-hover:text-teal-200">
                        <span className="text-lg font-normal leading-relaxed flex-1 transition-colors duration-200">{skill.name}</span>
                        <span className="text-2xl font-normal whitespace-nowrap flex-shrink-0">{rating}/5</span>
                      </div>
                      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400/60 to-teal-300/60 rounded-full transition-all duration-500 ease-out" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          );

      case "info":
        return (
          <HoverableWrapper
            key="info"
            label={t.fullNameAndTitleLabel}
            sectionId="info"
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="p-8 lg:p-12 lg:pt-14">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 uppercase">
                {userData.firstName} {userData.lastName}
              </h1>
              <div className="mt-8 inline-block">
                <span className="bg-[#4db6ac] text-white text-xl lg:text-2xl font-bold tracking-wider px-5 py-2">
                  {(userData.professional || t.defaultProfessional).toUpperCase()}
                </span>
              </div>
            </div>
          </HoverableWrapper>
        );

      case "experience":
        return (
          <Section
            key="experience"
            title={t.experienceLabel}
            sectionId="experience"
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            {(userData.workHistory || []).map((job: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{job.title}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                    {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                    {job.isCurrent || job.endDate == "Present" || job.endDate == "Hiện tại"
                      ? t.present
                      : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700 mb-3">{job.company}</h4>
                {renderDescription(job.description)}
              </div>
            ))}
          </Section>
        );

      case "education":
        return (
          <Section
            key="education"
            title={t.educationLabel}
            sectionId="education"
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            {(userData.education || []).map((edu: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{edu.institution}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                    {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700">{t.major} {edu.major}</h4>
                <p className="text-lg">{t.degree} {edu.degree}</p>
              </div>
            ))}
          </Section>
        );

      case "certification":
        return userData.certification?.length > 0 && (
          <Section
            key="certification"
            title={t.certificationLabel}
            sectionId="certification"
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            {(userData.certification || []).map((cert: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0 break-words">
                <h3 className="font-bold text-xl break-words">{cert.title}</h3>
                <div className="flex flex-wrap gap-4 text-base text-gray-600 mt-1">
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
          </Section>
        );

      case "achievement":
        return userData.achievement?.length > 0 && (
          <Section
            key="achievement"
            title={t.achievementLabel}
            sectionId="achievement"
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <ul className="list-disc pl-6 space-y-2 text-lg leading-relaxed">
              {(userData.achievement || []).map((ach: string, i: number) => (
                <li key={i}>{ach}</li>
              ))}
            </ul>
          </Section>
        );

      // --- PHẦN HOBBY ĐÃ ĐƯỢC REDESIGN ---
      case "hobby":
        return userData.hobby?.length > 0 && (
          <HoverableWrapper
            key="hobby"
            label={t.hobbyLabel}
            sectionId="hobby"
            onClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="px-8 lg:px-12">
               {/* Tiêu đề giống style Contact/Summary bên trái */}
              <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50 pt-3">
                {t.hobbyLabel}
              </h2>
              {/* Danh sách text thay vì tags để phù hợp nền tối */}
              <ul className="space-y-3">
                {(userData.hobby || []).map((h: string, i: number) => (
                  <li key={i} className="text-lg lg:text-xl break-words">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </HoverableWrapper>
        );

      case "Project":
        return userData.Project?.length > 0 && (
          <Section
            key="Project"
            title={t.projectLabel}
            sectionId="Project"
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            {(userData.Project || []).map((project: any, i: number) => (
              <div key={i} className="mb-8 last:mb-0">
                <h3 className="font-bold text-xl">{project.title || project["title "]}</h3>
                {project.startDate && (
                  <span className="text-base italic text-gray-600">
                    {new Date(project.startDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
                    {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}` : ` - ${t.present}`}
                  </span>
                )}
                {project.summary && (
                  <p className="text-lg mt-2">{project.summary}</p>
                )}
              </div>
            ))}
          </Section>
        );

      default:
        return null;
    }
  };

  const DraggableItem = ({ id, index }: { id: string, index: number }) => (
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
             {renderSectionContent(id, provided.dragHandleProps, snapshot.isDragging)}
          </div>
        );

        if (snapshot.isDragging) {
          return <DragPortal>{child}</DragPortal>;
        }
        return child;
      }}
    </Draggable>
  );

  if (isPdfMode) {
    return (
      <div className="bg-white font-sans text-gray-800 flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-[38%] bg-[#004d40] text-white flex flex-col gap-8 py-8 lg:py-12">
          {leftSections.map((id) => (
            <div key={id}>{renderSectionContent(id)}</div>
          ))}
        </div>
        <div className="w-full lg:w-[62%]">
          {rightSections.map((id) => (
            <div key={id}>{renderSectionContent(id)}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-white font-sans text-gray-800 flex flex-col lg:flex-row min-h-screen">
        
        <Droppable droppableId="1">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className="w-full lg:w-[38%] bg-[#004d40] text-white flex flex-col gap-8 py-8 lg:py-12 min-h-[500px]"
            >
              {leftSections.map((id, index) => (
                <DraggableItem key={id} id={id} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="2">
          {(provided) => (
            <div 
               ref={provided.innerRef} 
               {...provided.droppableProps}
               className="w-full lg:w-[62%] min-h-[500px]"
            >
              {rightSections.map((id, index) => (
                 <DraggableItem key={id} id={id} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default ModernCV1;