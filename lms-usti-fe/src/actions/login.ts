"use server";

import authServices from "@/services/auth.service";
import { ILogin } from "@/types/Auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const loginUser = async (data: ILogin) => {
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
    if (role === "MAHASISWA") {
      redirect("/mahasiswa");
    } else {
      redirect("/dosen");
    }
  } catch (error) {
    throw error;
  }
};

export default loginUser;
