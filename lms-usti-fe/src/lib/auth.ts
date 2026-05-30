import authServices from "@/services/auth.service";

export const getCurrentUser = async () => {
  const user = await authServices.me();
  return user.data.data;
};

