"use client";

import React, { useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { templates, TemplateType } from './templates/index';
import { createCL, getCLTemplateById, CLTemplate, CreateCLDto, getCLById, updateCL } from "@/api/clApi";
import Cookies from "js-cookie";
import { useLocations } from "@/hooks/useLocations";

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

    const [letterData, setLetterData] = useState<LetterData>({
        firstName: '',
        lastName: '',
        profession: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        date: '',
        recipientFirstName: '',
        recipientLastName: '',
        companyName: '',
        recipientCity: '',
        recipientState: '',
        recipientPhone: '',
        recipientEmail: '',
        subject: '',
        greeting: '',
        opening: '',
        body: '',
        callToAction: '',
        closing: '',
        signature: '',
    });

    const {
        provinces,
        districts,
        recipientDistricts,
        fetchDistrictsForCity,
        fetchDistrictsForRecipientCity
    } = useLocations();

    useEffect(() => {
        const initializeFromLocalStorage = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            // If clId or templateId are in the URL, it's a manual flow. Let other useEffects handle it.
            if (urlParams.has('clId') || urlParams.has('templateId')) {
                return;
            }

            const savedDataString = localStorage.getItem('coverLetterData');
            if (savedDataString) {
                const coverLetterData = JSON.parse(savedDataString);

                // Populate letter data from localStorage for the AI flow
                const mappedData: LetterData = {
                    firstName: coverLetterData.firstName || '',
                    lastName: coverLetterData.lastName || '',
                    profession: coverLetterData.profession || '',
                    city: coverLetterData.city || '',
                    state: coverLetterData.state || '',
                    phone: coverLetterData.phone || '',
                    email: coverLetterData.email || '',
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    recipientFirstName: coverLetterData.recipientFirstName || '',
                    recipientLastName: coverLetterData.recipientLastName || '',
                    companyName: coverLetterData.targetCompany || coverLetterData.companyName || '',
                    recipientCity: coverLetterData.recipientCity || '',
                    recipientState: coverLetterData.recipientState || '',
                    recipientPhone: coverLetterData.recipientPhone || '',
                    recipientEmail: coverLetterData.recipientEmail || '',
                    subject: coverLetterData.targetJobTitle ? `Application for the ${coverLetterData.targetJobTitle} position` : 'Job Application',
                    greeting: `Dear ${coverLetterData.recipientFirstName ? coverLetterData.recipientFirstName + ' ' + coverLetterData.recipientLastName : 'Hiring Manager'},`,
                    opening: '', // AI will populate this
                    body: `Based on the provided job description for the ${coverLetterData.targetJobTitle || 'position'}, my skills in [Skill 1] and [Skill 2], combined with my strengths in ${coverLetterData.strengths?.join(', ')}, make me a strong candidate. My work style is ${coverLetterData.workStyle}.`, // Placeholder for AI
                    callToAction: '', // AI will populate this
                    closing: 'Sincerely,',
                    signature: `${coverLetterData.firstName || ''} ${coverLetterData.lastName || ''}`.trim(),
                };
                setLetterData(mappedData);

                // Pre-load districts for user and recipient city using the hook
                if (mappedData.city) {
                    await fetchDistrictsForCity(mappedData.city);
                }
                if (mappedData.recipientCity) {
                    await fetchDistrictsForRecipientCity(mappedData.recipientCity);
                }

                // Fetch and set the template from localStorage data
                if (coverLetterData.templateId) {
                    try {
                        const data = await getCLTemplateById(coverLetterData.templateId);
                        if (data) {
                            setSelectedTemplateData(data);
                            setTemplateName(data.title.toLowerCase() as TemplateType);
                        }
                    } catch (error) {
                        console.error("Failed to fetch CL template from localStorage data:", error);
                    }
                }

                // Clear the local storage after using the data to prevent re-populating on refresh
                localStorage.removeItem('coverLetterData');
            }
        };

        initializeFromLocalStorage();
    }, []); // This effect now depends on the fetch functions from the hook

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

    const handleCityChange = async (cityValue: string, isRecipient: boolean) => {
        const fieldToUpdate = isRecipient ? 'recipientCity' : 'city';
        const districtFieldToUpdate = isRecipient ? 'recipientState' : 'state';

        handleInputChange(fieldToUpdate, cityValue);
        handleInputChange(districtFieldToUpdate, ''); // Reset district

        if (isRecipient) {
            await fetchDistrictsForRecipientCity(cityValue);
        } else {
            await fetchDistrictsForCity(cityValue);
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

        if (section === 'name' && newTempData.city) {
            await fetchDistrictsForCity(newTempData.city);
        } else if (section === 'recipient' && newTempData.recipientCity) {
            await fetchDistrictsForRecipientCity(newTempData.recipientCity);
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
                    <div className="space-y-6">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={tempData.firstName || ""}
                                    onChange={(e) =>
                                        handleInputChange("firstName", e.target.value)
                                    }
                                    placeholder="e.g. John"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={tempData.lastName || ""}
                                    onChange={(e) =>
                                        handleInputChange("lastName", e.target.value)
                                    }
                                    placeholder="e.g. Smith"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Profession */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                Profession
                            </label>
                            <input
                                type="text"
                                value={tempData.profession || ""}
                                onChange={(e) =>
                                    handleInputChange("profession", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            />
                        </div>

                        {/* City and State */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    City/Province
                                </label>
                                <select
                                    value={tempData.city || ""}
                                    onChange={(e) => handleCityChange(e.target.value, false)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                >
                                    <option value="">Select City/Province</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    District
                                </label>
                                <select
                                    value={tempData.state || ""}
                                    onChange={(e) => handleInputChange("state", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                    disabled={!tempData.city}
                                >
                                    <option value="">Select District</option>
                                    {districts.map(d => (
                                        <option key={d.code} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Phone and Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={tempData.phone || ""}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="e.g. +415-555-5555"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={tempData.email || ""}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="e.g. johnsmith@gmail.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">City/Province</label>
                                <select
                                    value={tempData.recipientCity || ""}
                                    onChange={(e) => handleCityChange(e.target.value, true)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">Select City/Province</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">District</label>
                                <select
                                    value={tempData.recipientState || ""}
                                    onChange={(e) => handleInputChange("recipientState", e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    disabled={!tempData.recipientCity}
                                >
                                    <option value="">Select District</option>
                                    {recipientDistricts.map(d => (
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
                            onClick={() => router.back()}
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
                    <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {sections.find((s) => s.id === activeSection)?.label}
                                </h2>
                                {activeSection === "name" && (
                                    <p className="text-gray-600">
                                        Enter your contact information
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mb-8">{renderModalContent()}</div>
                        <div className="flex justify-between">
                            <button
                                onClick={closeModal}
                                className="px-8 py-3 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveChanges}
                                className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
                            >
                                Save
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