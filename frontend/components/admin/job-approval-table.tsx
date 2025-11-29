"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPendingJobsForAdmin, approveJobByAdmin, Job } from "@/api/jobApi"
import { format } from "date-fns"
import { toast } from "react-hot-toast"

export function JobApprovalTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchJobs = async (pageNumber: number) => {
    try {
      setLoading(true)
      const res = await getPendingJobsForAdmin(pageNumber, limit)
      setJobs(res.data || [])
      setTotal(res.total || 0)
      setPage(res.page || pageNumber)
    } catch (error) {
      console.error("Failed to fetch pending jobs:", error)
      toast.error("Failed to load pending jobs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [])

  const handleApprove = async (jobId: string) => {
    try {
      await approveJobByAdmin(jobId)
      toast.success("Job approved successfully")
      fetchJobs(page)
    } catch (error) {
      console.error("Failed to approve job:", error)
      toast.error("Failed to approve job")
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approve Jobs</h1>
        <p className="text-muted-foreground">
          Review and approve jobs posted by HR before they appear to candidates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Jobs ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posting Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No pending jobs to approve.
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
                    <Badge variant="outline">{(job as any).user_id?.email ?? "HR"}</Badge>
                  </TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    {job.postingDate ? format(new Date(job.postingDate), "dd/MM/yyyy") : "-"}
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
                      onClick={() => handleApprove(job._id)}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => fetchJobs(page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading || total === 0}
                onClick={() => fetchJobs(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

