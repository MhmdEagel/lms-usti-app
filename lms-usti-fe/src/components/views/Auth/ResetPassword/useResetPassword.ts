import { useForm } from "react-hook-form";
import { useState } from "react";
import { resetSchema } from "@/schemas/schemas";
import { resetPassword } from "@/actions/reset";
import { zodResolver } from "@hookform/resolvers/zod";
import { IVerification } from "@/types/Auth";

const useResetPassword = () => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetSchema),
  });
  const { errors } = form.formState;

  const handleResetPassword = async (data: IVerification) => {
    try {
      setIsPending(true);
      const result = await resetPassword(data);
      if (!result.success) {
        form.setError("root", { message: result.error });
      }
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
