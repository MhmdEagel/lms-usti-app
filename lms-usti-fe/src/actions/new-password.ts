"use server";

import authServices from "@/services/auth.service";
import { INewPassword } from "@/types/Auth";
import { redirect } from "next/navigation";

export const newPassword = async (payload: INewPassword) => {
  try {
    await authServices.newPassword(payload);
    redirect("/auth/new-password/success");
  } catch (error) {
    throw error;
  }
};
