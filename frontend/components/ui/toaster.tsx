"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string | null) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
      case "destructive":
        return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant as any} {...props}>
            <div className="flex items-start gap-3 w-full">
              <div className="mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="flex-1 grid gap-1 min-w-0">
                {title && <ToastTitle className="font-semibold text-sm leading-tight">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm leading-relaxed text-slate-700">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
