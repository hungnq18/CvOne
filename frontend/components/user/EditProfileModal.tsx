'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { useLanguage } from '@/providers/global_provider';

interface UserWithIso2 extends User {
    country_iso2?: string;
}

const EditProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => Promise<void>;
}> = ({ isOpen, onClose, user, onSave }) => {
    const { language } = useLanguage();
    const [formData, setFormData] = useState<UserWithIso2>(user as UserWithIso2);
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<{ iso2: string; name: string }[]>([]);
    const [cities, setCities] = useState<{ name: string }[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>('');

    useEffect(() => {
        if (isOpen) setFormData(user as UserWithIso2);
    }, [isOpen, user]);

    useEffect(() => {
        if (!isOpen) return;
        const loadCountries = async () => {
            setIsLoadingCountries(true);
            try {
                const res = await fetch('/api/countries');
                const data = await res.json();
                setCountries(data);
            } finally {
                setIsLoadingCountries(false);
            }
        };
        loadCountries();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || countries.length === 0) return;

        let iso2ToSet = '';
        if (formData.country_iso2) {
            const found = countries.find(c => c.iso2 === formData.country_iso2);
            if (found) iso2ToSet = formData.country_iso2;
        } else if (formData.country) {
            const found = countries.find(
                c => c.name.toLowerCase() === formData.country?.toLowerCase()
            );
            if (found) {
                iso2ToSet = found.iso2;
                setFormData(prev => ({ ...prev, country_iso2: found.iso2 }));
            }
        }
        if (iso2ToSet && iso2ToSet !== selectedCountryIso2) setSelectedCountryIso2(iso2ToSet);
    }, [isOpen, countries, formData.country, formData.country_iso2, selectedCountryIso2]);

    useEffect(() => {
        if (!selectedCountryIso2) {
            setCities([]);
            return;
        }
        const fetchCities = async () => {
            setIsLoadingCities(true);
            try {
                const res = await fetch(`/api/cities?country=${selectedCountryIso2}`);
                if (res.ok) setCities(await res.json());
                else setCities([]);
            } catch {
                setCities([]);
            } finally {
                setIsLoadingCities(false);
            }
        };
        fetchCities();
    }, [selectedCountryIso2]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const iso2 = e.target.value;
        const countryObj = countries.find(c => c.iso2 === iso2);
        if (countryObj) {
            setSelectedCountryIso2(iso2);
            setFormData({ ...formData, country: countryObj.name, country_iso2: iso2, city: '' });
            setCities([]);
        } else {
            setSelectedCountryIso2('');
            setFormData({ ...formData, country: '', country_iso2: undefined, city: '' });
            setCities([]);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, city: e.target.value });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, phone: e.target.value || undefined });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {language === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'vi' ? 'Tên' : 'First Name'}
                            </label>
                            <input
                                type="text"
                                value={formData.first_name || ''}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'vi' ? 'Họ' : 'Last Name'}
                            </label>
                            <input
                                type="text"
                                value={formData.last_name || ''}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={handlePhoneChange}
                            placeholder="1234567890"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Country & City */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'vi' ? 'Quốc gia' : 'Country'}
                            </label>
                            <select
                                value={selectedCountryIso2}
                                onChange={handleCountryChange}
                                disabled={isLoadingCountries}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                            >
                                <option value="">
                                    {language === 'vi' ? 'Chọn quốc gia' : 'Select a country'}
                                </option>
                                {countries.map(c => (
                                    <option key={c.iso2} value={c.iso2}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {language === 'vi' ? 'Thành phố' : 'City'}
                            </label>
                            <select
                                value={formData.city || ''}
                                onChange={handleCityChange}
                                disabled={!selectedCountryIso2 || isLoadingCities}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition"
                            >
                                <option value="">
                                    {isLoadingCities ? (language === 'vi' ? 'Đang tải...' : 'Loading cities...') : (language === 'vi' ? 'Chọn thành phố' : 'Select a city')}
                                </option>
                                {cities.map(city => (
                                    <option key={city.name} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            {language === 'vi' ? 'Hủy' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {isLoading ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
