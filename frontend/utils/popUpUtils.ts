import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success",
    duration: 5000,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    duration: 5000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "info",
    duration: 5000,
  });
};
