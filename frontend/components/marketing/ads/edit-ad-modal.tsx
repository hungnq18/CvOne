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
import { Ad, updateAd } from "@/api/adsApi"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditAdModalProps {
  ad: Ad
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdUpdated: () => void
}

export function EditAdModal({ ad, open, onOpenChange, onAdUpdated }: EditAdModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    redirectUrl: "",
    imageUrl: "",
    position: "top",
    startDate: "",
    endDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || "",
        redirectUrl: ad.redirectUrl || "",
        imageUrl: ad.imageUrl || "",
        position: ad.position || "top",
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
      })
    }
  }, [ad])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await updateAd(ad._id, formData)
      toast({ title: "Success", description: "Ad updated successfully." })
      onAdUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update ad:", error)
      toast({ title: "Error", description: "Failed to update ad.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin quảng cáo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={formData.title} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input id="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="redirectUrl" className="text-right">
              Redirect URL
            </Label>
            <Input id="redirectUrl" value={formData.redirectUrl} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.position}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, position: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
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


