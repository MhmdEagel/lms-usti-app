"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  onSubmit: (otp: string) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
}

export default function OTPVerification({
  onSubmit,
  onCancel,
  isPending,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    if (otp.length === 6) {
      onSubmit(otp);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-semibold">Masukkan Kode Verifikasi</h4>
        <p className="text-sm text-muted-foreground">
          Kode 6 digit telah dikirim ke email Anda
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Kembali
        </Button>
        <Button onClick={handleSubmit} disabled={otp.length !== 6 || isPending}>
          {isPending ? "Memverifikasi..." : "Verifikasi"}
        </Button>
      </div>
    </div>
  );
}
