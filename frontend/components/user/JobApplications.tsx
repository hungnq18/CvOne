import React from 'react';

const JobApplications: React.FC = () => {
    return (
        <div className="card bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
            <div className="card-body">
                <h6 className="text-lg font-semibold mb-4 text-gray-900">Job Applications</h6>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Senior Frontend Developer</h3>
                                <p className="text-gray-700">Tech Company Inc.</p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Applied on: March 15, 2024
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Full Stack Developer</h3>
                                <p className="text-gray-700">Digital Solutions Ltd.</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Interview</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Applied on: March 10, 2024
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">React Developer</h3>
                                <p className="text-gray-700">Web Innovations</p>
                            </div>
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Rejected</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Applied on: March 5, 2024
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobApplications; 