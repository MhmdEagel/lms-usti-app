"use server";

import { cookies } from "next/headers";

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
  } catch {
    return null;
  }
};
