import ResetPassword from "@/components/views/Auth/ResetPassword/ResetPassword";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Reset Password" });

export default function ResetPasswordPage() {
  return (
        <ResetPassword />
  )
}
