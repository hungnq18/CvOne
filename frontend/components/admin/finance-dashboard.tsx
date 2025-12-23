"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderHistoryAdmin, type Order } from "@/api/apiOrder";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { ProfitChart } from "@/components/admin/profit-chart";
import { RevenueChart } from "@/components/hr/revenue-chart";
import { useLanguage } from "@/providers/global_provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminFinanceDashboard() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getOrderHistoryAdmin();
        setOrders(res || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status?: Order["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t.admin.finance.status.completed}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200">
            {t.admin.finance.status.cancelled}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
            {t.admin.finance.status.pending}
          </Badge>
        );
    }
  };

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
      };
    }

    const sorted = [...orders].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const completed = orders.filter((o) => o.status === "completed");
    const revenue = completed.reduce(
      (sum, o) =>
        sum +
        (typeof o.totalAmount === "number" ? o.totalAmount : o.price || 0),
      0
    );
    const avg = completed.length ? revenue / completed.length : 0;
    const rate = orders.length ? (completed.length / orders.length) * 100 : 0;

    return {
      totalRevenue: revenue,
      totalOrders: orders.length,
      completedOrders: completed.length,
      averageOrderValue: avg,
      completionRate: rate,
      latestOrders: sorted.slice(0, 5), // Only take top 5
    };
  }, [orders]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-0 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.admin.finance.title}
          </h1>
          <p className="text-muted-foreground">{t.admin.finance.desc}</p>
        </div>
      </div>

      {/* Revenue Report (Cards) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.admin.finance.totalRevenue}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrencyVND(totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>{t.admin.finance.revenueReport}</span>
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
              <p className="text-sm font-medium text-muted-foreground">
                {t.admin.finance.totalTransactions}
              </p>
              <p className="text-2xl font-bold mt-1">{totalOrders}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
                <span>{t.admin.finance.transactionList}</span>
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
              <p className="text-sm font-medium text-muted-foreground">
                {t.admin.finance.avgOrderValue}
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrencyVND(averageOrderValue || 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.admin.finance.completionRate}
              </p>
              <p className="text-2xl font-bold mt-1">
                {completionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {completedOrders} / {totalOrders}{" "}
                {t.admin.finance.ordersCompleted}
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
            <CardTitle>{t.admin.finance.revenueReport}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{t.admin.finance.profitReport}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitChart />
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.admin.finance.latestTransactions}</CardTitle>
          <Link href="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 text-gray-900 border-gray-200"
            >
              {t.common.viewAll}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.finance.table.orderCode}</TableHead>
                  <TableHead>{t.admin.finance.table.user}</TableHead>
                  <TableHead>{t.admin.finance.table.tokens}</TableHead>
                  <TableHead>{t.admin.finance.table.amount}</TableHead>
                  <TableHead>{t.admin.finance.table.paymentMethod}</TableHead>
                  <TableHead>{t.admin.finance.table.status}</TableHead>
                  <TableHead>{t.admin.finance.table.createdAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestOrders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      {t.admin.finance.table.empty}
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
                          `${order.userId.first_name ?? ""} ${
                            order.userId.last_name ?? ""
                          }`.trim() ||
                          order.userId._id}
                    </TableCell>
                    <TableCell>{order.totalToken}</TableCell>
                    <TableCell>
                      {formatCurrencyVND(
                        typeof order.totalAmount === "number"
                          ? order.totalAmount
                          : order.price || 0
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
