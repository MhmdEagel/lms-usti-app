import NewPassword from "@/components/views/Auth/ResetPassword/NewPassword/NewPassword";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Reset Password" });

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPassword />
    </Suspense>
  );
}
