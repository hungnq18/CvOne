import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterByDateHrProps {
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
}

const FilterByDateHr: React.FC<FilterByDateHrProps> = ({ startDate, endDate, setStartDate, setEndDate }) => {
    const handleReset = () => {
        setStartDate('');
        setEndDate('');
    };
    return (
        <div className="flex items-center gap-2 w-full relative">
            <label>Từ ngày:</label>
            <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
            />
            <label>Đến ngày:</label>
            <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
            />
            {(startDate || endDate) && (
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-black text-white border-black absolute right-0 top-1/2 -translate-y-1/2"
                >
                    <X className="h-4 w-4" />
                    Xóa bộ lọc
                </Button>
            )}
        </div>
    );
};

export default FilterByDateHr;
