import ResetPasswordSuccess from "@/components/views/Auth/ResetPassword/ResetPasswordSuccess/ResetPasswordSuccess";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Reset Password" });

export default function ResetPasswordPage() {
  return <ResetPasswordSuccess />;
}
