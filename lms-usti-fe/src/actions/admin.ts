"use server";

import adminServices from "@/services/admin.service";

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  const res = await adminServices.getAllUsers(params);
  return res.data;
}
