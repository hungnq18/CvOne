"use client";

import { getCountApplyJobByStatus, getCountApplyJobByStatusWeek } from "@/api/apiApplyJob";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type FilterType = 'day' | 'week' | 'month';

function getWeekDays(year: number, month: number, day?: number): Date[] {
    const date = day ? new Date(year, month - 1, day) : new Date(year, month - 1, new Date().getDate());
    const weekDay = date.getDay();
    const diff = date.getDate() - weekDay + (weekDay === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function getMonthDays(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

export function ApplyJobOverviewChart() {
    const [filterType, setFilterType] = useState<FilterType>('week');
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState<{ label: string, approved: number, rejected: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            try {
                let chartData = [];
                if (filterType === 'day') {
                    const days = getWeekDays(year, month, day); 
                    const promises = days.map(async d => {
                        const approvedRes = await getCountApplyJobByStatus("approved", d.getDate(), d.getMonth() + 1, d.getFullYear());
                        const rejectedRes = await getCountApplyJobByStatus("rejected", d.getDate(), d.getMonth() + 1, d.getFullYear());
                        return {
                            label: `${d.getDate()}/${d.getMonth() + 1}`,
                            approved: approvedRes.count || 0,
                            rejected: rejectedRes.count || 0,
                        };
                    });
                    chartData = await Promise.all(promises);
                } else if (filterType === 'week') {
                    const approvedRes = await getCountApplyJobByStatusWeek("approved", Math.ceil(day / 7), month, year);
                    const rejectedRes = await getCountApplyJobByStatusWeek("rejected", Math.ceil(day / 7), month, year);
                    chartData = approvedRes.days.map((d: string, idx: number) => ({
                        label: new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'numeric' }),
                        approved: approvedRes.counts[idx] || 0,
                        rejected: rejectedRes.counts[idx] || 0,
                    }));
                } else { // month
                    const daysInMonth = getMonthDays(year, date.getMonth());
                     const promises = daysInMonth.map(async d => {
                        const approvedRes = await getCountApplyJobByStatus("approved", d.getDate(), d.getMonth() + 1, d.getFullYear());
                        const rejectedRes = await getCountApplyJobByStatus("rejected", d.getDate(), d.getMonth() + 1, d.getFullYear());
                        return {
                            label: `${d.getDate()}/${d.getMonth() + 1}`,
                            approved: approvedRes.count || 0,
                            rejected: rejectedRes.count || 0,
                        };
                    });
                    chartData = await Promise.all(promises);
                }
                setData(chartData);
            } catch (e) {
                setData([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [filterType, date]);

    const handleFilterChange = (value: FilterType) => {
        setFilterType(value);
    };

    const handleDateChange = (days: number) => {
        setDate(prev => {
            const newDate = new Date(prev);
            if (filterType === 'day') newDate.setDate(prev.getDate() + days);
            else if (filterType === 'week') newDate.setDate(prev.getDate() + days * 7);
            else newDate.setMonth(prev.getMonth() + days);
            return newDate;
        });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    Apply Job Overview - {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </h3>
                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={(v: FilterType) => handleFilterChange(v)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => handleDateChange(-1)}>{"<"}</Button>
                    <span className="p-1 border rounded w-auto text-center">
                        {date.toLocaleDateString('en-GB', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                    </span>
                    <Button variant="outline" onClick={() => handleDateChange(1)}>{">"}</Button>
                </div>
            </div>
            <div className="h-80 flex items-center justify-center">
                {loading ? (
                    <span className="text-gray-400">Loading...</span>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="30%">
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} interval={0} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="approved" fill="#22c55e" name="Approved" maxBarSize={40} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" maxBarSize={40} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
