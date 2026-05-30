import RegisterMahasiswa from "@/components/views/Auth/Register/RegisterMahasiswa/RegisterMahasiswa";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Register Mahasiswa" });

export default function RegisterMahasiswaPage() {
  return <RegisterMahasiswa />;
}
