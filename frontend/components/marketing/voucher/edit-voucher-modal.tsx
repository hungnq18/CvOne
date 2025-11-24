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
import { toast } from "@/components/ui/use-toast"
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

export function EditVoucherModal({ voucher, onVoucherUpdated, isOpen, setIsOpen }: { voucher: Voucher | null, onVoucherUpdated: () => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
    const [formData, setFormData] = useState<Partial<Voucher>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (voucher) {
            setFormData({
                ...voucher,
                startDate: formatDateForInput(voucher.startDate),
                endDate: formatDateForInput(voucher.endDate),
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

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const submissionData = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            };
            await updateVoucher(voucher._id, submissionData);
            toast({ title: "Success", description: "Voucher updated successfully." });
            onVoucherUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update voucher:", error);
            toast({ title: "Error", description: "Failed to update voucher.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Voucher Name" />
                    </div>

                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Voucher Description" />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="discountValue">Discount</Label>
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
                                <Label htmlFor="usageLimit">Usage Limit</Label>
                                <Input id="usageLimit" type="number" value={formData.usageLimit || 0} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="perUserLimit">User Limit</Label>
                                <Input id="perUserLimit" type="number" value={formData.perUserLimit || 0} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
