import { useForm } from "react-hook-form";
import { useState } from "react";
import { resetSchema } from "@/schemas/schemas";
import { resetPassword } from "@/actions/reset";
import { zodResolver } from "@hookform/resolvers/zod";
import { IVerification } from "@/types/Auth";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";

const useResetPassword = () => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetSchema),
  });
  const { errors } = form.formState;
  const handleResetPassword = async (data: IVerification) => {
    try {
      setIsPending(true);
      await resetPassword(data);
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
    form,
    handleResetPassword,
    errors,
    isPending,
  };
};
export default useResetPassword;
