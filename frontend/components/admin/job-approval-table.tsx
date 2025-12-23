"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPendingJobsForAdmin, approveJobByAdmin, Job } from "@/api/jobApi";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/providers/global_provider";
import { sendNotification } from "@/api/apiNotification";

export function JobApprovalTable() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await getPendingJobsForAdmin(pageNumber, limit);
      setJobs(res.data || []);
      setTotal(res.total || 0);
      setPage(res.page || pageNumber);
    } catch (error) {
      toast.error(t.admin.jobApproval.messages.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleApprove = async (jobId: string, jobTitle: string, hr: string) => {
    try {
      const approveRes = await approveJobByAdmin(jobId);

      if (!approveRes) return;
      const message = `Chúc mừng bạn! Tin tuyển dụng "${jobTitle}" đã được Admin xét duyệt thành công và hiện đã được công khai trên hệ thống.`;

      const notifData = {
        title: "Job Approved",
        message,
        recipient: hr,
        type: "info",
        jobId: jobId,
      };
      await sendNotification(notifData);

      toast.success(t.admin.jobApproval.messages.approveSuccess);
      fetchJobs(page);
    } catch (error) {
      toast.error(t.admin.jobApproval.messages.approveError);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.admin.jobApproval.title}
        </h1>
        <p className="text-muted-foreground">{t.admin.jobApproval.desc}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t.admin.jobApproval.pendingJobs} ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.jobApproval.table.title}</TableHead>
                <TableHead>{t.admin.jobApproval.table.hr}</TableHead>
                <TableHead>{t.admin.jobApproval.table.location}</TableHead>
                <TableHead>{t.admin.jobApproval.table.postingDate}</TableHead>
                <TableHead>{t.admin.jobApproval.table.deadline}</TableHead>
                <TableHead className="text-right">
                  {t.admin.jobApproval.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {t.admin.jobApproval.table.empty}
                  </TableCell>
                </TableRow>
              )}
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{job.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {job.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/** user_id is populated in API; fallback id string */}
                    <Badge variant="outline">
                      {(job as any).user_id?.email ?? "HR"}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    {job.postingDate
                      ? format(new Date(job.postingDate), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {job.applicationDeadline
                      ? format(new Date(job.applicationDeadline), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        handleApprove(job._id, job.title, job.user_id)
                      }
                      disabled={loading}
                    >
                      {t.admin.jobApproval.approve}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t.admin.manageUser.table.showing} {t.common.page} {page}{" "}
              {t.admin.manageUser.table.of} {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => fetchJobs(page - 1)}
              >
                {t.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading || total === 0}
                onClick={() => fetchJobs(page + 1)}
              >
                {t.common.next}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
