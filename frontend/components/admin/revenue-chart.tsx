"use client"

import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts"

const data = [
  { month: "Sep", revenue: 30, sales: 25 },
  { month: "Oct", revenue: 25, sales: 15 },
  { month: "Nov", revenue: 35, sales: 22 },
  { month: "Dec", revenue: 28, sales: 18 },
  { month: "Jan", revenue: 45, sales: 35 },
  { month: "Feb", revenue: 35, sales: 28 },
  { month: "Mar", revenue: 65, sales: 45 },
  { month: "Apr", revenue: 55, sales: 38 },
  { month: "May", revenue: 60, sales: 42 },
  { month: "Jun", revenue: 35, sales: 25 },
  { month: "Jul", revenue: 40, sales: 30 },
  { month: "Aug", revenue: 50, sales: 40 },
]

export function RevenueChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}