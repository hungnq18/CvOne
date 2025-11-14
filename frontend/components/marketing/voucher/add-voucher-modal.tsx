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
import { toast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddVoucherModal({ onVoucherAdded }: { onVoucherAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Basic validation
            if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
                toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
            const submissionData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            await createVoucher(submissionData);
            toast({ title: "Success", description: "Voucher created successfully." });
            onVoucherAdded(); // Callback to refresh data
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create voucher:", error);
            toast({ title: "Error", description: "Failed to create voucher.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Voucher
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Voucher</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new voucher.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountValue" className="text-right">Discount</Label>
                        <Input id="discountValue" type="number" value={formData.discountValue} onChange={handleInputChange} className="col-span-2" />
                        <Select value={formData.discountType} onValueChange={(value) => handleSelectChange('discountType', value)}>
                            <SelectTrigger className="col-span-1">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percent">%</SelectItem>
                                <SelectItem value="amount">$</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maxDiscountValue" className="text-right">Max Discount</Label>
                        <Input id="maxDiscountValue" type="number" value={formData.maxDiscountValue} onChange={handleInputChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="minOrderValue" className="text-right">Min Order</Label>
                        <Input id="minOrderValue" type="number" value={formData.minOrderValue} onChange={handleInputChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input id="usageLimit" type="number" value={formData.usageLimit} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                        <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">End Date</Label>
                        <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="col-span-3" />
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
