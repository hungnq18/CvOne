import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface FilterByDateHrProps {
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
}

const FilterByDateHr: React.FC<FilterByDateHrProps> = ({ startDate, endDate, setStartDate, setEndDate }) => {
    // Trạng thái cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Hàm mở modal với thông báo lỗi
    const showErrorModal = (message: string) => {
        setErrorMessage(message);
        setIsModalOpen(true);
    };

    // Hàm xử lý khi thay đổi startDate
    const handleStartDateChange = (date: string) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 để so sánh ngày

        // Kiểm tra ngày trong tương lai
        if (selectedDate > today) {
            showErrorModal('Start date cannot be in the future!');
            return;
        }

        // Kiểm tra nếu endDate đã được chọn và nhỏ hơn startDate
        if (endDate && new Date(endDate) < selectedDate) {
            showErrorModal('Start date cannot be after end date!');
            return;
        }

        setStartDate(date);
    };

    // Hàm xử lý khi thay đổi endDate
    const handleEndDateChange = (date: string) => {
        const selectedDate = new Date(date);

        // Kiểm tra nếu endDate nhỏ hơn startDate
        if (startDate && selectedDate < new Date(startDate)) {
            showErrorModal('End date cannot be before start date!');
            return;
        }

        setEndDate(date);
    };

    // Hàm reset bộ lọc
    const handleReset = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="flex items-center gap-2 w-full relative">
            <label>From:</label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="border rounded px-2 py-1"
            />
            <label>To:</label>
            <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="border rounded px-2 py-1"
            />
            {(startDate || endDate) && (
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-black text-white border-black absolute right-0 top-1/2 -translate-y-1/2"
                >
                    <X className="h-4 w-4" />
                    Clear Filter
                </Button>
            )}

            {/* Modal thông báo lỗi */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>{errorMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FilterByDateHr;