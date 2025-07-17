"use client"

import { Eye, ShoppingCart, Package, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStatsChart } from "@/components/admin/user-stats-chart"
import { useEffect, useState } from "react"
import { getAllUsers, User } from "@/api/userApi"
import { getJobs } from "@/api/jobApi"
import { getCVTemplates } from "@/api/cvapi"
import { getCLTemplates } from "@/api/clApi"

interface UserData {
  month: string;
  users: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState([
    {
      title: "Total CV Template",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Eye,
    },
    {
      title: "Total CL Template",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Job",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Total User",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Users,
    },
  ])
  const [userChartData, setUserChartData] = useState<UserData[]>([]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, jobs, cvTemplates, clTemplates] = await Promise.all([
          getAllUsers(),
          getJobs(),
          getCVTemplates(),
          getCLTemplates(),
        ])

        setStats([
          { ...stats[0], value: cvTemplates.length.toString() },
          { ...stats[1], value: clTemplates.length.toString() },
          { ...stats[2], value: jobs.length.toString() },
          { ...stats[3], value: users.length.toString() },
        ])

        const monthlyUserData = processUserData(users);
        setUserChartData(monthlyUserData);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  const processUserData = (users: User[]): UserData[] => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: { [key: string]: number } = {};

    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const monthKey = `${monthNames[monthIndex]}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey]++;
      }
    });

    return monthNames.map(monthName => ({
      month: monthName,
      users: monthlyData[monthName] || 0
    }));
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">{stat.change}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">User Statistics</CardTitle>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Last 12 months</span>
            </div>
          </CardHeader>
          <CardContent>
            <UserStatsChart data={userChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}