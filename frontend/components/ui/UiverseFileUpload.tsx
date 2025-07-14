import React from 'react';

interface UiverseFileUploadProps {
    onFileChange: (file: File) => void;
    accept?: string;
    disabled?: boolean;
    fileName?: string;
}

export const UiverseFileUpload: React.FC<UiverseFileUploadProps> = ({ onFileChange, accept = '.pdf,.doc,.docx', disabled, fileName }) => {
    return (
        <label className="bg-blue-100 w-full h-12 px-3 rounded-xl cursor-pointer flex items-center justify-between gap-2 border-none hover:bg-blue-200 transition shadow-md">
            <svg fill="#2563eb" viewBox="0 0 32 32" className="h-6"><path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path><path d="M18.153 6h-.009v5.342H23.5v-.002z"></path></svg>
            <p className="flex-1 text-center text-black text-sm truncate">{fileName || 'Chọn file để tải lên'}</p>
            <svg viewBox="0 0 24 24" fill="none" className="h-6"><path d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z" stroke="#2563eb" strokeWidth="2"></path><path d="M19.5 5H4.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"></path><path d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z" stroke="#2563eb" strokeWidth="2"></path></svg>
            <input
                id="file-uiverse"
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) onFileChange(file);
                }}
            />
        </label>
    );
};
export default UiverseFileUpload; 