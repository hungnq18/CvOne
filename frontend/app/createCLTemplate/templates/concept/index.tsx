import React from 'react';
import HoverableSection from '../../../../components/HoverableSection';

interface ConceptProps {
  letterData: {
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    date: string;
    recipientFirstName: string;
    recipientLastName: string;
    companyName: string;
    recipientCity: string;
    recipientState: string;
    subject: string;
    greeting: string;
    opening: string;
    body: string;
    callToAction: string;
    closing: string;
    signature: string;
  };
  onSectionClick?: (sectionId: string) => void;
  isPreview?: boolean;
}

const Concept: React.FC<ConceptProps> = ({ letterData, onSectionClick, isPreview = false }) => {
  const containerClassName = `bg-white w-full font-sans text-sm ${
    isPreview ? 'h-full' : 'shadow-lg min-h-[1123px] max-w-4xl mx-auto'
  }`;

  return (
    <div className={containerClassName}>
      <div className="flex w-full h-full">
        {/* Left Sidebar - Dark Background */}
        <div className="w-72 bg-gray-800 text-white p-8 flex flex-col items-center flex-shrink-0">
          <HoverableSection
            sectionId="name"
            sectionLabel="Name & Contact"
            className="w-full"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            {/* Name and Title */}
            <div className="mb-8 w-full flex flex-col items-center">
              <h1 className="text-3xl font-bold text-white mb-1 leading-tight text-center">
                {letterData.firstName} {letterData.lastName}
              </h1>
              <div className="text-base text-gray-300 font-medium text-center">
                {letterData.profession}
              </div>
            </div>

            {/* Personal Info Title */}
            <div className="w-full mb-2">
              <div className="uppercase text-xs text-gray-400 font-semibold tracking-wider mb-2 border-b border-gray-600 pb-1">Personal Info</div>
            </div>

            {/* Contact Information */}
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span>{letterData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span>{letterData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <span>{`${letterData.city}, ${letterData.state}`}</span>
              </div>
            </div>
            <div className="flex-1"></div>
          </HoverableSection>
        </div>

        {/* Right Main Content */}
        {/* This column defines the overall height */}
        <div className="flex-1 p-8 bg-white min-h-[800px] font-sans">
          {/* Date */}
          <HoverableSection
            sectionId="date"
            sectionLabel="Date"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className=" text-gray-600 text-sm font-medium mb-2">
              {letterData.date}
            </div>
          </HoverableSection>
          {/* Recipient */}
          <HoverableSection
            sectionId="recipient"
            sectionLabel="Recipient"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-700 text-sm leading-relaxed mb-2">
              <div className="font-semibold">{`${letterData.recipientFirstName} ${letterData.recipientLastName}`}</div>
              <div className="italic">{letterData.companyName}</div>
              <div>{`${letterData.recipientCity}, ${letterData.recipientState}`}</div>
            </div>
          </HoverableSection>
          {/* Subject */}
          <HoverableSection
            sectionId="subject"
            sectionLabel="Subject"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 font-semibold text-base mb-2">
              {letterData.subject}
            </div>
          </HoverableSection>
          {/* Greeting */}
          <HoverableSection
            sectionId="greeting"
            sectionLabel="Greeting"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 font-medium text-base mb-2">
              {letterData.greeting}
            </div>
          </HoverableSection>
          {/* Opening Paragraph */}
          <HoverableSection
            sectionId="opening"
            sectionLabel="Opening"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 text-base leading-relaxed text-justify mb-4 whitespace-pre-line">
              {letterData.opening}
            </div>
          </HoverableSection>
          {/* Main Body */}
          <HoverableSection
            sectionId="body"
            sectionLabel="Letter Body"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 text-base leading-relaxed text-justify whitespace-pre-line mb-4">
              {letterData.body}
            </div>
          </HoverableSection>
          {/* Call to Action */}
          <HoverableSection
            sectionId="callToAction"
            sectionLabel="Call to Action"
            className="mb-4"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 text-base leading-relaxed text-justify mb-6 whitespace-pre-line">
              {letterData.callToAction}
            </div>
          </HoverableSection>
          {/* Closing */}
          <HoverableSection
            sectionId="closing"
            sectionLabel="Closing"
            className="mb-2"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="text-gray-800 text-base font-semibold whitespace-pre-line mb-2">
              <div>{letterData.closing}</div>
              <div className="mt-1">{letterData.signature}</div>
            </div>
          </HoverableSection>
          {/* P.S. Section (if any) */}
          {letterData.body && letterData.body.includes('P.S.') && (
            <div className="text-gray-600 text-sm italic mt-4 border-t pt-2">
              {letterData.body.split('P.S.').slice(1).join('P.S.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Concept;