import NewVerification from "@/components/views/Auth/Activation/Activation";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Verifikasi Email" });

export default function VerificationPage() {
  return (
    <Suspense>
      <NewVerification />
    </Suspense>
  );
}
