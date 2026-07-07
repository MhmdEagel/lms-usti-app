"use server";

import adminServices from "@/services/admin.service";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

const revalidateAdmin = () => {
  revalidatePath("/admin/users")
  revalidatePath("/admin/audit")
}

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  try {
    const res = await adminServices.getAllUsers(params);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function getUserById(userID: string) {
  try {
    const res = await adminServices.getUserById(userID);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function createUser(data: ICreateUserRequest) {
  try {
    const res = await adminServices.createUser(data);
    revalidateAdmin()
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function updateUser(userID: string, data: IUpdateUserRequest) {
  try {
    const res = await adminServices.updateUser(userID, data);
    revalidateAdmin()
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function deleteUser(userID: string) {
  try {
    const res = await adminServices.deleteUser(userID);
    revalidateAdmin()
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function getAuditLogs(params?: { page?: number; limit?: number }) {
  try {
    const res = await adminServices.getAuditLogs(params);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
