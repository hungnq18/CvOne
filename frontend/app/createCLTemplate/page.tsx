"use client";

import React, { useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { templates, TemplateType } from './templates';
import { getProvinces, Province, getDistrictsByProvinceCode, District } from "@/api/locationApi";

interface LetterData {
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    date: string;
    recipientFirstName: string;
    recipientLastName: string;
    companyName: string;
    recipientCity: string;
    recipientState: string;
    recipientPhone: string;
    recipientEmail: string;
    subject: string;
    greeting: string;
    opening: string;
    body: string;
    callToAction: string;
    closing: string;
    signature: string;
}

const CoverLetterBuilderContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTemplate = (searchParams.get('template') || 'cascade') as TemplateType;
    const initialFirstName = searchParams.get('firstName') || "First Name";
    const initialLastName = searchParams.get('lastName') || "Last Name";
    const TemplateComponent = templates[selectedTemplate];
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    useEffect(() => {
        const fetchProvinces = async () => {
            const provinceData = await getProvinces();
            provinceData.sort((a, b) => a.name.localeCompare(b.name));
            setProvinces(provinceData);
        };
        fetchProvinces();
    }, []);

    const [letterData, setLetterData] = useState<LetterData>({
        firstName: initialFirstName,
        lastName: initialLastName,
        profession: "Software Engineer",
        city: "Hanoi",
        state: "HN",
        phone: "+415-555-5555",
        email: "duongduy203.st@gmail.com",
        date: "June 11, 2025",
        recipientFirstName: "Katherine",
        recipientLastName: "Bloomstein",
        companyName: "XYZ Company",
        recipientCity: "Flowerville",
        recipientState: "Ohio",
        recipientPhone: "123-456-7890",
        recipientEmail: "recipient@example.com",
        subject: "RE: [Job Title], [Ref#], [Source]",
        greeting: "Dear [Mr. or Ms. Last Name],",
        opening:
            "I am writing to express my interest in the Software Engineer position at your esteemed company. With a strong background in collaborative problem-solving, critical thinking, and decision-making, I am excited about the opportunity to contribute my practical skills and innovative solutions to your team.",
        body: `Throughout my career as a Software Engineer, I have developed a keen ability to work effectively within teams, leveraging collective expertise to tackle complex technical challenges. My approach is grounded in a realistic understanding of project requirements, allowing me to devise solutions that are not only functional but also aligned with end-user needs.

I pride myself on being a practical thinker, which has enabled me to consistently make informed decisions that drive project success. My experiences have equipped me with the ability to analyze intricate systems and collaborate with peers, leading to the successful implementation of software that meets stringent performance criteria and user expectations.

I am particularly drawn to your organization because of its commitment to innovation and excellence. I am eager to bring my skills in collaboration and critical analysis to your team and contribute to projects that make a meaningful impact.`,
        callToAction:
            "Thank you for considering my application. I look forward to the possibility of discussing how I can support your organization's goals and contribute to exciting new initiatives.",
        closing: "Sincerely,",
        signature: `${initialFirstName} ${initialLastName}`,
    });

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempData, setTempData] = useState<Partial<LetterData>>({});

    const handleCityChange = async (cityValue: string, cityField: keyof LetterData, districtField: keyof LetterData) => {
        setTempData(prev => ({
            ...prev,
            [cityField]: cityValue,
            [districtField]: ''
        }));

        if (cityValue) {
            const selectedProvince = provinces.find(p => p.name === cityValue);
            if (selectedProvince) {
                const districtData = await getDistrictsByProvinceCode(selectedProvince.code);
                setDistricts(districtData);
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    };

    const handleInputChange = (field: keyof LetterData, value: string) => {
        setTempData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const openModal = async (section: string) => {
        setActiveSection(section);
        const newTempData = { ...letterData };
        setTempData(newTempData);
        setIsModalOpen(true);

        let cityToFetch: string | undefined;
        if (section === 'name') {
            cityToFetch = newTempData.city;
        } else if (section === 'recipient') {
            cityToFetch = newTempData.recipientCity;
        }

        if (cityToFetch) {
            const selectedProvince = provinces.find(p => p.name === cityToFetch);
            if (selectedProvince) {
                const districtData = await getDistrictsByProvinceCode(selectedProvince.code);
                setDistricts(districtData);
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveSection(null);
        setTempData({});
    };

    const saveChanges = () => {
        setLetterData((prev) => ({
            ...prev,
            ...tempData,
        }));
        closeModal();
    };

    const sections = [
        { id: "name", label: "Name & Contact", icon: "" },
        { id: "date", label: "Date", icon: "" },
        { id: "recipient", label: "Recipient", icon: "" },
        { id: "subject", label: "Subject", icon: "" },
        { id: "greeting", label: "Greeting", icon: "" },
        { id: "opening", label: "Opening", icon: "" },
        { id: "body", label: "Letter Body", icon: "" },
        { id: "callToAction", label: "Call to Action", icon: "" },
        { id: "closing", label: "Closing", icon: "" },
    ];

    const renderModalContent = () => {
        switch (activeSection) {
            case "name":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={tempData.firstName || ""}
                                    onChange={(e) =>
                                        handleInputChange("firstName", e.target.value)
                                    }
                                    placeholder="e.g. John"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={tempData.lastName || ""}
                                    onChange={(e) =>
                                        handleInputChange("lastName", e.target.value)
                                    }
                                    placeholder="e.g. Smith"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                Profession
                            </label>
                            <input
                                type="text"
                                value={tempData.profession || ""}
                                onChange={(e) =>
                                    handleInputChange("profession", e.target.value)
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                City
                            </label>
                            <select
                                value={tempData.city || ""}
                                onChange={(e) => handleCityChange(e.target.value, "city", "state")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select a City/Province</option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    State/Province
                                </label>
                                <select
                                    value={tempData.state || ""}
                                    onChange={(e) => handleInputChange("state", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    disabled={!tempData.city}
                                >
                                    <option value="">Select a District</option>
                                    {districts.map(d => (
                                        <option key={d.code} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={tempData.phone || ""}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="e.g. +415-555-5555"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={tempData.email || ""}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                );
            case "date":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Date
                        </label>
                        <input
                            type="text"
                            value={tempData.date || ""}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "recipient":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">First Name</label>
                                <input type="text" value={tempData.recipientFirstName || ""} onChange={(e) => handleInputChange("recipientFirstName", e.target.value)} placeholder="e.g. John" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">Last Name</label>
                                <input type="text" value={tempData.recipientLastName || ""} onChange={(e) => handleInputChange("recipientLastName", e.target.value)} placeholder="e.g. Smith" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">Company Name</label>
                            <input type="text" value={tempData.companyName || ""} onChange={(e) => handleInputChange("companyName", e.target.value)} placeholder="e.g. ACME Technologies" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">City</label>
                            <select
                                value={tempData.recipientCity || ""}
                                onChange={(e) => handleCityChange(e.target.value, "recipientCity", "recipientState")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select a City/Province</option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">State/Province</label>
                                <select
                                    value={tempData.recipientState || ""}
                                    onChange={(e) => handleInputChange("recipientState", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    disabled={!tempData.recipientCity}
                                >
                                    <option value="">Select a District</option>
                                    {districts.map(d => (
                                        <option key={d.code} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">Phone Number</label>
                                <input type="text" value={tempData.recipientPhone || ""} onChange={(e) => handleInputChange("recipientPhone", e.target.value)} placeholder="e.g. +415-555-5555" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">Email</label>
                                <input type="email" value={tempData.recipientEmail || ""} onChange={(e) => handleInputChange("recipientEmail", e.target.value)} placeholder="e.g. johnsmith@gmail.com" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>
                );
            case "subject":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Subject Line
                        </label>
                        <input
                            type="text"
                            value={tempData.subject || ""}
                            onChange={(e) => handleInputChange("subject", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "greeting":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Greeting
                        </label>
                        <input
                            type="text"
                            value={tempData.greeting || ""}
                            onChange={(e) => handleInputChange("greeting", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "opening":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Opening Paragraph
                        </label>
                        <textarea
                            value={tempData.opening || ""}
                            onChange={(e) => handleInputChange("opening", e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "body":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Letter Body
                        </label>
                        <textarea
                            value={tempData.body || ""}
                            onChange={(e) => handleInputChange("body", e.target.value)}
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "callToAction":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                            Call to Action
                        </label>
                        <textarea
                            value={tempData.callToAction || ""}
                            onChange={(e) => handleInputChange("callToAction", e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                );
            case "closing":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                Closing
                            </label>
                            <input
                                type="text"
                                value={tempData.closing || ""}
                                onChange={(e) => handleInputChange("closing", e.target.value)}
                                placeholder="e.g. Sincerely,"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                Signature
                            </label>
                            <input
                                type="text"
                                value={tempData.signature || ""}
                                onChange={(e) =>
                                    handleInputChange("signature", e.target.value)
                                }
                                placeholder="e.g. Duong Viet Duy"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                );
            default:
                return <div>Select a section to edit</div>;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen mt-16">
            <div className="max-w-7xl mx-auto flex">
                {/* Left Sidebar */}
                <div className="w-80 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            Letter sections
                        </h3>
                        <div className="space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => openModal(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === section.id
                                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{section.icon}</span>
                                        <span className="font-medium">{section.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content (Letter Preview) */}
                <div className="flex-1 py-8 px-4">
                    <div className="max-w-2xl mx-auto bg-white shadow-lg">
                        {TemplateComponent && <TemplateComponent letterData={letterData} onSectionClick={openModal} />}
                    </div>
                </div>

                {/* Right Actions Panel */}
                <div className="w-64 bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            onClick={() => router.push("/clTemplate")}
                        >
                            Go Back
                        </button>
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            onClick={() => router.push("/dashboard")}
                        >
                            Finish Letter
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Edit {sections.find((s) => s.id === activeSection)?.label}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-6">{renderModalContent()}</div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveChanges}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CoverLetterBuilder = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CoverLetterBuilderContent />
        </Suspense>
    );
};

export default CoverLetterBuilder;
