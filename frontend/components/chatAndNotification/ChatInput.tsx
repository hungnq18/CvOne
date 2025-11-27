import React, { memo } from 'react';

interface ChatInputProps {
    content: string;
    onContentChange: (content: string) => void;
    onSend: () => void;
}

function ChatInput({
    content,
    onContentChange,
    onSend
}: ChatInputProps) {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 shadow-md">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Type a message..."
                />
                <button
                    onClick={onSend}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

// Memoize component để tránh re-render không cần thiết
export default memo(ChatInput);