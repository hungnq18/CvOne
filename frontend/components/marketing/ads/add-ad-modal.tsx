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
import { createAd } from "@/api/adsApi"
import { toast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"

export function AddAdModal({ onAdAdded }: { onAdAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        redirectUrl: "",
        imageUrl: "",
        position: "top",
        startDate: "",
        endDate: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await createAd(formData);
            toast({ title: "Success", description: "Ad created successfully." });
            onAdAdded();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create ad:", error);
            toast({ title: "Error", description: "Failed to create ad.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Ad
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Ad</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new ad campaign.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={formData.title} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                        <Input id="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="redirectUrl" className="text-right">Redirect URL</Label>
                        <Input id="redirectUrl" value={formData.redirectUrl} onChange={handleInputChange} className="col-span-3" />
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
                        {isLoading ? "Creating..." : "Create Ad"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
