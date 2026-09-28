import { useForm } from "react-hook-form";
import { useState } from "react";
import { INewPassword } from "@/types/Auth";
import { newPasswordSchema } from "@/schemas/schemas";
import { useSearchParams, useRouter } from "next/navigation";
import authServices from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";

const useNewPasswordForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [visibility, setVisibility] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const toggleVisibility = (
    identifier: "old_password" | "new_password" | "confirm_password",
  ) => {
    if (identifier === "old_password") {
      setVisibility({
        ...visibility,
        old_password: !visibility.old_password,
      });
    } else if (identifier === "new_password") {
      setVisibility({
        ...visibility,
        new_password: !visibility.new_password,
      });
    } else {
      setVisibility({
        ...visibility,
        confirm_password: !visibility.confirm_password,
      });
    }
  };

  const form = useForm({
    resolver: zodResolver(newPasswordSchema),
  });

  const { errors } = form.formState;

  const handleNewPassword = async (data: INewPassword) => {
    if (!token) {
      form.setError("root", {
        message: "invalid token",
      });
      return;
    }
    data.token = token;
    try {
      setIsPending(true);
      await authServices.newPassword(data);
      router.push("/auth/new-password/success");
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      form.setError("root", {
        message: err.response?.data.meta.message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    errors,
    handleNewPassword,
    form,
    isPending,
    visibility,
    toggleVisibility,
  };
};
export default useNewPasswordForm;
