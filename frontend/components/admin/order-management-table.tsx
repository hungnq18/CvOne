"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function OrderManagementTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getOrderHistoryAdmin()
      setOrders(res || [])
      setCurrentPage(1)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const renderStatus = (status?: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize)

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            View all token purchase orders created in the system.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No orders found.
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
                  <TableCell>${order.price.toFixed(2)}</TableCell>
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
              Showing{" "}
              {orders.length === 0
                ? 0
                : `${startIndex + 1}–${Math.min(
                    startIndex + pageSize,
                    orders.length
                  )}`}{" "}
              of {orders.length} orders
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
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === totalPages || loading || orders.length === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


