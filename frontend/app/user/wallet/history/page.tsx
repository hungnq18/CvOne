'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from 'antd';
import { getOrderHistory, type Order } from "@/api/apiOrder";
import { useLanguage } from "@/providers/global_provider";

const PAGE_SIZE = 10;

const ordersTranslations = {
    en: {
        status: {
            completed: 'Completed',
            pending: 'Pending',
            cancelled: 'Cancelled',
        },
        labels: {
            paymentMethod: 'Payment Method',
            originalPrice: 'Original Price',
            totalPayment: 'Total Payment',
            orderDate: 'Order Date',
            saved: 'Saved',
            noOrders: 'You have no orders yet',
            savings: 'Saved',
        },
    },
    vi: {
        status: {
            completed: 'Hoàn thành',
            pending: 'Chờ xử lý',
            cancelled: 'Đã hủy',
        },
        labels: {
            paymentMethod: 'Phương thức',
            originalPrice: 'Giá gốc',
            totalPayment: 'Thanh toán',
            orderDate: 'Ngày đặt',
            saved: 'Tiết kiệm',
            noOrders: 'Bạn chưa có đơn hàng nào',
            savings: 'Tiết kiệm', // ✅ add this key
        },
    },
};

export default function OrdersPage() {
    const { language } = useLanguage();
    const t = ordersTranslations[language];

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function load() {
            try {
                const res = await getOrderHistory();
                const data = res?.data?.data || res?.data || res || [];
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    const getStatusLabel = (status: Order["status"]) => t.status?.[status as keyof typeof t.status] ?? status ?? '';

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return "0₫";
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const OrderCard = ({ order }: { order: Order }) => {
        const discount = (order.price ?? 0) - (order.totalAmount ?? order.price);
        return (
            <Card className="overflow-hidden border border-slate-200 hover:shadow-lg transition-all">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
                        <h3 className="text-lg font-bold">#{order.orderCode}</h3>
                        <Badge className={getStatusColor(order.status!)}>{getStatusLabel(order.status!)}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <p className="text-xs text-slate-500">{t.labels.paymentMethod}</p>
                            <p className="font-medium">{order.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{t.labels.originalPrice}</p>
                            <p className="font-medium">{formatCurrency(order.price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{t.labels.totalPayment}</p>
                            <p className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalAmount ?? order.price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{t.labels.orderDate}</p>
                            <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {discount > 0 && (
                        <div className="pt-4">
                            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg inline-block">
                                <span className="text-sm text-green-700">{t.labels.savings ?? 'Saved'} {formatCurrency(discount)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const OrdersList = ({ orders }: { orders: Order[] }) => {
        if (!orders.length) {
            return (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-slate-600 mb-6 text-lg">{t.labels.noOrders}</p>
                </div>
            );
        }
        return <div className="space-y-4">{orders.map(order => <OrderCard key={order._id} order={order} />)}</div>;
    };

    const paginatedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                            onChange={page => setCurrentPage(page)}
                            showSizeChanger={false}
                            showLessItems
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
