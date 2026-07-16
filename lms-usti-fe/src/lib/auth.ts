import { cookies } from "next/headers";
import authServices from "@/services/auth.service";

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token?.value) {
    return null;
  }
  try {
    const user = await authServices.me();
    return user.data.data;
  } catch {
    return null;
  }
};

