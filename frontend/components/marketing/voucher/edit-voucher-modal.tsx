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
import { useLanguage } from "@/providers/global_provider"

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
    const { t } = useLanguage();

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
        if (!formData.name?.trim()) errors.push(t.voucher.validation.requiredName);
        if (!formData.description?.trim()) errors.push(t.voucher.validation.requiredDesc);
        if (!formData.startDate) errors.push(t.voucher.validation.requiredStartDate);
        if (!formData.endDate) errors.push(t.voucher.validation.requiredEndDate);
        if ((formData.discountValue || 0) <= 0) errors.push(t.voucher.validation.invalidDiscount);
        if (formData.discountType === 'percent' && (formData.discountValue || 0) > 100) errors.push(t.voucher.validation?.discountTooHigh || 'Discount không được quá 100%');
        if ((formData.usageLimit || 0) < 1) errors.push(t.voucher.validation?.invalidLimit);
        if ((formData.maxDiscountValue || 0) < 1) errors.push(t.voucher.validation?.invalidMaxDiscount || 'Max Discount phải lớn hơn 0');
        if ((formData.minOrderValue || 0) < 1) errors.push(t.voucher.validation?.invalidMinOrder || 'Min Order phải lớn hơn 0');
        if ((formData.perUserLimit || 0) < 1) errors.push(t.voucher.validation?.invalidUserLimit || 'User Limit phải lớn hơn 0');
        // Validate ngày bắt đầu và kết thúc
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                errors.push(t.voucher.validation?.invalidDate || 'Ngày kết thúc không được trước ngày bắt đầu');
            }
        }
        if (errors.length > 0) {
            showErrorToast(t.voucher.validation.validationError, `${t.voucher.validation.checkAgain}${errors.join(", ")}`);
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
            showSuccessToast(t.common.success, t.voucher.messages.updateSuccess);
            onVoucherUpdated();
            setIsOpen(false);
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Failed to update voucher:", error);
            showErrorToast(
                t.common.error,
                error.message || t.voucher.messages.updateError
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
                        <DialogTitle>{t.voucher.editTitle}</DialogTitle>
                        <DialogDescription>
                            {t.voucher.editDesc}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="type">{t.voucher.fields.type}</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)} disabled>
                                <SelectTrigger className="bg-muted">
                                    <SelectValue placeholder={t.voucher.fields.selectType} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="direct">{t.voucher.fields.typeDirect}</SelectItem>
                                    <SelectItem value="saveable">{t.voucher.fields.typeSaveable}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">{t.voucher.fields.name} <span className="text-red-500">*</span></Label>
                            <Input id="name" value={formData.name || ''} onChange={handleInputChange} placeholder={t.voucher.fields.name} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">{t.voucher.fields.description} <span className="text-red-500">*</span></Label>
                            <Input id="description" value={formData.description || ''} onChange={handleInputChange} placeholder={t.voucher.fields.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">{t.voucher.fields.discount} <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="maxDiscountValue">{t.voucher.fields.maxDiscount}</Label>
                            <Input id="maxDiscountValue" type="number" value={formData.maxDiscountValue || 0} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minOrderValue">{t.voucher.fields.minOrder}</Label>
                            <Input id="minOrderValue" type="number" value={formData.minOrderValue || 0} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">{t.voucher.fields.usageLimit} <span className="text-red-500">*</span></Label>
                                    <Input id="usageLimit" type="number" value={formData.usageLimit || 0} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="perUserLimit">{t.voucher.fields.userLimit}</Label>
                                    <Input id="perUserLimit" type="number" value={formData.perUserLimit || 0} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">{t.voucher.fields.startDate} <span className="text-red-500">*</span></Label>
                            <Input id="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">{t.voucher.fields.endDate} <span className="text-red-500">*</span></Label>
                            <Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handlePreSubmit}>
                            {t.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.voucher.confirmUpdateTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.voucher.confirmUpdateDesc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit} disabled={isLoading}>
                            {isLoading ? t.common.saving : t.common.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
