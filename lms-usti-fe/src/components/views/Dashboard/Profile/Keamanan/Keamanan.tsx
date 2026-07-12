"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useChangePassword } from "./useChangePassword";
import ChangePasswordForm from "./ChangePasswordForm";
import OTPVerification from "./OTPVerification";

export default function Keamanan() {
  const {
    step,
    isPending,
    form,
    handleSubmitPassword,
    handleSubmitOTP,
    handleCancel,
  } = useChangePassword();

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
        <h3 className="text-sm md:text-base font-bold text-primary">
          Ubah Password
        </h3>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {step === "otp" ? (
          <OTPVerification
            onSubmit={handleSubmitOTP}
            onCancel={handleCancel}
            isPending={isPending}
          />
        ) : (
          <ChangePasswordForm
            form={form}
            isPending={isPending}
            onSubmit={handleSubmitPassword}
          />
        )}
      </CardContent>
    </Card>
  );
}
