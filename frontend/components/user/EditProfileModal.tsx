'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';

// API Response interfaces
interface CountryResponse {
    error: boolean;
    data: {
        country: string;
        iso2: string;
        iso3: string;
    }[];
}

interface CityResponse {
    error: boolean;
    data: string[];
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<User>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<{ country: string; iso2: string; iso3: string; }[]>([]);
    const [cities, setCities] = useState<{ name: string; }[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [phoneError, setPhoneError] = useState<string>('');

    // Validate phone number
    const validatePhone = (phone: string): boolean => {
        // Allow empty phone number
        if (!phone) return true;

        // Check if phone number contains only digits
        if (!/^\d+$/.test(phone)) {
            setPhoneError('Phone number must contain only digits');
            return false;
        }

        // Check if phone number length is between 10 and 15 digits
        if (phone.length < 10 || phone.length > 15) {
            setPhoneError('Phone number must be between 10 and 15 digits');
            return false;
        }

        setPhoneError('');
        return true;
    };

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries');
                const data: CountryResponse = await response.json();
                if (data.error === false) {
                    // Sort countries by name
                    const sortedCountries = data.data.sort((a, b) =>
                        a.country.localeCompare(b.country)
                    );
                    setCountries(sortedCountries);
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }
        };

        if (isOpen) {
            fetchCountries();
        }
    }, [isOpen]);

    const fetchCities = async (country: string) => {
        setIsLoadingCities(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ country }),
            });
            const data: CityResponse = await response.json();
            if (data.error === false) {
                // Sort cities by name
                const sortedCities = data.data.sort((a, b) =>
                    a.localeCompare(b)
                );
                setCities(sortedCities.map(city => ({ name: city })));
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setIsLoadingCities(false);
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = e.target.value;
        setFormData({ ...formData, country: selectedCountry, city: '' });
        if (selectedCountry) {
            fetchCities(selectedCountry);
        } else {
            setCities([]);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const phoneValue = e.target.value;
        validatePhone(phoneValue);
        setFormData({ ...formData, phone: phoneValue ? phoneValue : undefined });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number before submitting
        if (formData.phone && !validatePhone(formData.phone)) {
            return;
        }

        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={handlePhoneChange}
                            className={`w-full px-4 py-2.5 bg-gray-50 border ${phoneError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            placeholder="Enter your phone number"
                        />
                        {phoneError && (
                            <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <div className="relative">
                                <select
                                    value={formData.country || ''}
                                    onChange={handleCountryChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                    disabled={isLoadingCountries}
                                >
                                    <option value="">Select a country</option>
                                    {countries.map((country) => (
                                        <option key={country.iso2} value={country.country}>
                                            {country.country}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {isLoadingCountries && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <div className="relative">
                                <select
                                    value={formData.city || ''}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                    disabled={isLoadingCities || !formData.country}
                                >
                                    <option value="">Select a city</option>
                                    {cities.map((city) => (
                                        <option key={city.name} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {isLoadingCities && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="relative px-6 py-2.5 overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white transition-all ease-out duration-300 rounded-lg text-sm font-medium"
                            disabled={isLoading}
                        >
                            <span className="absolute right-0 w-8 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 -skew-x-12 group-hover:-translate-x-36 ease"></span>
                            <span className="relative">
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal; 