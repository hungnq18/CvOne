import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success",
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "info",
  });
};
