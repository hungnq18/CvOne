"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createVoucher } from "@/api/voucherApi"
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils"
import { PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
import { useLanguage } from "@/providers/global_provider"

export function AddVoucherModal({ onVoucherAdded }: { onVoucherAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "direct",
        discountValue: 0,
        discountType: "percent", // Corrected default value
        maxDiscountValue: 0,
        minOrderValue: 0,
        usageLimit: 1,
        perUserLimit: 1,
        startDate: "",
        endDate: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

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
        // Validate các trường bắt buộc
        const errors: string[] = [];
        if (!formData.name.trim()) errors.push(t.voucher.validation.requiredName);
        if (!formData.description.trim()) errors.push(t.voucher.validation.requiredDesc);
        if (!formData.startDate) errors.push(t.voucher.validation.requiredStartDate);
        if (!formData.endDate) errors.push(t.voucher.validation.requiredEndDate);
        if (formData.discountValue <= 0) errors.push(t.voucher.validation.invalidDiscount);
        if (formData.usageLimit <= 0) errors.push(t.voucher.validation.invalidLimit);

        if (errors.length > 0) {
            showErrorToast(t.voucher.validation.validationError, `${t.voucher.validation.checkAgain}${errors.join(", ")}`);
            return;
        }

        setIsConfirmOpen(true);
    };

    const confirmSubmit = async () => {
        setIsLoading(true);
        try {
            const submissionData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            await createVoucher(submissionData);
            showSuccessToast(t.common.success, t.voucher.messages.createSuccess);
            onVoucherAdded(); // Callback to refresh data
            setIsOpen(false);
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Failed to create voucher:", error);
            showErrorToast(
                t.common.error,
                error.message || t.voucher.messages.createError
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                     <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {t.voucher.addVoucher}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.voucher.createTitle}</DialogTitle>
                        <DialogDescription>
                            {t.voucher.createDesc}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="type">{t.voucher.fields.type}</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                <SelectTrigger>
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
                            <Input id="name" value={formData.name} onChange={handleInputChange} placeholder={t.voucher.fields.name} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">{t.voucher.fields.description} <span className="text-red-500">*</span></Label>
                            <Input id="description" value={formData.description} onChange={handleInputChange} placeholder={t.voucher.fields.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">{t.voucher.fields.discount} <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2">
                                <Input id="discountValue" type="number" value={formData.discountValue} onChange={handleInputChange} className="flex-1" />
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
                            <Input id="maxDiscountValue" type="number" value={formData.maxDiscountValue} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minOrderValue">{t.voucher.fields.minOrder}</Label>
                            <Input id="minOrderValue" type="number" value={formData.minOrderValue} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">{t.voucher.fields.usageLimit} <span className="text-red-500">*</span></Label>
                                    <Input id="usageLimit" type="number" value={formData.usageLimit} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="perUserLimit">{t.voucher.fields.userLimit}</Label>
                                    <Input id="perUserLimit" type="number" value={formData.perUserLimit} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">{t.voucher.fields.startDate} <span className="text-red-500">*</span></Label>
                            <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">{t.voucher.fields.endDate} <span className="text-red-500">*</span></Label>
                            <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handlePreSubmit}>
                            {t.voucher.createTitle}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.voucher.confirmCreateTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.voucher.confirmCreateDesc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit} disabled={isLoading}>
                            {isLoading ? t.common.creating : t.common.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
