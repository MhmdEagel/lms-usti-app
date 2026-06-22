import { z } from "zod";

export const createUserSchema = z.object({
  fullname: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["MAHASISWA", "DOSEN", "PRODI", "ADMIN"], {
    required_error: "Role wajib dipilih",
  }),
});
