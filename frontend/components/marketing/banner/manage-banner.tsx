"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileDown,
  MoreVertical,
  Facebook,
  BarChart2,
  CheckCircle,
  XCircle,
  PauseCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { getAllBanners, Banner, deleteBanner } from "@/api/bannerApi";
import { showSuccessToast, showErrorToast } from "@/utils/popUpUtils";
import { AddBannerModal } from "./add-banner-modal";
import { EditBannerModal } from "./edit-banner-modal";
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

const platformIcons: { [key: string]: React.ReactNode } = {
  Facebook: <Facebook className="h-5 w-5 text-[#1877F2]" />,
  "Google Ads": <BarChart2 className="h-5 w-5 text-[#4285F4]" />,
  Instagram: <Facebook className="h-5 w-5 text-[#E4405F]" />,
};

const statusInfo: { [key: string]: { icon: React.ReactNode; color: string } } =
  {
    running: {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      color: "border-green-500",
    },
    paused: {
      icon: <PauseCircle className="h-4 w-4 text-yellow-500" />,
      color: "border-yellow-500",
    },
    ended: {
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
      color: "border-gray-500",
    },
    active: {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      color: "border-green-500",
    },
    inactive: {
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
      color: "border-gray-500",
    },
  };

export function ManageBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBanner) return;
    try {
      await deleteBanner(selectedBanner._id);
      showSuccessToast(t.common.success, t.banner.messages.deleteSuccess);
      fetchBanners();
    } catch (error) {
      showErrorToast(t.common.error, t.banner.messages.deleteError);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
    }
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (error) {
      showErrorToast(t.common.error, "Could not fetch banners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (banner: Banner): string => {
    if (banner.isActive === false) return "inactive";
    const now = new Date();
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    if (endDate && endDate < now) return "ended";
    return "active";
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.banner.manageTitle}</h1>
          <p className="text-muted-foreground">{t.banner.manageDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <AddBannerModal onBannerAdded={fetchBanners} />
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t.banner.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      ) : filteredBanners.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanners.map((banner) => {
            const status = getStatus(banner);
            const statusDisplay = statusInfo[status] || statusInfo.inactive;
            return (
              <Card
                key={banner._id}
                className={`flex flex-col border-l-4 ${statusDisplay.color}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Placeholder for platform icon if needed */}
                      <CardTitle className="text-lg">{banner.title}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBanner(banner);
                            setIsEditOpen(true);
                          }}
                        >
                          {t.banner.editTitle}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(banner)}
                        >
                          {t.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="rounded-md object-cover h-40 w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Redirects to: {banner.redirectUrl}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>
                    Ends:{" "}
                    {banner.endDate
                      ? new Date(banner.endDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <div className="flex items-center gap-2">
                    {statusDisplay.icon}
                    <span className="capitalize">{status}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.banner.noBanners}</p>
        </div>
      )}
      <EditBannerModal
        banner={selectedBanner as Banner}
        open={isEditOpen && !!selectedBanner}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedBanner(null);
          }
        }}
        onBannerUpdated={fetchBanners}
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
