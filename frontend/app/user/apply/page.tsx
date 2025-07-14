"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCVs, CV } from '@/api/cvapi';

export default function ApplyWithExistingCVPage() {
    const [cvList, setCvList] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCVs() {
            setLoading(true);
            try {
                const res = await getAllCVs();
                // Nếu API trả về { data: [...] }
                const cvs = Array.isArray(res) ? res : res.data || [];
                setCvList(cvs);
            } catch (err) {
                setCvList([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCVs();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">Select a CV to Apply</h1>
            {loading ? (
                <div className="text-gray-500">Loading CVs...</div>
            ) : cvList.length === 0 ? (
                <div className="text-gray-500">You have no CVs. <Link href="/createCV" className="text-blue-600 underline">Create one now</Link>.</div>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    {cvList.map(cv => (
                        <div key={cv._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 shadow-sm">
                            <div>
                                <div className="font-semibold text-blue-800">{cv.title || 'Untitled CV'}</div>
                                <div className="text-xs text-gray-500">Last updated: {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : '-'}</div>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/myDocuments" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">View Detail</Link>
                                <Link href={`/createCV-AI?cvId=${cv._id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Edit with AI</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
