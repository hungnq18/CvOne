"use client";

import React from "react";

// Helper để render mô tả công việc
const renderDescription = (desc: string) => {
  if (!desc) return null;
  const lines = desc
    .split(".")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return (
    <ul className="list-disc pl-6 space-y-2 text-lg lg:text-xl leading-relaxed">
      {lines.map((line, idx) => (
        <li key={idx} className="text-gray-700">{line}</li>
      ))}
    </ul>
  );
};

// Component Section được thiết kế tối giản
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl lg:text-2xl font-bold uppercase text-gray-800 tracking-wider pb-3 mb-6 border-b border-gray-300">
        {title}
      </h2>
      <div className="space-y-8">
        {children}
      </div>
    </section>
  );
}

const MinimalistCV1 = ({ data }: { data: any }) => {
  const userData = data?.userData || {};
  const professionalTitle = userData.professional || "Chuyên gia";

  return (
    <div className="bg-white font-sans text-gray-900 max-w-5xl mx-auto p-8 md:p-12 lg:p-16">
      
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase">
          {userData.firstName} {userData.lastName}
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 mt-3 tracking-wide">
          {professionalTitle}
        </p>

        <div className="mt-8 text-lg text-gray-500 flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
          <span>{userData.phone}</span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span>{userData.email}</span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span>{userData.city}, {userData.country}</span>
        </div>
      </header>

      <main>
        <div className="mb-16">
          <p className="text-lg lg:text-xl text-center text-gray-700 leading-loose max-w-3xl mx-auto">
            {userData.summary}
          </p>
        </div>

        <Section title="Kinh nghiệm làm việc">
          {(userData.workHistory || []).map((job: any, i: number) => (
            <div key={i}>
              <div className="flex flex-col sm:flex-row justify-between items-baseline mb-2">
                <div>
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="text-lg font-semibold text-gray-700">{job.company}</p>
                </div>
                <p className="text-base text-gray-500 mt-1 sm:mt-0">
                  {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} - 
                  {job.endDate === "Present" ? " Hiện tại" : ` ${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                </p>
              </div>
              {renderDescription(job.description)}
            </div>
          ))}
        </Section>

        <Section title="Học vấn">
          {(userData.education || []).map((edu: any, i: number) => (
            <div key={i}>
              <div className="flex flex-col sm:flex-row justify-between items-baseline mb-2">
                <div>
                  <h3 className="text-xl font-bold">{edu.institution}</h3>
                  <p className="text-lg text-gray-700">{edu.major}</p>
                  <p className="text-lg text-gray-700">Bằng cấp: {edu.degree}</p>
                </div>
                <p className="text-base text-gray-500 mt-1 sm:mt-0">
                  {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                </p>
              </div>
            </div>
          ))}
        </Section>

        {userData.skills?.length > 0 && (
          <Section title="Kỹ năng">
            <ul className="columns-2 sm:columns-3 list-disc pl-6 text-lg lg:text-xl text-gray-700 space-y-2">
              {userData.skills.map((skill: any, i: number) => (
                <li key={i}>{skill.name}</li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </div>
  );
};

export default MinimalistCV1;