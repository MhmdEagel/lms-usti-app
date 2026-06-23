import { z } from "zod";

export const updateProfileSchema = z.object({
  fullname: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
});
