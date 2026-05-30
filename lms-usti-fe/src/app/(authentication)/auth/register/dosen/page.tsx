import RegisterDosen from "@/components/views/Auth/Register/RegisterDosen/RegisterDosen";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Register Dosen" });

export default function RegisterDosenPage() {
  return (
        <RegisterDosen />
  )
}
