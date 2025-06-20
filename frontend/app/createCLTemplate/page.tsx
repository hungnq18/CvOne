"use client";

import React, { useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { templates, TemplateType } from './templates/index';
import { getProvinces, Province, getDistrictsByProvinceCode, District } from "@/api/locationApi";
import { createCL, getCLTemplateById, CLTemplate, CreateCLDto, getCLById, updateCL } from "@/api/clApi";
import Cookies from "js-cookie";

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
    const templateId = searchParams.get('templateId');
    const clId = searchParams.get('clId');
    const initialFirstName = searchParams.get('firstName');
    const initialLastName = searchParams.get('lastName');

    const [selectedTemplateData, setSelectedTemplateData] = useState<CLTemplate | null>(null);
    const [templateName, setTemplateName] = useState<TemplateType>('cascade');
    const TemplateComponent = templates[templateName];

    useEffect(() => {
        const fetchClData = async () => {
            if (clId) {
                try {
                    const clData = await getCLById(clId);
                    if (clData) {
                        setLetterData(clData.data);
                        const template = clData.templateId as CLTemplate;
                        setSelectedTemplateData(template);
                        setTemplateName(template.title.toLowerCase() as TemplateType);
                    }
                } catch (error) {
                    console.error("Failed to fetch CL data:", error);
                }
            }
        };

        const fetchTemplateData = async () => {
            if (templateId) {
                try {
                    const data = await getCLTemplateById(templateId);
                    if (data) {
                        setSelectedTemplateData(data);
                        setTemplateName(data.title.toLowerCase() as TemplateType);
                    }
                } catch (error) {
                    console.error("Failed to fetch CL template:", error);
                }
            }
        };

        if (clId) {
            fetchClData();
        } else {
            fetchTemplateData();
        }
    }, [clId, templateId]);

    const getInitialData = () => {
        if (!selectedTemplateData || !selectedTemplateData.data) {
            const firstName = initialFirstName || '';
            const lastName = initialLastName || '';
            return { firstName, lastName, profession: '', city: '', state: '', phone: '', email: '', date: '', recipientFirstName: '', recipientLastName: '', companyName: '', recipientCity: '', recipientState: '', recipientPhone: '', recipientEmail: '', subject: '', greeting: '', opening: '', body: '', callToAction: '', closing: '', signature: `${firstName} ${lastName}`.trim() };
        }

        const baseData = selectedTemplateData.data;
        const firstName = initialFirstName || baseData.firstName;
        const lastName = initialLastName || baseData.lastName;

        return {
            ...baseData,
            firstName,
            lastName,
            signature: `${firstName} ${lastName}`,
        };
    };

    const [letterData, setLetterData] = useState<LetterData>(getInitialData());

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

    useEffect(() => {
        if (!clId) {
            setLetterData(getInitialData());
        }
    }, [selectedTemplateData, initialFirstName, initialLastName, clId]);

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempData, setTempData] = useState<Partial<LetterData>>({});
    const [isSaving, setIsSaving] = useState(false);

    const saveCoverLetter = async (clDataToSave: LetterData) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (clId) {
                // Update existing CL
                await updateCL(clId, { data: clDataToSave });
                alert('Cover letter updated successfully!');
                router.push('/myDocuments');
            } else if (templateId) {
                // Create new CL
                const newCL: CreateCLDto = {
                    templateId: templateId,
                    title: "Untitled Cover Letter",
                    data: clDataToSave,
                    isSaved: true,
                };

                await createCL(newCL);
                localStorage.removeItem('pendingCL');
                alert('Cover letter saved successfully!');
                router.push('/myDocuments');
            } else {
                alert("Template not selected!");
            }
        } catch (error) {
            console.error("Failed to save cover letter:", error);
            alert("Failed to save cover letter. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinishLetter = () => {
        const token = Cookies.get('token');
        if (!token) {
            if (!templateId) {
                alert("Please select a template first.");
                router.push('/clTemplate');
                return;
            }
            const pendingCL = {
                letterData,
                templateId,
            };
            localStorage.setItem('pendingCL', JSON.stringify(pendingCL));
            router.push('/login');
        } else {
            saveCoverLetter(letterData);
        }
    };

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
        <div className="min-h-screen mt-16">
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
                            onClick={handleFinishLetter}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Finish Letter"}
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