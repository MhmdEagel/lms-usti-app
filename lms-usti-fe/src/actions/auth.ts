"use server";

import authServices from "@/services/auth.service";
import { APIResponse } from "@/types/Response";
import type { IVerifyOTPRequest } from "@/types/Auth";
import { AxiosError } from "axios";

export async function sendOTP(oldPassword: string) {
  try {
    const res = await authServices.sendOTP({ old_password: oldPassword });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function verifyOTP(data: IVerifyOTPRequest) {
  try {
    const res = await authServices.verifyOTP(data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
