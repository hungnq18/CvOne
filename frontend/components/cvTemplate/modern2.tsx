"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
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
    certificationLabel: "CERTIFICATION",
    achievementLabel: "ACHIEVEMENT",
    hobbyLabel: "HOBBY",
    projectLabel: "PROJECT",
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

// --- PROPS INTERFACES ---
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

interface Modern2Props {
  data: any;
  onSectionClick?: (sectionId: string) => void;
  isPdfMode?: boolean;
  language?: string;
  cvUiTexts?: any;
  onLayoutChange?: (newPositions: any) => void;
  scale?: number;
}

// --- COMPONENTS ---
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
      className={`relative group cursor-pointer transition-all duration-300 ease-in-out ${hoverClass} ${
        isDragging ? "z-50 shadow-2xl ring-4 ring-blue-400 opacity-100 bg-white scale-[1.02]" : ""
      }`}
      onClick={() => onClick?.(sectionId)}
    >
       {/* --- DRAG HANDLE --- */}
       {!isPdfMode && (
        <div
          {...dragHandleProps}
          className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full 
                     w-8 h-8 flex items-center justify-center
                     bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 
                     text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50
                     cursor-grab active:cursor-grabbing 
                     opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-[100]"
          title="Kéo để sắp xếp vị trí"
          onClick={(e) => e.stopPropagation()} 
        >
          <GripVertical size={18} strokeWidth={2.5} />
        </div>
      )}

      {children}
      <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="absolute top-0 left-6 -translate-y-1/2 bg-blue-600 text-white text-xs font-semibold tracking-wider px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-full shadow-md z-10">
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
  dragHandleProps,
  isDragging
}) => {
  return (
    <div className="mb-6 px-8">
      <HoverableWrapper
        label={title}
        sectionId={sectionId}
        onClick={onSectionClick}
        isPdfMode={isPdfMode}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      >
        <div className="bg-card rounded-xl p-8 shadow-md border-2 border-border elegant-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>

          <div className="mb-4 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight break-words">
                {title}
              </h2>
            </div>
            <div className="ml-6 w-20 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          <div className="text-card-foreground relative z-10 break-words overflow-hidden">{children}</div>
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
  cvUiTexts,
  onLayoutChange,
  scale = 1,
}) => {
  const lang = language || "vi";
  const defaultT = translations[lang as "en" | "vi"];
  // Sử dụng cvUiTexts từ API nếu có, fallback về translations mặc định
  const t = {
    ...defaultT,
    ...(cvUiTexts && {
      personalInfoLabel: cvUiTexts.personalInformation || defaultT.personalInfoLabel,
      careerObjectiveLabel: cvUiTexts.careerObjective || defaultT.careerObjectiveLabel,
      skillsLabel: cvUiTexts.skills || defaultT.skillsLabel,
      experienceLabel: cvUiTexts.workExperience || defaultT.experienceLabel,
      educationLabel: cvUiTexts.education || defaultT.educationLabel,
      phone: cvUiTexts.phone || defaultT.phone,
      email: cvUiTexts.email || defaultT.email,
      address: cvUiTexts.address || defaultT.address,
      dateOfBirth: cvUiTexts.dateOfBirth || defaultT.dateOfBirth,
      gender: cvUiTexts.gender || defaultT.gender,
    }),
  };

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
    certification: "certification",
    achievement: "achievement",
    hobby: "hobby",
    Project: "Project",
  };

  // --- Tính toán vị trí hiển thị section ---
  const sectionPositions =
    data?.sectionPositions ||
    getDefaultSectionPositions(data?.templateTitle || "The Modern");

  type SectionPosition = { place: number; order: number };

  // Vì Template này chỉ có 1 cột (đang render thẳng tuột), nên ta gom hết vào 1 Droppable duy nhất (id="1")
  // Hoặc nếu logic của bạn chia cột thì phải chia Droppable tương ứng.
  // Dựa trên code cũ, template này render từ trên xuống dưới -> 1 cột.
  
  // QUAN TRỌNG: Chỉ lấy các sections có place > 0 (place = 0 nghĩa là ẩn/không hiển thị)
  // Và chỉ lấy các sections thực sự được hỗ trợ trong template này
  const supportedSections = ["info", "contact", "summary", "education", "experience", "skills", "certification", "achievement", "hobby", "Project"];
  
  const sections = Object.entries(sectionPositions)
    .filter(([key, pos]) => {
      const posA = pos as SectionPosition;
      return posA.place > 0 && supportedSections.includes(key);
    })
    .sort(([, a], [, b]) => {
      const posA = a as SectionPosition;
      const posB = b as SectionPosition;
      if (posA.place !== posB.place) return posA.place - posB.place;
      return posA.order - posB.order;
    })
    .map(([key]) => key);

  const handleDragEnd = (result: DropResult) => {
    if (!onLayoutChange || !result.destination) return;

    const { source, destination } = result;

    // Nếu thả về chỗ cũ
    if (source.index === destination.index) return;

    // Logic Reorder cho 1 danh sách duy nhất
    const newSections = Array.from(sections);
    const [moved] = newSections.splice(source.index, 1);
    newSections.splice(destination.index, 0, moved);

    // Cập nhật lại Order trong object positions
    // Lưu ý: Template này có vẻ dùng place để phân nhóm (1, 2, 3), nhưng render thì lại gộp chung.
    // Để đơn giản và giữ đúng logic hiển thị, ta sẽ gán lại place=1 cho tất cả (hoặc giữ nguyên logic cũ nếu phức tạp hơn).
    // Tuy nhiên, cách an toàn nhất là chỉ cập nhật order dựa trên vị trí mới trong mảng đã sort.
    
    const newPositions = { ...sectionPositions };
    
    // Cập nhật lại order sao cho thứ tự hiển thị khớp với mảng newSections
    // Để tránh xung đột place, ta có thể set lại place tăng dần hoặc giữ nguyên place cũ nhưng đổi order.
    // Cách đơn giản nhất cho Single Column Layout: Reset toàn bộ về cùng 1 Place và tăng Order.
    
    newSections.forEach((key, index) => {
       newPositions[key] = { place: 1, order: index };
    });

    onLayoutChange(newPositions);
  };


  const styles = `
    .professional-card {
      transition: all 0.3s ease;
    }
    .professional-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  `;

  // --- Hàm Render Nội dung ---
  const renderSectionContent = (sectionId: string, dragHandleProps?: any, isDragging?: boolean) => {
    switch (sectionId) {
      // --- AVATAR & INFO (HERO SECTION) ---
      case "info":
        return (
          <div className="mb-6">
            <HoverableWrapper
              key="info"
              label={t.fullNameAndTitleLabel}
              sectionId={sectionMap.info}
              onClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
                <div className="flex items-center gap-8">
                  <div className="shrink-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {isPdfMode ? (
                        <img
                          src={userData.avatar || "/professional-woman-portrait.png"}
                          alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={userData.avatar || "/professional-woman-portrait.png"}
                          alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
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
          </div>
        );

      case "avatar":
        return null; // Avatar đã nằm trong Info

      // --- CONTACT ---
      case "contact":
        return (
          <div className="mb-6">
            <HoverableWrapper
              key="contact"
              label={t.personalInfoLabel}
              sectionId={sectionMap.contact}
              onClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="bg-slate-100 px-8 py-4 border-b-2 border-blue-600">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {userData.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">{t.dateOfBirth}</span>
                      <span className="text-slate-700">{userData.dateOfBirth}</span>
                    </div>
                  )}
                  {userData.gender && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">{t.gender}</span>
                      <span className="text-slate-700">{userData.gender}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">{t.phone}</span>
                      <span className="text-slate-700">{userData.phone}</span>
                    </div>
                  )}
                  {userData.email && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-semibold">{t.email}</span>
                      <span className="text-slate-700 break-all">{userData.email}</span>
                    </div>
                  )}
                  {(userData.city || userData.country) && (
                    <div className="flex items-center gap-3 col-span-2">
                      <span className="text-slate-600 font-semibold">{t.address}</span>
                      <span className="text-slate-700">
                        {userData.city}{userData.city && userData.country && ", "}{userData.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </HoverableWrapper>
          </div>
        );

      // --- SUMMARY ---
      case "summary":
        return userData.summary && (
            <Section
              key="summary"
              title={t.careerObjectiveLabel}
              sectionId={sectionMap.summary}
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="professional-card bg-white p-6 border-l-4 border-blue-600">
                <p className="text-slate-700 leading-relaxed text-pretty">
                  {userData.summary}
                </p>
              </div>
            </Section>
        );

      // --- EDUCATION ---
      case "education":
        return userData.education?.length > 0 && (
            <Section
              key="education"
              title={t.educationLabel}
              sectionId={sectionMap.education}
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="space-y-6">
                {userData.education.map((edu: any, i: number) => (
                  <div key={i} className="professional-card bg-slate-50 p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{edu.degree}</h3>
                        <p className="text-blue-700 font-semibold">{edu.institution}</p>
                      </div>
                      <span className="text-sm text-slate-600 bg-white px-4 py-1.5 rounded border border-slate-300 shrink-0 ml-4 font-medium">
                        {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                      </span>
                    </div>
                    {edu.major && (
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-semibold">{t.major}</span> {edu.major}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
        );

      // --- EXPERIENCE ---
      case "experience":
        return userData.workHistory?.length > 0 && (
            <Section
              key="experience"
              title={t.experienceLabel}
              sectionId={sectionMap.experience}
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="space-y-4">
                {userData.workHistory.map((job: any, i: number) => (
                  <div key={i} className="professional-card bg-slate-50 p-4 border-l-4 border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-800 mb-1">{job.title}</h3>
                        <p className="text-blue-700 font-semibold">{job.company}</p>
                      </div>
                      <span className="text-sm text-slate-600 bg-white px-4 py-1.5 rounded border border-slate-300 shrink-0 ml-4 font-medium">
                        {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} -{" "}
                        {job.isCurrent || job.endDate === "Present" || job.endDate === "Hiện tại"
                          ? t.present
                          : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                      </span>
                    </div>
                    <div className="mt-3">
                      {renderDescription(job.description)}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
        );

      // --- SKILLS ---
      case "skills":
        return userData.skills?.length > 0 && (
            <Section
              key="skills"
              title={t.skillsLabel}
              sectionId={sectionMap.certification}
              onSectionClick={onSectionClick}
              isPdfMode={isPdfMode}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                {userData.skills.map((skill: any, i: number) => {
                  const rating = Math.max(0, Math.min(5, Number(skill.rating || 0)));
                  const width = `${(rating / 5) * 100}%`;
                  return (
                    <div key={i} className="group flex flex-col justify-between min-h-[40px]">
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
        );

      case "certification":
        return userData.certification?.length > 0 && (
          <Section
            key="certification"
            title={cvUiTexts?.certification || t.certificationLabel}
            sectionId={sectionMap.certification}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="space-y-4">
              {userData.certification.map((cert: any, i: number) => (
                <div key={i} className="professional-card bg-slate-50 p-6 border-l-4 border-blue-500 break-words overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 break-words">{cert.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
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
          </Section>
        );

      case "achievement":
        return userData.achievement?.length > 0 && (
          <Section
            key="achievement"
            title={cvUiTexts?.achievement || t.achievementLabel}
            sectionId={sectionMap.achievement}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <ul className="space-y-2 text-base leading-relaxed break-words overflow-hidden">
              {userData.achievement.map((ach: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-primary mt-1.5 shrink-0">•</span>
                  <span className="text-foreground break-words">{ach}</span>
                </li>
              ))}
            </ul>
          </Section>
        );

      case "hobby":
        return userData.hobby?.length > 0 && (
          <Section
            key="hobby"
            title={cvUiTexts?.hobby || t.hobbyLabel}
            sectionId={sectionMap.hobby}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="flex flex-wrap gap-2">
              {userData.hobby.map((h: string, i: number) => (
                <span key={i} className="bg-slate-700 text-white px-4 py-2 rounded-full text-sm">
                  {h}
                </span>
              ))}
            </div>
          </Section>
        );

      case "Project":
        return userData.Project?.length > 0 && (
          <Section
            key="Project"
            title={cvUiTexts?.project || t.projectLabel}
            sectionId={sectionMap.Project}
            onSectionClick={onSectionClick}
            isPdfMode={isPdfMode}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
          >
            <div className="space-y-4">
              {userData.Project.map((project: any, i: number) => (
                <div key={i} className="professional-card bg-slate-50 p-6 border-l-4 border-slate-700 break-words overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 break-words">{project.title || project["title "]}</h3>
                  {project.startDate && (
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      {new Date(project.startDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}` : ` - ${t.present}`}
                    </span>
                  )}
                  {project.summary && (
                    <p className="text-sm text-slate-700 mt-2 break-words">{project.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        );

      default:
        return null;
    }
  };

  // --- DRAGGABLE ITEM WRAPPER ---
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

  // --- RENDER MODE PDF ---
  if (isPdfMode) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="bg-slate-50 min-h-screen font-sans">
          <div className="max-w-4xl mx-auto bg-white shadow-sm min-h-screen pb-8">
            {sections.map((id) => renderSectionContent(id))}
          </div>
        </div>
      </>
    );
  }

  // --- RENDER MODE EDITOR (DRAG & DROP) ---
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="bg-slate-50 min-h-screen font-sans">
        {/* Lưu ý: Nếu template này chỉ có 1 cột, ta dùng 1 Droppable duy nhất. 
          Ở đây tôi dùng id="1" làm droppableId mặc định.
        */}
        <Droppable droppableId="1">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className="max-w-4xl mx-auto bg-white shadow-sm min-h-screen pb-8"
            >
              {sections.map((id, index) => (
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

export default Modern2;