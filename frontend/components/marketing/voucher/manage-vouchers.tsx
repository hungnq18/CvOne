"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileDown, MoreVertical } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAllVouchers, deleteVoucher, Voucher } from "@/api/voucherApi"
import { AddVoucherModal } from "./add-voucher-modal"
import { EditVoucherModal } from "./edit-voucher-modal"
import { toast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const statusColors: { [key: string]: string } = {
    active: "bg-green-500",
    expired: "bg-gray-500",
    used: "bg-blue-500",
    inactive: "bg-red-500",
    upcoming: "bg-yellow-500",
}

const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.isActive) return 'inactive';
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    if (voucher.usageLimit && (voucher.usedCount || 0) >= voucher.usageLimit) return 'used';

    return 'active';
}

export function ManageVouchers() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllVouchers();
            setVouchers(data);
        } catch (error) {
            console.error("Failed to fetch vouchers", error);
            toast({ title: "Error", description: "Could not fetch vouchers.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

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
                toast({ title: "Success", description: "Voucher deleted successfully." });
                fetchVouchers(); // Refresh the list
            } catch (error) {
                 toast({ title: "Error", description: "Failed to delete voucher.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setSelectedVoucher(null);
            }
        }
    };


    const filteredVouchers = vouchers.filter(voucher =>
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Vouchers</h1>
                    <p className="text-muted-foreground">
                        Here you can create, edit, and manage all promotional vouchers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <AddVoucherModal onVoucherAdded={fetchVouchers} />
                </div>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? (
                 <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading vouchers...</p>
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
                                            <DropdownMenuItem onClick={() => handleEdit(voucher)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(voucher)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="text-3xl font-bold text-primary">
                                    {voucher.discountType === 'percent'
                                        ? `${voucher.discountValue}%`
                                        : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                                </p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{voucher.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Expires: {new Date(voucher.endDate).toLocaleDateString()}</span>
                                {(() => {
                                    const status = getVoucherStatus(voucher);
                                    return (
                                        <Badge className={`${statusColors[status]} text-white capitalize`}>
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
                    <p className="text-muted-foreground">No vouchers found.</p>
                </div>
            )}
            <EditVoucherModal voucher={selectedVoucher} onVoucherUpdated={fetchVouchers} isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the voucher.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
