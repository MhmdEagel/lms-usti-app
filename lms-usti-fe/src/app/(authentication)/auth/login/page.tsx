import Login from "@/components/views/Auth/Login/Login";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Login" });

export default function LoginPage() {
  return (
      <Login />
  )
}
