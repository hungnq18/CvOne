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

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        if (endDate && newStartDate > endDate) {
            alert('Ngày bắt đầu không thể sau ngày kết thúc');
            return;
        }
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        if (startDate && newEndDate < startDate) {
            alert('Ngày kết thúc không thể trước ngày bắt đầu');
            return;
        }
        setEndDate(newEndDate);
    };

    return (
        <div className="flex items-center gap-2 w-full relative">
            <label>From:</label>
            <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max={endDate || undefined}
                className="border rounded px-2 py-1"
            />
            <label>To:</label>
            <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || undefined}
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
