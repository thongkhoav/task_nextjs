import { toast } from "react-toastify";

export const ToastSuccess = (message: string) => {
  toast.success(message);
};

export const ToastError = (message: string) => {
  toast.error(message);
};

export const ToastInfo = (message: string) => {
  toast.info(message);
};

export const ToastWarning = (message: string) => {
  toast.warning(message);
};
