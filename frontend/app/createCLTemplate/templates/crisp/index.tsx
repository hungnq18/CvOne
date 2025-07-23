import React from 'react';
import HoverableSection from '../../../../components/HoverableSection';

// Định nghĩa props cho Crisp template
interface CrispProps {
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

const Crisp: React.FC<CrispProps> = ({ letterData, onSectionClick, isPreview = false }) => {
  const hasPS = letterData.body?.includes('P.S.');
  const mainBody = hasPS ? letterData.body.split('P.S.')[0].trim() : letterData.body;
  const psContent = hasPS ? `P.S. ${letterData.body.split('P.S.').slice(1).join('P.S.').trim()}` : '';

  const containerClassName = `bg-white font-sans text-sm ${
    isPreview ? 'w-full h-full' : 'shadow-lg w-[794px] min-h-[1123px] mx-auto'
  }`;

  return (
    <div className={containerClassName}>
      <div className="flex gap-10 w-full p-10">
        {/* Left Sidebar */}
        <div className="w-48 flex-shrink-0">
          <HoverableSection
            sectionId="name"
            sectionLabel="Name & Contact"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{`${letterData.firstName} ${letterData.lastName}`}</h1>
              <p className="text-md text-gray-600 mt-1">{letterData.profession}</p>
            </div>
            <div className="border-t border-gray-300 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Info
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0119 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{letterData.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{letterData.email}</span>
                </div>
              </div>
            </div>
          </HoverableSection>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 text-gray-700 text-sm leading-relaxed">
          <HoverableSection
            sectionId="date"
            sectionLabel="Date"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <p className="mb-8">{letterData.date}</p>
          </HoverableSection>

          <HoverableSection
            sectionId="recipient"
            sectionLabel="Recipient"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="mb-8">
              <p className="font-bold">{`${letterData.recipientFirstName} ${letterData.recipientLastName}`}</p>
              <p>{letterData.companyName}</p>
              <p>{`${letterData.recipientCity}, ${letterData.recipientState}`}</p>
            </div>
          </HoverableSection>

          <HoverableSection
            sectionId="greeting"
            sectionLabel="Greeting"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <p className="mb-4 font-medium">{letterData.greeting}</p>
          </HoverableSection>

          <HoverableSection
            sectionId="opening"
            sectionLabel="Opening"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <p className="mb-4 text-justify whitespace-pre-line">{letterData.opening}</p>
          </HoverableSection>

          <HoverableSection
            sectionId="body"
            sectionLabel="Letter Body"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="whitespace-pre-line mb-4 text-justify">{mainBody}</div>
          </HoverableSection>

          <HoverableSection
            sectionId="callToAction"
            sectionLabel="Call to Action"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <p className="mb-6 text-justify whitespace-pre-line">{letterData.callToAction}</p>
          </HoverableSection>

          <HoverableSection
            sectionId="closing"
            sectionLabel="Closing"
            onSectionClick={onSectionClick}
            fullWidth={true}
          >
            <div className="whitespace-pre-line">{letterData.closing}</div>
            <div className="whitespace-pre-line mt-4">{letterData.signature}</div>
          </HoverableSection>

          {psContent && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs italic text-gray-500">
              {psContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crisp;