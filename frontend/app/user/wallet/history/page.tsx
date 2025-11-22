'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrderHistory } from "@/api/apiOrder";
import type { Order } from "@/api/apiOrder";
import { Pagination } from 'antd';

const PAGE_SIZE = 10;

function getStatusColor(status: Order["status"]) {
    switch (status) {
        case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
        default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
}

function getStatusLabel(status: Order["status"]) {
    switch (status) {
        case 'completed': return 'Hoàn thành';
        case 'pending': return 'Chờ xử lý';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
}

function formatDate(dateString?: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount?: number) {
    if (!amount) return "0₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function OrderCard({ order }: { order: Order }) {
    const discount = (order.price ?? 0) - (order.totalAmount ?? order.price);

    return (
        <Card className="overflow-hidden border border-slate-200 hover:shadow-lg transition-all">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
                    <h3 className="text-lg font-bold">Đơn #{order.orderCode}</h3>
                    <Badge className={getStatusColor(order.status!)}>{getStatusLabel(order.status!)}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b pb-4">
                    <div>
                        <p className="text-xs text-slate-500">Phương thức</p>
                        <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Giá gốc</p>
                        <p className="font-medium">{formatCurrency(order.price)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Thanh toán</p>
                        <p className="font-bold text-blue-600 text-lg">
                            {formatCurrency(order.totalAmount ?? order.price)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Ngày đặt</p>
                        <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                </div>

                <div className="pt-4">
                    {discount > 0 && (
                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg inline-block">
                            <span className="text-sm text-green-700">
                                Tiết kiệm {formatCurrency(discount)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

function OrdersList({ orders }: { orders: Order[] }) {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-slate-600 mb-6 text-lg">Bạn chưa có đơn hàng nào</p>

            </div>
        );
    }

    return <div className="space-y-4">{orders.map(order => <OrderCard key={order._id} order={order} />)}</div>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function load() {
            try {
                const res = await getOrderHistory();
                const data = res?.data?.data || res?.data || res || [];
                if (Array.isArray(data)) setOrders(data);
                else setOrders([]);
            } catch (err) {
                console.error(err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // Tính toán orders hiển thị trên trang hiện tại
    const paginatedOrders = orders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    return (
        <main className="flex-1 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-10 mt-16 pb-20">

                {!loading && <OrdersList orders={paginatedOrders} />}


                {orders.length > PAGE_SIZE && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            current={currentPage}
                            pageSize={PAGE_SIZE}
                            total={orders.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showLessItems={true}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
