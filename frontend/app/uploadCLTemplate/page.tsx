"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS, API_URL } from '@/api/apiConfig';
import Cookies from 'js-cookie';


function UploadCLTemplateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploadedFile(event.target.files[0]);
        }
    };

    const handleContinue = async () => {
        if (!uploadedFile) {
            toast.error("Please upload your cover letter first.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const token = Cookies.get("token");
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_URL}${API_ENDPOINTS.UPLOAD.UPLOAD_FILE}`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'File upload failed');
            }

            toast.success('File uploaded successfully!');
            console.log('Upload successful:', responseData);

            const params = new URLSearchParams();
            if (templateId) {
                params.append('templateId', templateId);
            }
            if (responseData.filename) {
                params.append('clFilename', responseData.filename);
            }
            router.push(`/uploadJD?${params.toString()}`);

        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error(error.message || 'Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="bg-white flex flex-col items-center justify-center py-12 min-h-screen">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Upload Your Cover Letter
                </h1>
                <p className="text-gray-600 mb-12">
                    Upload your existing cover letter to get started.
                </p>

                <div className="w-full max-w-lg mb-16">
                     <label
                        htmlFor="cover-letter-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                     >
                        {uploadedFile ? (
                         <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileText className="w-10 h-10 mb-3 text-blue-500" />
                                <p className="mb-2 text-sm text-gray-700 font-semibold">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(uploadedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                             <p className="mb-2 text-sm text-gray-500">
                                 <span className="font-semibold">Click to upload</span> or drag and drop
                             </p>
                                <p className="text-xs text-gray-500">DOCX, PDF (MAX. 5MB)</p>
                         </div>
                        )}
                        <input
                            id="cover-letter-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                        />
                     </label>
                     </div>

            <div className="flex w-full justify-between max-w-2xl">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <button
                     onClick={handleContinue}
                    disabled={!uploadedFile || isUploading}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isUploading ? "Uploading..." : "Continue"}
                    <ArrowRight size={20} />
                </button>
            </div>
         </div>
     </div>
 );
}

export default function UploadCLTemplatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UploadCLTemplateContent />
        </Suspense>
    );
}