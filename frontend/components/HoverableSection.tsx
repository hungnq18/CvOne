import React, { useState } from 'react';

interface HoverableSectionProps {
  children: React.ReactNode;
  sectionId: string;
  sectionLabel: string;
  className?: string;
  onSectionClick?: (sectionId: string) => void;
  fullWidth?: boolean;
}

const HoverableSection: React.FC<HoverableSectionProps> = ({
  children,
  sectionId,
  sectionLabel,
  className = '',
  onSectionClick,
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  return (
    <div
      className={`relative transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${fullWidth ? 'w-full' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      data-section={sectionId}
      style={{ cursor: onSectionClick ? 'pointer' : 'default' }}
    >
      {/* Hover outline */}
      {isHovered && (
        <>
          <div className="absolute inset-0 border-2 border-blue-500 rounded-md pointer-events-none z-10 animate-in fade-in duration-200" />
          {/* Section label */}
          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium z-20 whitespace-nowrap animate-in slide-in-from-top-2 duration-200 shadow-lg">
            {sectionLabel}
            {onSectionClick && <span className="ml-1">✏️</span>}
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 -m-0.5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg -z-10 animate-in fade-in duration-200" />
        </>
      )}

      {/* Section content */}
      <div className={`relative z-5 transition-all duration-200 p-2 ${isHovered ? 'bg-blue-50/30 rounded' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default HoverableSection;