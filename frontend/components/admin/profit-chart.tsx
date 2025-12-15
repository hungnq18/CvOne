"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getAllProfits } from "@/api/apiRevenueProfit"
import { useLanguage } from "@/providers/global_provider"
import { format, eachMonthOfInterval, subMonths } from "date-fns"

interface ChartData {
  month: string;
  profit: number;
  revenue: number;
  costs: number;
}

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ProfitChart() {
  const { t } = useLanguage()
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all profits data
        const profits = await getAllProfits()

        // Get last 12 months
        const endDate = new Date()
        const startDate = subMonths(endDate, 11)
        const months = eachMonthOfInterval({ start: startDate, end: endDate })

        // Group profits by month
        const profitByMonth = profits.reduce((acc, profit) => {
          // Use period from profit data (format: YYYY-MM)
          const monthKey = profit.period
          if (!acc[monthKey]) {
            acc[monthKey] = {
              totalRevenue: 0,
              totalCosts: 0,
              totalProfit: 0,
              count: 0,
            }
          }
          acc[monthKey].totalRevenue += profit.totalRevenue
          acc[monthKey].totalCosts += profit.totalCosts
          acc[monthKey].totalProfit += profit.profit
          acc[monthKey].count += 1
          return acc
        }, {} as Record<string, { totalRevenue: number; totalCosts: number; totalProfit: number; count: number }>)

        // Create chart data with all months
        const chartData = months.map((month) => {
          const monthKey = format(month, "yyyy-MM")
          const monthData = profitByMonth[monthKey] || {
            totalRevenue: 0,
            totalCosts: 0,
            totalProfit: 0,
            count: 0
          }

          return {
            month: format(month, "MMM"),
            profit: monthData.totalProfit / 1000000, // Convert to millions
            revenue: monthData.totalRevenue / 1000000, // Convert to millions
            costs: monthData.totalCosts / 1000000, // Convert to millions
          }
        })

        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch profit data:", error)
        setError(error instanceof Error ? error.message : "Không thể tải dữ liệu")
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfitData()
  }, [])

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">{t.admin.finance.charts.loadingData}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-2">
        <p className="text-red-500">⚠️ {t.admin.finance.charts.loadErrorTitle}</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">{t.admin.finance.charts.loadErrorHint}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">{t.admin.finance.charts.noProfitData}</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                profit: t.admin.finance.charts.profit,
                revenue: t.admin.finance.charts.revenue,
                costs: t.admin.finance.charts.costs,
              }
              return [formatCurrencyVND(value * 1000000), labels[name] || name]
            }}
            labelFormatter={(label) => `${t.admin.finance.charts.monthPrefix} ${label}`}
          />
          <Bar dataKey="costs" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={20} />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20} />
          <Bar dataKey="profit" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
