"use server";

import authServices from "@/services/auth.service";
import { extractErrorMessage } from "@/lib/error";
import type { IVerifyOTPRequest } from "@/types/Auth";

export async function sendOTP(oldPassword: string) {
  try {
    const res = await authServices.sendOTP({ old_password: oldPassword });
    return { success: true as const, data: res.data };
  } catch (error) {
    return { success: false as const, error: extractErrorMessage(error) };
  }
}

export async function verifyOTP(data: IVerifyOTPRequest) {
  try {
    const res = await authServices.verifyOTP(data);
    return { success: true as const, data: res.data };
  } catch (error) {
    return { success: false as const, error: extractErrorMessage(error) };
  }
}
