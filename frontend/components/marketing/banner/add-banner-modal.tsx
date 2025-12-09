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
import { createBanner } from "@/api/bannerApi"
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils"
import { PlusCircle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/providers/global_provider"

export function AddBannerModal({ onBannerAdded }: { onBannerAdded: () => void }) {
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
    const { t } = useLanguage();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) return t.banner.validation.requiredTitle;
        if (!formData.position) return t.banner.validation.requiredPosition;
        if (!formData.startDate) return t.banner.validation.requiredStartDate;
        if (!formData.endDate) return t.banner.validation.requiredEndDate;
        if (!formData.imageUrl.trim()) return t.banner.validation.requiredImage;
        if (!formData.redirectUrl.trim()) return t.banner.validation.requiredUrl;

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            return t.banner.validation.dateOrder;
        }
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            showErrorToast(t.banner.validation.missingInfo, validationError);
            return;
        }

        setIsLoading(true);
        try {
            await createBanner(formData);
            showSuccessToast(t.common.success, t.banner.messages.createSuccess);
            onBannerAdded();
            setIsOpen(false);
            // Reset form
            setFormData({
                title: "",
                redirectUrl: "",
                imageUrl: "",
                position: "top",
                startDate: "",
                endDate: "",
            });
        } catch (error) {
            console.error("Failed to create banner:", error);
            showErrorToast(t.common.error, t.banner.messages.createError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t.banner.addBanner}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>{t.banner.createTitle}</DialogTitle>
                    <DialogDescription>
                        {t.banner.createDesc}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">{t.banner.fields.title} <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t.banner.fields.title}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="position">{t.banner.fields.position} <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.position}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, position: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t.banner.fields.selectPosition} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="startDate">{t.banner.fields.startDate} <span className="text-red-500">*</span></Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="endDate">{t.banner.fields.endDate} <span className="text-red-500">*</span></Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="imageUrl">{t.banner.fields.imageUrl} <span className="text-red-500">*</span></Label>
                        <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="redirectUrl">{t.banner.fields.redirectUrl} <span className="text-red-500">*</span></Label>
                        <Input
                            id="redirectUrl"
                            value={formData.redirectUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/promotion"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>{t.common.cancel}</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? t.common.creating : t.banner.addBanner}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
