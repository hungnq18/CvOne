import { toast } from "@/hooks/use-toast";

const formatMessage = (message: string) => {
  if (!message) return "";
  return message;
};

export const notify = {
  success: (message: string) => {
    toast({
      title: "CVone",
      description: formatMessage(message),
      variant: "success" as any,
    });
  },
  error: (message: string) => {
    toast({
      title: "CVone",
      description: formatMessage(message),
      variant: "destructive",
    });
  },
  info: (message: string) => {
    toast({
      title: "CVone",
      description: formatMessage(message),
      variant: "info" as any,
    });
  },
};


