import { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "Waktu koneksi habis. Silakan coba lagi.";
      }
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        return "Gagal terhubung ke server. Periksa koneksi Anda.";
      }
      return "Server tidak merespon. Silakan coba lagi.";
    }
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
