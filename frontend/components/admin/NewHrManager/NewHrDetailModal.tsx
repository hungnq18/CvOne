"use client";

import { X, Check, XIcon } from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import type { HrUser } from "@/api/apiHr";
import { useLanguage } from "@/providers/global_provider";
import { useState, useEffect } from "react";
import { getProvinces, getDistrictsByProvinceCode } from "@/api/locationApi";
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

interface HRDetailModalProps {
  application: HrUser;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function HRDetailModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: HRDetailModalProps) {
  const { t, language } = useLanguage();
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [cityName, setCityName] = useState("");
  const [districtName, setDistrictName] = useState("");

  useEffect(() => {
    const fetchLocationNames = async () => {
      try {
        if (application.company_city) {
          const provinces = await getProvinces();
          const city = provinces.find(
            (p) => p.code === Number(application.company_city)
          );
          if (city) {
            setCityName(city.name);
          }
        }

        if (application.company_city && application.company_district) {
          const districts = await getDistrictsByProvinceCode(
            Number(application.company_city)
          );
          const district = districts.find(
            (d) => d.code === Number(application.company_district)
          );
          if (district) {
            setDistrictName(district.name);
          }
        }
      } catch (error) {}
    };

    if (isOpen && application.company_city) {
      fetchLocationNames();
    }
  }, [isOpen, application.company_city, application.company_district]);

  const handleRejectClick = () => {
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = () => {
    setIsConfirmRejectOpen(false);
    onReject();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[90vh] md:max-w-2xl overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold">
            {t.admin.newHr.modal.title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Contact */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground mb-3 sm:mb-4">
              {t.admin.newHr.modal.contactInfo}
            </h3>
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.firstName}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.first_name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.lastName}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.last_name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.phone}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.phone || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Company */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground mb-3 sm:mb-4">
              {t.admin.newHr.modal.companyInfo}
            </h3>
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.companyName}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.company_name}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.taxId}
                </label>
                <p className="mt-1 text-sm sm:text-lg font-mono">
                  {application.vatRegistrationNumber}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.country}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.company_country}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.city}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {cityName || application.company_city}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.district}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {districtName || application.company_district}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Registration */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground mb-3 sm:mb-4">
              {t.admin.newHr.modal.regInfo}
            </h3>

            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.regDate}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {application.createdAt
                    ? format(new Date(application.createdAt), "dd/MM/yyyy", {
                        locale: language === "vi" ? vi : enUS,
                      })
                    : "—"}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  {t.admin.newHr.modal.status}
                </label>
                <p className="mt-1 text-sm sm:text-lg">
                  {t.admin.newHr.modal.statusPending}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t" />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:bg-green-700"
            >
              <Check size={18} />
              {t.admin.newHr.modal.approve}
            </button>

            <button
              onClick={handleRejectClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:bg-red-700"
            >
              <XIcon size={18} />
              {t.admin.newHr.modal.reject}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Reject Dialog */}
      <AlertDialog
        open={isConfirmRejectOpen}
        onOpenChange={setIsConfirmRejectOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.admin.newHr.modal.confirmRejectTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.newHr.modal.confirmRejectDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t.admin.newHr.modal.confirmRejectCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.admin.newHr.modal.confirmRejectConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
