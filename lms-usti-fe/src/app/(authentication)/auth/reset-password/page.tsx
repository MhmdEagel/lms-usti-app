import ResetPassword from "@/components/views/Auth/ResetPassword/ResetPassword";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Ubah Kata Sandi" });

export default function ResetPasswordPage() {
  return (
        <ResetPassword />
  )
}
