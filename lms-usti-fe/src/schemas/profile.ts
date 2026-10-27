import { z } from "zod";

export const updateProfileSchema = z.object({
  fullname: z.string({ required_error: "Nama wajib diisi" }),
  email: z.string().email("Format email tidak valid"),
});
