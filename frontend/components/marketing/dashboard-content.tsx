"use client"

import { UserCheck, Ticket, Megaphone, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStatsChart } from "@/components/marketing/user-stats-chart"
import { useEffect, useState } from "react"
import { getAllUsers } from "@/api/userApi"
import type { User } from "@/types/auth"
import { getAllVouchers } from "@/api/voucherApi"
import { getAllAds } from "@/api/adsApi"
import { getActiveUsers } from "@/api/analyticsApi"

interface UserData {
  month: string;
  users: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState([
    {
      title: "Active Users (GA)",
      value: "0",
      icon: Activity,
    },
    {
      title: "Active HRs",
      value: "0",
      icon: UserCheck,
    },
    {
      title: "Total Vouchers",
      value: "0",
      icon: Ticket,
    },
    {
      title: "Total Ads Campaigns",
      value: "0",
      icon: Megaphone,
    },
  ])
  const [userChartData, setUserChartData] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, vouchers, ads, activeUsersFromGA] = await Promise.all([
          getAllUsers(),
          getAllVouchers(),
          getAllAds(),
          getActiveUsers().catch((err) => {
            console.error("Failed to fetch GA active users:", err)
            return 0
          }),
        ]);

        // users từ API /users có dạng user + account_id (được populate với { email, role })
        const populatedUsers = users as any[];
        const activeHRs = populatedUsers.filter(
          (u) => u.account_id?.role === "hr",
        ).length;

        setStats((prev) => [
          { ...prev[0], value: activeUsersFromGA.toString() },
          { ...prev[1], value: activeHRs.toString() },
          { ...prev[2], value: vouchers.length.toString() },
          { ...prev[3], value: ads.length.toString() },
        ]);

        const monthlyUserData = processUserData(users as User[]);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">New User Registration Statistics</CardTitle>
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
