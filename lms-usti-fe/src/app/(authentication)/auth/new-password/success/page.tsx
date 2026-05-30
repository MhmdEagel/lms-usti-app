import NewPasswordSuccess from "@/components/views/Auth/ResetPassword/NewPassword/NewPasswordSuccess/NewPasswordSuccess";
import { createMetadata } from "@/lib/metadata";


export const generateMetadata = () => createMetadata({ title: "Reset Password" });

export default function NewPasswordSuccessPage() {
  return (
      <NewPasswordSuccess />
  )
}
