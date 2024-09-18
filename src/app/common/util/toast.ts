import { toast } from "react-toastify";

export const ToastSuccess = (message: React.ReactNode | string) => {
  toast.success(message);
};

export const ToastError = (message: React.ReactNode | string) => {
  toast.error(message);
};

export const ToastInfo = (message: React.ReactNode | string) => {
  toast.info(message);
};

export const ToastWarning = (message: React.ReactNode | string) => {
  toast.warning(message);
};
