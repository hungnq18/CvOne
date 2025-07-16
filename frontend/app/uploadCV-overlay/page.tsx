"use client";

import { uploadAnalyzeAndOverlayPdf } from '@/api/cvapi';
import React, { useState } from 'react';

// Giả sử có hàm phân tích CV trả về mapping (cần import đúng hàm này)
import { uploadAndAnalyzeCV } from '@/api/cvapi';

interface CvOverlayResult {
  originalCvAnalysis: any;
  jobAnalysis: any;
  rewrittenCvHtml: {
    sections: {
      header: {
        name: string;
        title: string;
        contact: {
          email: string;
          phone: string;
          location: string;
        };
      };
      summary: {
        title: string;
        content: string;
      };
      skills: {
        title: string;
        content: string;
      };
      experience: {
        title: string;
        items: Array<{
          title: string;
          company: string;
          period: string;
          description: string;
          achievements: string;
        }>;
      };
      education: {
        title: string;
        items: Array<{
          degree: string;
          major: string;
          institution: string;
          period: string;
        }>;
      };
    };
  };
  suggestions: {
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  mapping: any;
}

export default function UploadCVOverlayPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvOverlayResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Vui lòng chọn file PDF');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Vui lòng chọn file CV');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Vui lòng nhập mô tả công việc');
      return;
    }

    setLoading(true);
    setError(null);

    let mapping = result?.mapping;
    // Nếu chưa có mapping, tự động phân tích CV để lấy mapping
    if (!mapping) {
      try {
        const analyzeRes = await uploadAndAnalyzeCV(file, jobDescription);
        mapping = analyzeRes?.data?.mapping;
        if (!mapping) {
          setError('Không tìm thấy mapping từ AI sau khi phân tích.');
          setLoading(false);
          return;
        }
        // Lưu lại kết quả phân tích để dùng lại nếu cần
        setResult(analyzeRes.data);
      } catch (err: any) {
        setError('Lỗi khi phân tích CV để lấy mapping.');
        setLoading(false);
        return;
      }
    }

    try {
      // Sử dụng API client function
      const blob = await uploadAnalyzeAndOverlayPdf(
        file,
        jobDescription,
        additionalRequirements || undefined,
        mapping // truyền mapping từ AI
      );

      // Tạo download link cho PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-cv-original-layout.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error details:', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload CV và Tối ưu hóa với Layout Gốc
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Tính năng này sẽ:
            </h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Phân tích nội dung CV bằng AI</li>
              <li>Phân tích yêu cầu công việc</li>
              <li>Viết lại nội dung CV tối ưu</li>
              <li>Hiển thị kết quả dưới dạng HTML đẹp mắt</li>
              <li>Cung cấp gợi ý cải thiện từ AI</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CV (PDF) *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả công việc *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Nhập mô tả công việc để AI tối ưu hóa CV..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                required
              />
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yêu cầu bổ sung (tùy chọn)
              </label>
              <textarea
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Nhập các yêu cầu bổ sung nếu có..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || !jobDescription.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Phân tích và viết lại CV'}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kết quả phân tích CV</h2>
              
              {/* Header Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-center mb-2">
                  {result.rewrittenCvHtml.sections.header.name}
                </h3>
                <p className="text-lg text-center text-gray-600 mb-3">
                  {result.rewrittenCvHtml.sections.header.title}
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <span>{result.rewrittenCvHtml.sections.header.contact.email}</span>
                  <span>•</span>
                  <span>{result.rewrittenCvHtml.sections.header.contact.phone}</span>
                  <span>•</span>
                  <span>{result.rewrittenCvHtml.sections.header.contact.location}</span>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">
                  {result.rewrittenCvHtml.sections.summary.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {result.rewrittenCvHtml.sections.summary.content}
                </p>
              </div>

              {/* Skills Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">
                  {result.rewrittenCvHtml.sections.skills.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {Array.isArray(result.rewrittenCvHtml.sections.skills.content)
                    ? result.rewrittenCvHtml.sections.skills.content.map((skill: any, idx: number) => (
                        <span key={idx}>
                          {skill.name}{skill.rating !== undefined ? ` (${skill.rating})` : ''}
                          {idx < result.rewrittenCvHtml.sections.skills.content.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    : result.rewrittenCvHtml.sections.skills.content}
                </p>
              </div>

              {/* Work Experience */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">
                  {result.rewrittenCvHtml.sections.experience.title}
                </h4>
                <div className="space-y-4">
                  {result.rewrittenCvHtml.sections.experience.items.map((job, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-gray-900">{job.title}</h5>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {job.period}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{job.description}</p>
                      {job.achievements && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Key Achievements:
                          </p>
                          <p className="text-gray-700 text-sm">{job.achievements}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">
                  {result.rewrittenCvHtml.sections.education.title}
                </h4>
                <div className="space-y-3">
                  {result.rewrittenCvHtml.sections.education.items.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {edu.degree} in {edu.major}
                          </h5>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {edu.period}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Gợi ý từ AI</h4>
                
                {/* Strengths */}
                <div className="mb-4">
                  <h5 className="font-medium text-green-700 mb-2">Điểm mạnh</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.suggestions.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-700 text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="mb-4">
                  <h5 className="font-medium text-orange-700 mb-2">Cần cải thiện</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.suggestions.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-gray-700 text-sm">{area}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h5 className="font-medium text-blue-700 mb-2">Khuyến nghị</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.suggestions.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-700 text-sm">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Hướng dẫn sử dụng
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">1. Upload CV PDF</h3>
              <p>Chọn file PDF CV của bạn. File phải có text có thể đọc được (không phải hình ảnh scan).</p>
            </div>
            <div>
              <h3 className="font-semibold">2. Nhập mô tả công việc</h3>
              <p>Nhập chi tiết về công việc bạn muốn ứng tuyển để AI tối ưu hóa CV phù hợp.</p>
            </div>
            <div>
              <h3 className="font-semibold">3. Xử lý AI</h3>
              <p>AI sẽ phân tích CV gốc và yêu cầu công việc, sau đó tạo nội dung tối ưu.</p>
            </div>
            <div>
              <h3 className="font-semibold">4. Overlay lên PDF gốc</h3>
              <p>Nội dung tối ưu sẽ được overlay lên vị trí tương ứng trong PDF gốc, giữ nguyên layout.</p>
            </div>
            <div>
              <h3 className="font-semibold">5. Tải xuống kết quả</h3>
              <p>PDF với layout gốc và nội dung tối ưu sẽ được tải xuống tự động.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 