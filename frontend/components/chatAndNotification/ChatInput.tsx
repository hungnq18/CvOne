"use client"

import type React from "react"
import { memo } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
    content: string
    onContentChange: (content: string) => void
    onSend: () => void
}

function ChatInput({ content, onContentChange, onSend }: ChatInputProps) {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    return (
        <div className="bg-background border-t border-border sticky bottom-0 z-10 px-4 py-4">
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder-muted-foreground"
                    placeholder="..."
                />
                <button
                    onClick={onSend}
                    className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-background shadow-md hover:shadow-lg active:scale-95"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    )
}
export default memo(ChatInput)
