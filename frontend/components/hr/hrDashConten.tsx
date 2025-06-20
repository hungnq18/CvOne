import { Eye, ShoppingCart, Package, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/hr/revenue-chart"
import { ProfitChart } from "@/components/hr/profit-chart"
import db from "@/api/db.json"

const stats = [
    {
        title: "Total Revenue",
        value: "$3.456K",
        change: "+0.43%",
        changeType: "positive" as const,
        icon: Eye,
    },
    {
        title: "Total Profit",
        value: "$45.2K",
        change: "+4.35%",
        changeType: "positive" as const,
        icon: ShoppingCart,
    },
    {
        title: "Total Product",
        value: "2.450",
        change: "+2.59%",
        changeType: "positive" as const,
        icon: Package,
    },
    {
        title: "Total Users",
        value: "3.456",
        change: "+0.95%",
        changeType: "positive" as const,
        icon: Users,
    },
]

export function DashboardContent() {
    // Lấy dữ liệu appliedJobs từ db.json
    const appliedJobs = db.appliedJobs || [];

    return (
        <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
            {/* Bảng danh sách các appliedJobs */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Danh sách Applied Jobs</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CV ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cover Letter ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submit At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appliedJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                appliedJobs.map((job: any) => (
                                    <tr key={job.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{job.job_id}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{job.user_id}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{job.cv_id}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{job.coverletter_id || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : job.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{job.status}</span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{new Date(job.submit_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Overview</CardTitle>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>12.04.2022 - 12.05.2022</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Profit this week</CardTitle>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <span className="text-muted-foreground">Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                                <span className="text-muted-foreground">Revenue</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProfitChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
