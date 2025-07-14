import React from 'react';
import HoverableSection from '../../../../components/HoverableSection';

interface CascadeProps {
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

const Cascade: React.FC<CascadeProps> = ({ letterData, onSectionClick, isPreview = false }) => {
  const containerClassName = `bg-white font-sans text-sm ${
    isPreview ? 'w-full h-full' : 'shadow-lg w-[21cm] h-[29.7cm] mx-auto'
  }`;

  return (
    <div className={containerClassName}>
      <div className="flex w-full h-full">
        <div className="w-36 bg-gray-800 flex-shrink-0"></div>
        <div className="flex-1 p-5 text-gray-800 space-y-6">

          <HoverableSection sectionId="name" sectionLabel="Name & Contact" onSectionClick={onSectionClick}>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {`${letterData.firstName} ${letterData.lastName}`}
            </h1>
            <div className="text-base text-gray-600 space-y-1 mt-4">
              <p>{letterData.phone}</p>
              <p>{letterData.email}</p>
              <p>{`${letterData.city} ${letterData.state}`}</p>
            </div>
          </HoverableSection>

          <HoverableSection sectionId="date" sectionLabel="Date" onSectionClick={onSectionClick}>
             <p className="text-base text-gray-600">{letterData.date}</p>
          </HoverableSection>

          <HoverableSection sectionId="recipient" sectionLabel="Recipient" onSectionClick={onSectionClick}>
            <div className="text-base leading-relaxed">
              <p>{letterData.companyName}</p>
              <p className="font-semibold">{`${letterData.recipientFirstName} ${letterData.recipientLastName}`}</p>
              <p>{`${letterData.recipientCity} ${letterData.recipientState}`}</p>
            </div>
          </HoverableSection>

          <div className="space-y-4 text-base text-justify">
             <HoverableSection sectionId="greeting" sectionLabel="Greeting" onSectionClick={onSectionClick}>
                <p className="font-semibold">{letterData.greeting}</p>
             </HoverableSection>

             <HoverableSection sectionId="opening" sectionLabel="Opening" onSectionClick={onSectionClick}>
                <p>{letterData.opening}</p>
             </HoverableSection>

             <HoverableSection sectionId="body" sectionLabel="Body" onSectionClick={onSectionClick}>
                <p className="whitespace-pre-line">{letterData.body}</p>
             </HoverableSection>

             <HoverableSection sectionId="callToAction" sectionLabel="Call to Action" onSectionClick={onSectionClick}>
                <p>{letterData.callToAction}</p>
             </HoverableSection>

             <HoverableSection sectionId="closing" sectionLabel="Closing" onSectionClick={onSectionClick}>
                 <p className="mt-6">{letterData.closing}</p>
                 <p className="font-semibold">{letterData.signature}</p>
             </HoverableSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cascade;