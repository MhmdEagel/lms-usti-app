"use server";

import authServices from "@/services/auth.service";
import { IActivation } from "@/types/Auth";

export const activateUser = async (payload: IActivation) => {
  try {
    const res = await authServices.activate(payload);
    return res.data
  } catch (error) {
    throw error;
  }
};
