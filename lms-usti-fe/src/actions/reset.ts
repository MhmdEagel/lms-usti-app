"use server";

import authServices from "@/services/auth.service";
import { IVerification } from "@/types/Auth";
import { extractErrorMessage } from "@/lib/error";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type ResetPasswordResult =
  | { success: true }
  | { success: false; error: string };

export const resetPassword = async (
  payload: IVerification
): Promise<ResetPasswordResult> => {
  try {
    await authServices.resetPassword(payload);
    redirect("/auth/reset-password/success");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: extractErrorMessage(error) };
  }
};
