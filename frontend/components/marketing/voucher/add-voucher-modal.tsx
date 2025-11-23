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
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Voucher Name" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={formData.description} onChange={handleInputChange} placeholder="Voucher Description" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountValue">Discount</Label>
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
                                <Label htmlFor="usageLimit">Total Limit</Label>
                                <Input id="usageLimit" type="number" value={formData.usageLimit} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="perUserLimit">User Limit</Label>
                                <Input id="perUserLimit" type="number" value={formData.perUserLimit} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
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
