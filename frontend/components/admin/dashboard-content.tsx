import { Eye, ShoppingCart, Package, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { ProfitChart } from "@/components/admin/profit-chart"

const stats = [
  {
    title: "Total CV Template",
    value: "$3.456K",
    change: "+0.43%",
    changeType: "positive" as const,
    icon: Eye,
  },
  {
    title: "Total CL Template",
    value: "$45.2K",
    change: "+4.35%",
    changeType: "positive" as const,
    icon: ShoppingCart,
  },
  {
    title: "Total Job",
    value: "2.450",
    change: "+2.59%",
    changeType: "positive" as const,
    icon: Package,
  },
  {
    title: "Total User",
    value: "3.456",
    change: "+0.95%",
    changeType: "positive" as const,
    icon: Users,
  },
]

export function DashboardContent() {
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">User Tracking</CardTitle>
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
            <CardTitle className="text-lg">Newest Job</CardTitle>
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