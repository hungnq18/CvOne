"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { getProvinces, getDistrictsByProvinceCode, Province, District } from '@/api/locationApi';

const InputField = ({
    label,
    field,
    formData,
    handleInputChange,
    handleProvinceChange,
    errors,
    loading,
    selectedProvinceCode,
    options = [],
    placeholder,
    required = false,
    type = "text",
    isDropdown = false,
}: {
    label: string;
    field: string;
    formData: any;
    handleInputChange: (field: string, value: string) => void;
    handleProvinceChange: (value: string) => void;
    errors: { [key: string]: string };
    loading: boolean;
    selectedProvinceCode: number | null;
    options?: string[];
    placeholder?: string;
    required?: boolean;
    type?: string;
    isDropdown?: boolean;
}) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {isDropdown ? (
                <div className="relative">
                    <select
                        value={formData[field as keyof typeof formData]}
                        onChange={(e) => {
                            if (field === 'city') {
                                handleProvinceChange(e.target.value);
                            } else {
                                handleInputChange(field, e.target.value);
                            }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg bg-white appearance-none pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field] ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={loading || (field === 'state' && !selectedProvinceCode)}
                    >
                        <option value="">{placeholder}</option>
                        {options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
            ) : (
                <input
                    type={type}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field] ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
            )}
            {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
        </div>
    );
};

function PersonalInfoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        profession: '',
        city: '',
        state: '',
        phone: '',
        email: ''
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Load provinces on component mount
    useEffect(() => {
        const loadProvinces = async () => {
            setLoading(true);
            try {
                const provincesData = await getProvinces();
                setProvinces(provincesData);
            } catch (error) {
                console.error('Error loading provinces:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProvinces();
    }, []);

    // Load data from localStorage and initialize the form
    useEffect(() => {
        if (provinces.length > 0) {
            const savedDataString = localStorage.getItem('coverLetterData');
            let coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

            const templateId = searchParams.get('templateId');
            if (templateId) {
                coverLetterData.templateId = templateId;
            }

            setFormData({
                firstName: coverLetterData.firstName || '',
                lastName: coverLetterData.lastName || '',
                profession: coverLetterData.profession || '',
                city: coverLetterData.city || '',
                state: coverLetterData.state || '',
                phone: coverLetterData.phone || '',
                email: coverLetterData.email || ''
            });

            if (coverLetterData.city) {
                const selectedProvince = provinces.find(p => p.name === coverLetterData.city);
                if (selectedProvince) {
                    setSelectedProvinceCode(selectedProvince.code);
                }
            }

            localStorage.setItem('coverLetterData', JSON.stringify(coverLetterData));
        }
    }, [provinces, searchParams]);

    // Load districts when province changes
    useEffect(() => {
        const loadDistricts = async () => {
            if (selectedProvinceCode) {
                try {
                    const districtsData = await getDistrictsByProvinceCode(selectedProvinceCode);
                    setDistricts(districtsData);
                } catch (error) {
                    console.error('Error loading districts:', error);
                }
            } else {
                setDistricts([]);
            }
        };

        loadDistricts();
    }, [selectedProvinceCode]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleProvinceChange = (value: string) => {
        const selectedProvince = provinces.find(p => p.name === value);
        setSelectedProvinceCode(selectedProvince ? selectedProvince.code : null);

        handleInputChange('city', value);
        // Reset state when city changes
        handleInputChange('state', '');
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (!validateForm()) return;

        const savedDataString = localStorage.getItem('coverLetterData');
        const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

        const updatedData = { ...coverLetterData, ...formData };
        localStorage.setItem('coverLetterData', JSON.stringify(updatedData));

        router.push(`/recipent-info`);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
            <div className="w-full max-w-2xl space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        What's the best way for employers to contact you?
                    </h1>
                    <p className="text-gray-600">
                        We suggest including an email and phone number.
                    </p>
                </div>

                {/* Required Field Notice */}
                <div className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> indicates a required field
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="FIRST NAME"
                            field="firstName"
                            placeholder="First Name"
                            required
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                        <InputField
                            label="LAST NAME"
                            field="lastName"
                            placeholder="Last Name"
                            required
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                    </div>

                    {/* Profession */}
                    <InputField
                        label="PROFESSION"
                        field="profession"
                        placeholder="e.g. Graphic Designer"
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleProvinceChange={handleProvinceChange}
                        errors={errors}
                        loading={loading}
                        selectedProvinceCode={selectedProvinceCode}
                    />

                    {/* City and State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="CITY/PROVINCE"
                            field="city"
                            placeholder="Select your city/province"
                            isDropdown
                            options={provinces.map(p => p.name)}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                        <InputField
                            label="DISTRICT"
                            field="state"
                            placeholder="Select your district"
                            isDropdown
                            options={districts.map(d => d.name)}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                    </div>

                    {/* Phone and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="PHONE NUMBER"
                            field="phone"
                            placeholder="e.g. +84123456789"
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                        <InputField
                            label="EMAIL ADDRESS"
                            field="email"
                            placeholder="e.g. john.doe@email.com"
                            type="email"
                            required
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleProvinceChange={handleProvinceChange}
                            errors={errors}
                            loading={loading}
                            selectedProvinceCode={selectedProvinceCode}
                        />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <button
                        onClick={handleContinue}
                        className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                    >
                        Continue
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PersonalInfoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PersonalInfoContent />
        </Suspense>
    );
}