"use server";

import adminServices from "@/services/admin.service";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

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

export async function getUserById(userId: string) {
  try {
    const res = await adminServices.getUserById(userId);
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
    revalidatePath("/admin/users")
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function updateUser(userId: string, data: IUpdateUserRequest) {
  try {
    const res = await adminServices.updateUser(userId, data);
    revalidatePath("/admin/users")
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const res = await adminServices.deleteUser(userId);
    revalidatePath("/admin/users")
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
