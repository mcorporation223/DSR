import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const toastNotification = {
  success: (title: string, message: string) => {
    toast(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-white" />
          <h3 className="font-medium text-base text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-100 ml-7">{message}</p>
      </div>,
      {
        duration: 5000,
        className: "!bg-green-600 !border-green-700",
        style: { backgroundColor: "#16a34a" },
      }
    );
  },
  error: (title: string, message: string) => {
    toast(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-white" />
          <h3 className="font-medium text-base text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-100 ml-7">{message}</p>
      </div>,
      {
        duration: 5000,
        className: "!bg-red-600 !border-red-700",
        style: { backgroundColor: "#dc2626" },
      }
    );
  },
};
