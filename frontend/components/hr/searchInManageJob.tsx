import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface JobFilterBarProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
}

const JobFilterBar: React.FC<JobFilterBarProps> = ({ searchTerm, onSearchTermChange }) => {
    return (
        <div className="flex items-center space-x-2 w-full">
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={e => onSearchTermChange(e.target.value)}
                    className="pl-8 w-full"
                />
            </div>
        </div>
    );
};

export default JobFilterBar; 