"use client";
import React from 'react';

interface FilterPanelProps {
    selectedCategories: string[];
    selectedLocations: string[];
    updateCategories: (categories: string[]) => void;
    updateLocations: (locations: string[]) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    selectedCategories,
    selectedLocations,
    updateCategories,
    updateLocations,
}) => {
    const categories = ['Kỹ thuật', 'Marketing', 'Bán hàng', 'Thiết kế'];
    const locations = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote'];

    const handleCategoryChange = (category: string) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];
        updateCategories(updatedCategories);
    };

    const handleLocationChange = (location: string) => {
        const updatedLocations = selectedLocations.includes(location)
            ? selectedLocations.filter((l) => l !== location)
            : [...selectedLocations, location];
        updateLocations(updatedLocations);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Bộ lọc</h3>
            <div className="mb-4">
                <h4 className="font-semibold">Danh mục</h4>
                {categories.map((category) => (
                    <label key={category} className="block">
                        <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="mr-2"
                        />
                        {category}
                    </label>
                ))}
            </div>
            <div>
                <h4 className="font-semibold">Địa điểm</h4>
                {locations.map((location) => (
                    <label key={location} className="block">
                        <input
                            type="checkbox"
                            checked={selectedLocations.includes(location)}
                            onChange={() => handleLocationChange(location)}
                            className="mr-2"
                        />
                        {location}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;