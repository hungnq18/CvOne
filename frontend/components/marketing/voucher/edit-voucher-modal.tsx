"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateVoucher, Voucher } from "@/api/voucherApi"
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper to format date for input type="date"
const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
}

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EditVoucherModal({ voucher, onVoucherUpdated, isOpen, setIsOpen }: { voucher: Voucher | null, onVoucherUpdated: () => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
    const [formData, setFormData] = useState<Partial<Voucher>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Helper tính số ngày giữa startDate và endDate (tính cả ngày bắt đầu)
    const calculateDurationDays = (start?: string, end?: string): number | undefined => {
        if (!start || !end) return undefined;
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return undefined;
        const diffMs = endDate.getTime() - startDate.getTime();
        if (diffMs < 0) return undefined;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    };

    useEffect(() => {
        if (voucher) {
            setFormData({
                ...voucher,
                startDate: formatDateForInput(voucher.startDate),
                endDate: formatDateForInput(voucher.endDate),
                durationDays: voucher.durationDays ?? calculateDurationDays(voucher.startDate, voucher.endDate),
            });
        }
    }, [voucher]);

    if (!voucher) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

     const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePreSubmit = () => {
        const errors: string[] = [];
        if (!formData.name?.trim()) errors.push("Tên voucher");
        if (!formData.description?.trim()) errors.push("Mô tả");
        if (!formData.startDate) errors.push("Ngày bắt đầu");
        if (!formData.endDate) errors.push("Ngày kết thúc");
        if ((formData.discountValue || 0) <= 0) errors.push("Giá trị giảm giá phải lớn hơn 0");
        if ((formData.usageLimit || 0) <= 0) errors.push("Giới hạn sử dụng phải lớn hơn 0");

        if (errors.length > 0) {
            showErrorToast("Validation Error", `Vui lòng kiểm tra lại: ${errors.join(", ")}`);
            return;
        }

        setIsConfirmOpen(true);
    };

    const confirmSubmit = async () => {
        setIsLoading(true);
        try {
            const durationDays =
                formData.durationDays ??
                calculateDurationDays(formData.startDate, formData.endDate);

            const submissionData = {
                ...formData,
                // Gửi giống format bên create (ISO 8601 đầy đủ)
                startDate: formData.startDate
                    ? new Date(formData.startDate).toISOString()
                    : undefined,
                endDate: formData.endDate
                    ? new Date(formData.endDate).toISOString()
                    : undefined,
                durationDays,
            };
            await updateVoucher(voucher._id, submissionData);
            showSuccessToast("Success", `Voucher "${formData.name}" updated successfully.`);
            onVoucherUpdated();
            setIsOpen(false);
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Failed to update voucher:", error);
            showErrorToast(
                "Error",
                error.message || "Failed to update voucher. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Voucher</DialogTitle>
                        <DialogDescription>
                            Update the details for this voucher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)} disabled>
                                <SelectTrigger className="bg-muted">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct">Direct (Use immediately)</SelectItem>
                                    <SelectItem value="saveable">Saveable (Save to wallet)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Voucher Name" />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <Input id="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Voucher Description" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">Discount <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2">
                                <Input id="discountValue" type="number" value={formData.discountValue || 0} onChange={handleInputChange} className="flex-1" />
                                <Select value={formData.discountType} onValueChange={(value) => handleSelectChange('discountType', value)}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percent">%</SelectItem>
                                        <SelectItem value="amount">$</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxDiscountValue">Max Discount</Label>
                            <Input id="maxDiscountValue" type="number" value={formData.maxDiscountValue || 0} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minOrderValue">Min Order</Label>
                            <Input id="minOrderValue" type="number" value={formData.minOrderValue || 0} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">Usage Limit <span className="text-red-500">*</span></Label>
                                    <Input id="usageLimit" type="number" value={formData.usageLimit || 0} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="perUserLimit">User Limit</Label>
                                    <Input id="perUserLimit" type="number" value={formData.perUserLimit || 0} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input id="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                            <Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handlePreSubmit}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Update Voucher</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update this voucher?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
