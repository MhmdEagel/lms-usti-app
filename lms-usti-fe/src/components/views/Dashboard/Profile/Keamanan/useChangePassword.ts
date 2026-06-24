"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePasswordSchema } from "@/schemas/schemas";
import { sendOTP, verifyOTP } from "@/actions/auth";
import { toast } from "sonner";

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type Step = "password" | "otp";

export const useChangePassword = () => {
  const [step, setStep] = useState<Step>("password");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirmPassword: "",
    },
  });

  const handleSubmitPassword = async (values: ChangePasswordForm) => {
    setIsPending(true);
    try {
      await sendOTP(values.old_password);
      toast.success("Kode OTP telah dikirim ke email");
      setStep("otp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim OTP");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitOTP = async (otp: string) => {
    setIsPending(true);
    try {
      const values = form.getValues();
      await verifyOTP({
        otp,
        old_password: values.old_password,
        new_password: values.new_password,
      });
      toast.success("Password berhasil diubah");
      form.reset();
      setStep("password");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memverifikasi OTP");
      setStep("password");
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setStep("password");
  };

  return {
    step,
    isPending,
    form,
    handleSubmitPassword,
    handleSubmitOTP,
    handleCancel,
  };
};
