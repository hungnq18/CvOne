"use client"

import { getCountApplyJobByStatus } from "@/api/apiApplyJob";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ApplyJobOverviewChart() {
    const [data, setData] = useState([
        { status: "approved", count: 0 },
        { status: "rejected", count: 0 },
    ]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const approveRes = await getCountApplyJobByStatus("approved");
                const rejectRes = await getCountApplyJobByStatus("rejected");
                setData([
                    { status: "approved", count: approveRes.count || 0 },
                    { status: "rejected", count: rejectRes.count || 0 },
                ]);
            } catch (e) {
                setData([
                    { status: "Approve", count: 0 },
                    { status: "Reject", count: 0 },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    return (
        <div className="h-80 flex items-center justify-center">
            {loading ? (
                <span className="text-gray-400">Loading...</span>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap="40%">
                        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "#6b7280" }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "#6b7280" }} />
                        <Tooltip />
                        <Bar dataKey="count" maxBarSize={60} radius={[8, 8, 0, 0]}>
                            {data.map((entry, idx) => (
                                <Cell key={entry.status} fill={entry.status === "Approve" ? "#22c55e" : "#ef4444"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
