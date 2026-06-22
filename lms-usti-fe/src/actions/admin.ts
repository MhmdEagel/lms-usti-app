"use server";

import adminServices from "@/services/admin.service";

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  const res = await adminServices.getAllUsers(params);
  return res.data;
}

export async function createUser(data: ICreateUserRequest) {
  const res = await adminServices.createUser(data);
  return res.data;
}
