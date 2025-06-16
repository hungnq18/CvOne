import Image from "next/image";


const renderDescription = (desc: string) => {
  if (!desc) return null;
  const lines = desc
    .split(".")
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

const ModernCV1 = ({ data }: { data: any }) => {
  const userData = data?.userData || {};
  const professionalTitle = userData.professional || "Chuyên gia";

  return (
    <div className="bg-white font-sans text-gray-800 flex flex-col lg:flex-row min-h-screen">
      {/* CỘT TRÁI (MÀU XANH) */}
      <div className="w-full lg:w-[38%] bg-[#004d40] text-white p-8 lg:p-12 flex flex-col">
        <div className="flex justify-center mb-10 lg:mb-12">
          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/80">
            <Image
              src={userData.avatar || "/avatar-female.png"}
              alt={`${userData.firstName || ""} ${userData.lastName || ""}`}
              width={300}
              height={375}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* THÔNG TIN CÁ NHÂN */}
        <div className="mb-10 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50">
            THÔNG TIN CÁ NHÂN
          </h2>
          <div className="space-y-4 text-lg lg:text-xl">
            <div>
              <strong className="w-32 shrink-0 block text-base font-bold text-white/70">Điện thoại:</strong>
              <span className="text-lg break-words">{userData.phone}</span>
            </div>
            <div >
              <strong className="w-32 shrink-0 block text-base font-bold text-white/70">Email:</strong>
              <span className="text-lg break-words">{userData.email}</span>
            </div>
            <div >
              <strong className="w-32 shrink-0 block text-base font-bold text-white/70">Địa chỉ:</strong>
              <span className="text-lg break-words">
                {userData.city}, {userData.country}
              </span>
            </div>
          </div>
        </div>

        {/* MỤC TIÊU SỰ NGHIỆP */}
        <div className="mb-10 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50">
            MỤC TIÊU SỰ NGHIỆP
          </h2>
          <p className="text-lg lg:text-xl leading-loose">
            {userData.summary}
          </p>
        </div>

        {/* KỸ NĂNG */}
        {userData.skills?.length > 0 && (
          <div className="">
            <h2 className="text-xl lg:text-2xl font-bold mb-6 pb-3 border-b border-white/50">
              KỸ NĂNG
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-lg lg:text-xl">
              {userData.skills.map((skill: any, i: number) => (
                <li key={i}>{skill.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CỘT PHẢI (MÀU TRẮNG) */}
      <div className="w-full lg:w-[62%]">
        <div className="p-8 lg:p-12 lg:pt-14">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 uppercase">
            {userData.firstName} {userData.lastName}
          </h1>
          <div className="mt-3 inline-block">
            <span className="bg-[#4db6ac] text-white text-xl lg:text-2xl font-bold tracking-wider px-5 py-2">
              {professionalTitle.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="px-8 lg:px-12 pb-8 lg:pb-12">
          <Section title="KINH NGHIỆM LÀM VIỆC">
            {(userData.workHistory || []).map((job: any, i: number) => (
              <div key={i} className="mb-8">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{job.title}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                    {job.startDate?.slice(5, 7)}/{job.startDate?.slice(0, 4)} - {job.endDate === "Present" ? "Hiện tại" : `${job.endDate?.slice(5, 7)}/${job.endDate?.slice(0, 4)}`}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700 mb-3">{job.company}</h4>
                {renderDescription(job.description)}
              </div>
            ))}
          </Section>

          <Section title="HỌC VẤN">
            {(userData.education || []).map((edu: any, i: number) => (
              <div key={i} className="mb-8">
                 <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-bold text-xl">{edu.institution}</h3>
                  <span className="text-base italic text-gray-600 shrink-0 ml-4">
                     {edu.startDate?.slice(0, 4)} - {edu.endDate?.slice(0, 4)}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-700">CHUYÊN NGÀNH: {edu.major}</h4>
                <p className="text-lg">Bằng cấp: {edu.degree}</p>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="mb-10">
      <h2 className="text-gray-800 text-xl lg:text-2xl font-bold tracking-wider mb-1">
         {title}
      </h2>
      <div className="pt-3 border-t-2 border-[#004d40] leading-relaxed">{children}</div>
    </div>
  );
}

export default ModernCV1;