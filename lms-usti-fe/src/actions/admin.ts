"use server";

import adminServices from "@/services/admin.service";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  const res = await adminServices.getAllUsers(params);
  return res.data;
}

export async function createUser(data: ICreateUserRequest) {
  try {
    const res = await adminServices.createUser(data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
