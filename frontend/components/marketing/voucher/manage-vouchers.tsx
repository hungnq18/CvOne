"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, MoreVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllVouchers, deleteVoucher, Voucher } from "@/api/voucherApi";
import { AddVoucherModal } from "./add-voucher-modal";
import { EditVoucherModal } from "./edit-voucher-modal";
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/providers/global_provider";

const statusColors: { [key: string]: string } = {
  active: "bg-green-500",
  expired: "bg-gray-500",
  used: "bg-blue-500",
  inactive: "bg-red-500",
  upcoming: "bg-yellow-500",
};

const getVoucherStatus = (voucher: Voucher) => {
  if (!voucher.isActive) return "inactive";
  const now = new Date();
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "expired";
  if (voucher.usageLimit && (voucher.usedCount || 0) >= voucher.usageLimit)
    return "used";

  return "active";
};

export function ManageVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { t } = useLanguage();

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      showErrorToast(t.common.error, "Could not fetch vouchers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsEditModalOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedVoucher) {
      try {
        await deleteVoucher(selectedVoucher._id);
        showSuccessToast(t.common.success, t.voucher.messages.deleteSuccess);
        fetchVouchers(); // Refresh the list
      } catch (error: any) {
        showErrorToast(
          t.common.error,
          error.message || t.voucher.messages.deleteError
        );
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedVoucher(null);
      }
    }
  };

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.voucher.manageTitle}</h1>
          <p className="text-muted-foreground">{t.voucher.manageDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <AddVoucherModal onVoucherAdded={fetchVouchers} />
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t.voucher.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      ) : filteredVouchers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVouchers.map((voucher) => (
            <Card key={voucher._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{voucher.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(voucher)}>
                        {t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDelete(voucher)}
                      >
                        {t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {voucher.discountType === "percent"
                    ? `${voucher.discountValue}%`
                    : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {voucher.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Expires: {new Date(voucher.endDate).toLocaleDateString()}
                </span>
                {(() => {
                  const status = getVoucherStatus(voucher);
                  return (
                    <Badge
                      className={`${statusColors[status]} text-white capitalize`}
                    >
                      {status}
                    </Badge>
                  );
                })()}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.voucher.noVouchers}</p>
        </div>
      )}
      <EditVoucherModal
        voucher={selectedVoucher}
        onVoucherUpdated={fetchVouchers}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.confirmDeleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t.common.continue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
