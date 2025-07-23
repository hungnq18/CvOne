export interface Job {
  _id: string;
  title: string;
  description: string;
  role: string;
  workType: string;
  postingDate: string;
  experience: string;
  qualifications: string;
  salaryRange: string;
  location: string;
  country: string;
  benefits: string[];
  skills: string;
  responsibilities: string;
  company_id?: string;
  user_id: string;
  applications?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardJob {
  id: number;
  title: string;
  company: string;
  description: string;
  status?: string;
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
