"use server";

import authServices from "@/services/auth.service";
import { IVerification } from "@/types/Auth";
import { redirect } from "next/navigation";

export const resetPassword = async (payload: IVerification) => {
  try {
    await authServices.resetPassword(payload)
    redirect("/auth/reset-password/success");
  } catch(error) {
    throw error;
  }
  
};
