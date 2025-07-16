
import MyJobsClient from '../../components/client/MyJobsClient';

export interface Job {
    _id: string;
    company_id: string;
    account_id: string;
    title: string;
    description: string;
    workType: string;
    postingDate: Date;
    experience: string;
    location: string;
    qualifications: string;
    salaryRange: string;
    country: string;
    skills: string[];
    benefits: string;
    responsibilities: string;
    status: 'saved' | 'applied' | 'archived';
}

export const translations = {
    en: {
        tabs: {
            saved: 'Saved Jobs',
            applied: 'Applied Jobs',
            archived: 'Archived Jobs'
        },
        search: {
            placeholder: 'Search jobs'
        },
        table: {
            title: 'Job Title',
            company: 'Company',
            workType: 'Work Type',
            location: 'Location',
            country: 'Country',
            experience: 'Experience',
            salaryRange: 'Salary Range',
            postingDate: 'Posted Date',
            skills: 'Required Skills',
            actions: 'Actions'
        },
        actions: {
            view: 'Details',
            remove: 'Remove',
            archive: 'Archive',
            apply: 'Apply'
        }
    },
    vi: {
        tabs: {
            saved: 'Công việc đã lưu',
            applied: 'Công việc đã ứng tuyển',
            archived: 'Công việc đã lưu trữ'
        },
        search: {
            placeholder: 'Tìm kiếm công việc'
        },
        table: {
            title: 'Tên công việc',
            company: 'Công ty',
            workType: 'Loại công việc',
            location: 'Địa điểm',
            country: 'Quốc gia',
            experience: 'Kinh nghiệm',
            salaryRange: 'Mức lương',
            postingDate: 'Ngày đăng',
            skills: 'Kỹ năng yêu cầu',
            actions: 'Thao tác'
        },
        actions: {
            view: 'Chi tiết',
            remove: 'Xóa',
            archive: 'Lưu trữ',
            apply: 'Ứng tuyển'
        }
    }
};

export default function Page() {
    return <MyJobsClient />;
} 