"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrderHistoryAdmin, type Order } from "@/api/apiOrder"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, Receipt } from "lucide-react"
import { ProfitChart } from "@/components/admin/profit-chart"
import { RevenueChart } from "@/components/hr/revenue-chart"

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStatusBadge(status?: Order["status"]) {
  switch (status) {
    case "completed":
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</Badge>
    case "cancelled":
      return <Badge className="bg-red-50 text-red-700 border border-red-200">Cancelled</Badge>
    default:
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Pending</Badge>
  }
}

export function AdminFinanceDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await getOrderHistoryAdmin()
        setOrders(res || [])
      } catch (error) {
        console.error("Failed to fetch finance orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const {
    totalRevenue,
    totalOrders,
    completedOrders,
    averageOrderValue,
    completionRate,
    latestOrders,
  } = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        completionRate: 0,
        latestOrders: [] as Order[],
      }
    }

    const sorted = [...orders].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })

    const completed = orders.filter((o) => o.status === "completed")
    const revenue = completed.reduce(
      (sum, o) => sum + (typeof o.totalAmount === "number" ? o.totalAmount : o.price || 0),
      0,
    )
    const avg = completed.length ? revenue / completed.length : 0
    const rate = orders.length ? (completed.length / orders.length) * 100 : 0

    return {
      totalRevenue: revenue,
      totalOrders: orders.length,
      completedOrders: completed.length,
      averageOrderValue: avg,
      completionRate: rate,
      latestOrders: sorted.slice(0, 8),
    }
  }, [orders])

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
          <p className="text-muted-foreground">
            Tổng quan doanh thu, giao dịch và lợi nhuận của hệ thống.
          </p>
        </div>
      </div>

      {/* Revenue Report (Cards) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrencyVND(totalRevenue)}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>Revenue Report</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold mt-1">{totalOrders}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
                <span>Transaction List</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold mt-1">{formatCurrencyVND(averageOrderValue || 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold mt-1">{completionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {completedOrders} / {totalOrders} orders completed
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
              {completionRate >= 50 ? (
                <ArrowUpRight className="h-6 w-6 text-amber-600" />
              ) : (
                <ArrowDownRight className="h-6 w-6 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts: Revenue Report & Profit Report */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Profit Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitChart />
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Transaction List (Latest)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Code</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestOrders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Chưa có giao dịch nào.
                    </TableCell>
                  </TableRow>
                )}
                {latestOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>#{order.orderCode}</TableCell>
                    <TableCell>
                      {typeof order.userId === "string"
                        ? order.userId
                        : order.userId.account_id?.email ||
                          `${order.userId.first_name ?? ""} ${order.userId.last_name ?? ""}`.trim() ||
                          order.userId._id}
                    </TableCell>
                    <TableCell>{order.totalToken}</TableCell>
                    <TableCell>
                      {formatCurrencyVND(
                        typeof order.totalAmount === "number" ? order.totalAmount : order.price || 0,
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


