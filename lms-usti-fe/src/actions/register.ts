"use server";

import authServices from "@/services/auth.service";
import { IRegister } from "@/types/Auth";
import { redirect } from "next/navigation";

const registerUser = async (data: IRegister) => {
  const { fullname, email, password, role } = data;
  try {
    await authServices.register({
      fullname,
      email,
      password,
      role,
    });
    redirect("/auth/register/success");
  } catch (e) {
    throw e;
  }
};

export { registerUser };
