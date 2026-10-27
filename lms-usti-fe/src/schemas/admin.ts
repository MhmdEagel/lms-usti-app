import { z } from "zod";

export const createUserSchema = z.object({
  fullname: z.string({ required_error: "Nama wajib diisi" }),
  email: z.string({required_error: "Email wajib diisi"}).email({ message: "Format email tidak valid" }),
  password: z.string({required_error: "Password wajib diisi"}).min(8, "Password minimal 8 karakter"),
  role: z.enum(["MAHASISWA", "DOSEN", "PRODI", "ADMIN"], {
    required_error: "Role wajib dipilih",
  }),
});

export const updateUserSchema = z.object({
  fullname: z.string({ required_error: "Nama wajib diisi" }),
  email: z.string({required_error: "Email wajib diisi"}).email({ message: "Format email tidak valid" }),
  role: z.enum(["MAHASISWA", "DOSEN", "PRODI", "ADMIN"], {
    required_error: "Role wajib dipilih",
  }),
});
