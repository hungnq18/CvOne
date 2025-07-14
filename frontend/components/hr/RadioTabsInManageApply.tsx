import React from "react";
import "@/styles/StatusRadioTabs.css";

const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Reviewed", value: "reviewed" },
    { label: "Rejected", value: "rejected" },
];

interface StatusRadioTabsProps {
    statusFilter: string;
    setStatusFilter: (v: string) => void;
}

const StatusRadioTabs: React.FC<StatusRadioTabsProps> = ({ statusFilter, setStatusFilter }) => {
    return (
        <div className="radio-inputs">
            {statusTabs.map((tab, idx) => (
                <label className="radio" key={tab.value}>
                    <input
                        type="radio"
                        name="status-radio"
                        checked={statusFilter === tab.value}
                        onChange={() => setStatusFilter(tab.value)}
                    />
                    <span className="name">
                        <span className="pre-name"></span>
                        <span className="pos-name"></span>
                        <span>{tab.label}</span>
                    </span>
                </label>
            ))}
        </div>
    );
};

export default StatusRadioTabs; 