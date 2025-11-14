"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileDown, MoreVertical, Facebook, BarChart2, CheckCircle, XCircle, PauseCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { getAllAds, Ad } from "@/api/adsApi"
import { toast } from "@/components/ui/use-toast"
import { AddAdModal } from "./add-ad-modal"


const platformIcons: { [key: string]: React.ReactNode } = {
    "Facebook": <Facebook className="h-5 w-5 text-[#1877F2]" />,
    "Google Ads": <BarChart2 className="h-5 w-5 text-[#4285F4]" />,
    "Instagram": <Facebook className="h-5 w-5 text-[#E4405F]" />
};

const statusInfo: { [key: string]: { icon: React.ReactNode; color: string } } = {
    running: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "border-green-500" },
    paused: { icon: <PauseCircle className="h-4 w-4 text-yellow-500" />, color: "border-yellow-500" },
    ended: { icon: <XCircle className="h-4 w-4 text-gray-500" />, color: "border-gray-500" },
    active: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "border-green-500" },
    inactive: { icon: <XCircle className="h-4 w-4 text-gray-500" />, color: "border-gray-500" },
};


export function ManageAds() {
    const [ads, setAds] = useState<Ad[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true);

    const fetchAds = async () => {
        setIsLoading(true);
        try {
            const data = await getAllAds();
            setAds(data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
            toast({ title: "Error", description: "Could not fetch ads.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAds();
    }, []);

    const filteredAds = ads.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatus = (ad: Ad): string => {
        if (ad.isActive === false) return 'inactive';
        const now = new Date();
        const endDate = ad.endDate ? new Date(ad.endDate) : null;
        if (endDate && endDate < now) return 'ended';
        return 'active';
    }


    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Ads</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage all your advertising campaigns.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <AddAdModal onAdAdded={fetchAds} />
                </div>
            </div>

             <div className="mb-6">
                <Input
                    placeholder="Search by ad title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading ads...</p>
                </div>
            ) : filteredAds.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAds.map((ad) => {
                        const status = getStatus(ad);
                        const statusDisplay = statusInfo[status] || statusInfo.inactive;
                        return (
                        <Card key={ad._id} className={`flex flex-col border-l-4 ${statusDisplay.color}`}>
                            <CardHeader>
                                 <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {/* Placeholder for platform icon if needed */}
                                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <img src={ad.imageUrl} alt={ad.title} className="rounded-md object-cover h-40 w-full" />
                                <p className="text-sm text-muted-foreground">Redirects to: {ad.redirectUrl}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Ends: {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'N/A'}</span>
                                <div className="flex items-center gap-2">
                                    {statusDisplay.icon}
                                    <span className="capitalize">{status}</span>
                                </div>
                            </CardFooter>
                        </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <p className="text-muted-foreground">No ads found.</p>
                </div>
            )}
        </div>
    )
}
