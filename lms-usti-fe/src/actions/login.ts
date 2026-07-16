"use server";

import authServices from "@/services/auth.service";
import { ILogin } from "@/types/Auth";
import { extractErrorMessage } from "@/lib/error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type LoginResult =
  | { success: true }
  | { success: false; error: string };

const loginUser = async (
  data: ILogin,
  callbackUrl?: string
): Promise<LoginResult> => {
  try {
    const res = await authServices.login({
      email: data.email,
      password: data.password,
    });
    const accessToken = res.data.data.access_token;
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
    });
    const meRes = await authServices.me();
    const role = meRes.data.data.role;

    if (callbackUrl) redirect(callbackUrl);

    switch (role) {
      case "MAHASISWA":
        redirect("/mahasiswa");
      case "ADMIN":
        redirect("/admin/users");
      case "PRODI":
        redirect("/prodi");
      default:
        redirect("/dosen");
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: extractErrorMessage(error) };
  }
};

export default loginUser;
