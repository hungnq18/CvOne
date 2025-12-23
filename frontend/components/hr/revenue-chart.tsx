"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { getAllRevenues } from "@/api/apiRevenueProfit";
import { useLanguage } from "@/providers/global_provider";
import { format, parseISO, eachMonthOfInterval, subMonths } from "date-fns";

interface ChartData {
  month: string;
  revenue: number;
  count: number;
}

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueChart() {
  const { t } = useLanguage();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get data for last 12 months
        const endDate = new Date();
        const startDate = subMonths(endDate, 11);

        const revenues = await getAllRevenues({
          status: "completed",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        // Generate all months in the range
        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        // Group revenues by month
        const revenueByMonth = revenues.reduce((acc, revenue) => {
          const monthKey = format(parseISO(revenue.revenueDate), "yyyy-MM");
          if (!acc[monthKey]) {
            acc[monthKey] = { total: 0, count: 0 };
          }
          acc[monthKey].total += revenue.amount;
          acc[monthKey].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        // Create chart data with all months
        const chartData = months.map((month) => {
          const monthKey = format(month, "yyyy-MM");
          const monthData = revenueByMonth[monthKey] || { total: 0, count: 0 };

          return {
            month: format(month, "MMM"),
            revenue: monthData.total / 1000000, // Convert to millions for better display
            count: monthData.count,
          };
        });

        setData(chartData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Không thể tải dữ liệu"
        );
        // Set empty data on error
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">
          {t.admin.finance.charts.loadingData}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-2">
        <p className="text-red-500">
          ⚠️ {t.admin.finance.charts.loadErrorTitle}
        </p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">
          {t.admin.finance.charts.loadErrorHint}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">
          {t.admin.finance.charts.noRevenueData}
        </p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "revenue") {
                return [
                  formatCurrencyVND(value * 1000000),
                  t.admin.finance.charts.revenue,
                ];
              }
              return [value, t.admin.finance.charts.transactions];
            }}
            labelFormatter={(label) =>
              `${t.admin.finance.charts.monthPrefix} ${label}`
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
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
  );
}
