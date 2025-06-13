// src/lib/fakeApi.ts

export type CVTemplate = {
  id: string;
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
  demoCvData?: any;
};

const demoCvData = {
  userData: {
    firstName: "Nguyen",
    lastName: "Van A",
    professional: "Software Developer",
    city: "Hanoi",
    country: "Vietnam",
    province: "Hanoi",
    phone: "+84 912 345 678",
    email: "vana@example.com",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc38v-qLznWkdUNPXjE858zI06Og_JgVQvpg&s",
    summary: "A passionate developer with 5 years of experience in full-stack development.",
    skills: [
      { name: "JavaScript", rating: 5 },
      { name: "React", rating: 4 },
      { name: "Node.js", rating: 4 },
    ],
    workHistory: [
      {
        title: "Frontend Developer",
        company: "ABC Corp",
        startDate: "2020-01-01",
        endDate: "2022-06-01",
        description: "Worked on UI/UX and SPA using React.",
      },
      {
        title: "Full-stack Developer",
        company: "XYZ Ltd",
        startDate: "2022-07-01",
        endDate: "Present",
        description: "Building scalable web applications with MERN stack.",
      },
    ],
    education: [
      {
        startDate: "2016-09-01",
        endDate: "2020-06-30",
        major: "Computer Science",
        degree: "Bachelor",
        institution: "FPT University",
      },
    ],
  },
  savedCv: {
    userId: "user_123456",
    templateId: "modern-1",
    createdAt: "2025-06-06T10:00:00Z",
    percentComplete: 85,
    titleCV: "Software Developer CV",
    modification: "2025-06-06T10:30:00Z",
    isActive: true,
  },
};

const cvTemplates = [
  // --- Mẫu Modern (Hiện Đại) ---
  {
    id: "modern-1",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Signature',
    isRecommended: true,
    demoCvData: demoCvData,
  },
  {
    id: "modern-2",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Vanguard',
    demoCvData: demoCvData,
  },
  {
    id: "modern-3",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Vibrant',
    demoCvData: demoCvData,
  },

  // --- Mẫu Professional (Chuyên Nghiệp) ---
  {
    id: "professional-1",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Executive',
    demoCvData: demoCvData,
  },
  {
    id: "professional-2",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Classic',
    demoCvData: demoCvData,
  },
  {
    id: "professional-3",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Standard',
    demoCvData: demoCvData,
  },

  // --- Mẫu Minimalist (Tối Giản) ---
  {
    id: "minimalist-1",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Elegant',
    demoCvData: demoCvData,
  },
  {
    id: "minimalist-2",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Streamlined',
    demoCvData: demoCvData,
  },
  {
    id: "minimalist-3",
    imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
    title: 'The Focus',
    demoCvData: demoCvData,
  },
];

// Gọi toàn bộ template
export const getCVTemplates = async (): Promise<CVTemplate[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // mô phỏng delay
  return cvTemplates;
};

// Gọi 1 template theo ID
export const getCVTemplateById = async (id: string): Promise<CVTemplate | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return cvTemplates.find((t) => t.id === id);
};
