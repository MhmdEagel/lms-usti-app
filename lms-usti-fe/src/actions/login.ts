"use server";

import authServices from "@/services/auth.service";
import { ILogin } from "@/types/Auth";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const loginUser = async (data: ILogin, callbackUrl?: string) => {
  const { email, password } = data;
  try {
    const res = await authServices.login({ email, password });
    const response = res.data;
    const accessToken = response.data.access_token;
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
    });
    const meRes = await authServices.me();
    const role = meRes.data.data.role;
    if (callbackUrl) {
      redirect(callbackUrl);
    }
    if (role === "MAHASISWA") {
      redirect("/mahasiswa");
    } else if (role === "ADMIN") {
      redirect("/admin/users");
    } else if (role === "PRODI") {
      redirect("/prodi")
    } else {
      redirect("/dosen");
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
};

export default loginUser;
