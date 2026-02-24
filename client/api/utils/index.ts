import { isAxiosError } from "axios";

export const getAxiosErrorMessage = (err: unknown) => {
  if (isAxiosError(err)) {
    return err.response?.data.message || err.message || "Unexpected Error";
  }

  if (err instanceof Error) return err.message;

  return "Unexpected Error";
};
