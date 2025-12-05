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
        if (!formData.name.trim()) errors.push("Tên voucher");
        if (!formData.description.trim()) errors.push("Mô tả");
        if (!formData.startDate) errors.push("Ngày bắt đầu");
        if (!formData.endDate) errors.push("Ngày kết thúc");
        if (formData.discountValue <= 0) errors.push("Giá trị giảm giá phải lớn hơn 0");
        if (formData.usageLimit <= 0) errors.push("Giới hạn sử dụng phải lớn hơn 0");

        if (errors.length > 0) {
            showErrorToast("Validation Error", `Vui lòng kiểm tra lại: ${errors.join(", ")}`);
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
            showSuccessToast("Success", `Voucher "${formData.name}" created successfully.`);
            onVoucherAdded(); // Callback to refresh data
            setIsOpen(false);
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Failed to create voucher:", error);
            showErrorToast(
                "Error",
                error.message || "Failed to create voucher. Please try again."
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
                        Add Voucher
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Voucher</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the new voucher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                <SelectTrigger>
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
                            <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Voucher Name" />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <Input id="description" value={formData.description} onChange={handleInputChange} placeholder="Voucher Description" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">Discount <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="maxDiscountValue">Max Discount</Label>
                            <Input id="maxDiscountValue" type="number" value={formData.maxDiscountValue} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minOrderValue">Min Order</Label>
                            <Input id="minOrderValue" type="number" value={formData.minOrderValue} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">Total Limit <span className="text-red-500">*</span></Label>
                                    <Input id="usageLimit" type="number" value={formData.usageLimit} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="perUserLimit">User Limit</Label>
                                    <Input id="perUserLimit" type="number" value={formData.perUserLimit} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                            <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handlePreSubmit}>
                            Create Voucher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Create Voucher</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to create this voucher?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit} disabled={isLoading}>
                            {isLoading ? "Creating..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
