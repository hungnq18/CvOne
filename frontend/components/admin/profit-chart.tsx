"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "M", sales: 55, revenue: 45 },
  { day: "T", sales: 75, revenue: 65 },
  { day: "W", sales: 60, revenue: 50 },
  { day: "T", sales: 80, revenue: 70 },
  { day: "F", sales: 35, revenue: 25 },
  { day: "S", sales: 65, revenue: 55 },
  { day: "S", sales: 85, revenue: 75 },
]

export function ProfitChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip />
          <Bar dataKey="sales" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20} />
          <Bar dataKey="revenue" fill="#06b6d4" radius={[2, 2, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}