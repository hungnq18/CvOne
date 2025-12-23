"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banner, updateBanner } from "@/api/bannerApi";
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/global_provider";

interface EditBannerModalProps {
  banner: Banner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBannerUpdated: () => void;
}

export function EditBannerModal({
  banner,
  open,
  onOpenChange,
  onBannerUpdated,
}: EditBannerModalProps) {
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

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        redirectUrl: banner.redirectUrl || "",
        imageUrl: banner.imageUrl || "",
        position: banner.position || "top",
        startDate: banner.startDate
          ? new Date(banner.startDate).toISOString().split("T")[0]
          : "",
        endDate: banner.endDate
          ? new Date(banner.endDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [banner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
      await updateBanner(banner._id, formData);
      showSuccessToast(t.common.success, t.banner.messages.updateSuccess);
      onBannerUpdated();
      onOpenChange(false);
    } catch (error) {
      showErrorToast(t.common.error, t.banner.messages.updateError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t.banner.editTitle}</DialogTitle>
          <DialogDescription>{t.banner.editDesc}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              {t.banner.fields.title} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t.banner.fields.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="position">
              {t.banner.fields.position} <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="imageUrl">
              {t.banner.fields.imageUrl} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="redirectUrl">
              {t.banner.fields.redirectUrl}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="redirectUrl"
              value={formData.redirectUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/promotion"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">
              {t.banner.fields.startDate}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">
              {t.banner.fields.endDate} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t.common.saving : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
