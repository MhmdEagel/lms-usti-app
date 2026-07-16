import { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data?.meta && typeof data.meta === "object") {
      const meta = data.meta as Record<string, unknown>;
      if (typeof meta.message === "string" && meta.message) {
        return meta.message;
      }
    }
    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan";
}
