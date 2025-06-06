import ProfileProgress from '@/components/ui/CVProgress';
import AppliedJobs from '@/components/ui/applyJob';
import SuggestedJobs from '@/components/ui/SuggestedJobs';
import FavoriteJobs from '@/components/ui/FavoriteJobs';
import CVList from '@/components/ui/cvList';
import styles from './page.module.css';


export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  status?: string;
}

export interface CV {
  _id: string;
  title?: string;
  image?: string;
  user_id: string;
  description?: string;
  languages?: string[];
  create_at: string;
  is_public: boolean;
  templateCV_id: string;
  heading?: string;
  education?: string[];
  work_history?: string[];
  skill?: string[];
  summary?: string;
  finalize: boolean;
}

export interface ApplyJob {
  id: string;
  job_id: string;
  user_id: string;
  cv_id: string;
  coverletter_id?: string;
  status: string;
  submit_at: string;
}

export default function Home() {
  const profileProgress = 75;
  const appliedJobs: ApplyJob[] = [
    { id: 'apply1', job_id: 'job1', user_id: 'user1', cv_id: 'cv1', coverletter_id: 'cover1', status: 'Applied', submit_at: '2025-06-04' },
    { id: 'apply2', job_id: 'job2', user_id: 'user2', cv_id: 'cv2', coverletter_id: 'cover2', status: 'Interview Scheduled', submit_at: '2025-06-03' },
  ];
  const suggestedJobs: Job[] = [
    { id: 3, title: 'React Developer', company: 'Innovate Ltd', description: 'Remote, $50/hr' },
    { id: 4, title: 'Graphic Designer', company: 'Creative Agency', description: 'On-site, $40/hr' },
  ];
  const favoriteJobs: Job[] = [
    { id: 5, title: 'Backend Engineer', company: 'CodeMaster', description: 'Full-time, $60/hr' },
    { id: 6, title: 'Game Developer', company: 'PlayZone', description: 'Remote, $55/hr' },
  ];
  const cvList: CV[] = [
    {
      _id: 'cv1',
      title: 'CV - Web Developer',
      image: 'https://i-vn2.joboko.com/blogs/img/va/2021/11/16/anh-cv-nen-de-anh-gi-1.jpg',
      user_id: 'user1',
      description: 'CV for web developer role',
      languages: ['English', 'Vietnamese'],
      create_at: '2025-06-01',
      is_public: true,
      templateCV_id: 'template1',
      heading: 'Web Developer Resume',
      education: ['BSc Computer Science - XYZ University'],
      work_history: ['Web Developer at Tech Corp (2023-2025)'],
      skill: ['React', 'Node.js', 'TypeScript'],
      summary: 'Experienced web developer with 3+ years in React and Node.js',
      finalize: true,
    },
    {
      _id: 'cv2',
      title: 'CV - Designer',
      image: 'https://i-vn2.joboko.com/blogs/img/va/2021/11/16/anh-cv-nen-de-anh-gi-1.jpg',
      user_id: 'user2',
      description: 'CV for UI/UX designer role',
      languages: ['English'],
      create_at: '2025-05-30',
      is_public: false,
      templateCV_id: 'template2',
      heading: 'UI/UX Designer Resume',
      education: ['BA Design - ABC University'],
      work_history: ['Designer at Design Studio (2022-2025)'],
      skill: ['Figma', 'Adobe XD'],
      summary: 'Creative designer with expertise in UI/UX',
      finalize: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột bên trái: ProfileProgress và ảnh CV */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-6">
              <ProfileProgress progress={profileProgress} cvImage={cvList[0].image} />
            </div>
          </div>

          {/* Cột bên phải: Các section khác */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <AppliedJobs jobs={appliedJobs} />
            </div>
            <div className="sm:col-span-2">
              <SuggestedJobs jobs={suggestedJobs} />
            </div>
            <div className="sm:col-span-2">
              <FavoriteJobs jobs={favoriteJobs} />
            </div>
            <div className="sm:col-span-2">
              <CVList cvList={cvList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}