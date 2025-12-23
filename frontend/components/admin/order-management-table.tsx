"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrderHistoryAdmin, Order } from "@/api/apiOrder"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/providers/global_provider"

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function OrderManagementTable() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | NonNullable<Order["status"]>>("all")
  const pageSize = 10

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getOrderHistoryAdmin()
      setOrders(res || [])
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error(t.admin.orders.messages.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getNormalizedStatus = (status?: Order["status"]): NonNullable<Order["status"]> =>
    (status ?? "pending") as NonNullable<Order["status"]>

  const renderStatus = (status?: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">{t.admin.orders.status.completed}</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">{t.admin.orders.status.cancelled}</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">{t.admin.orders.status.pending}</Badge>
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return getNormalizedStatus(order.status) === statusFilter
  })

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize)

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.admin.orders.title}</h1>
          <p className="text-muted-foreground">
            {t.admin.orders.desc}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          {t.admin.orders.refresh}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t.admin.orders.orders} ({filteredOrders.length})</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.admin.orders.filter.label}</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as typeof statusFilter)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.admin.orders.filter.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.admin.orders.filter.all}</SelectItem>
                <SelectItem value="pending">{t.admin.orders.status.pending}</SelectItem>
                <SelectItem value="completed">{t.admin.orders.status.completed}</SelectItem>
                <SelectItem value="cancelled">{t.admin.orders.status.cancelled}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.orders.table.orderCode}</TableHead>
                <TableHead>{t.admin.orders.table.user}</TableHead>
                <TableHead>{t.admin.orders.table.tokens}</TableHead>
                <TableHead>{t.admin.orders.table.price}</TableHead>
                <TableHead>{t.admin.orders.table.paymentMethod}</TableHead>
                <TableHead>{t.admin.orders.table.status}</TableHead>
                <TableHead>{t.admin.orders.table.createdAt}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t.admin.orders.table.empty}
                  </TableCell>
                </TableRow>
              )}
              {paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderCode}</TableCell>
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
                      typeof order.totalAmount === "number"
                        ? order.totalAmount
                        : order.price || 0,
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                  <TableCell>{renderStatus(order.status)}</TableCell>
                  <TableCell>
                    {order.createdAt
                      ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t.admin.manageUser.table.showing}{" "}
              {filteredOrders.length === 0
                ? 0
                : `${startIndex + 1}–${Math.min(
                    startIndex + pageSize,
                    filteredOrders.length
                  )}`}{" "}
              {t.admin.manageUser.table.of} {filteredOrders.length} {t.admin.orders.orders.toLowerCase()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === 1 || loading}
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
              >
                {t.common.previous}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t.common.page} {safePage} {t.admin.manageUser.table.of} {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === totalPages || loading || filteredOrders.length === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                {t.common.next}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
