import RegisterSuccess from "@/components/views/Auth/Register/RegisterSuccess/RegisterSuccess";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Register Sukses" });

export default function RegisterSuccessPage() {
  return <RegisterSuccess />;
}
