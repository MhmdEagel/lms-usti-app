import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ILogin } from "@/types/Auth";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "@/schemas/schemas";
import loginUser from "@/actions/login";
import { z } from "zod";

const useLogin = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();

  const handleVisibility = () => setIsVisible(!isVisible);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const { errors } = form.formState;
  const { setError } = form;

  const handleLogin = async (data: ILogin) => {
    try {
      setIsPending(true);
      const callbackUrl = searchParams.get("callbackUrl") || undefined;
      const result = await loginUser(data, callbackUrl);
      if (!result.success) {
        setError("root", { message: result.error });
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    isVisible,
    handleLogin,
    errors,
    form,
    handleVisibility,
    isPending,
  };
};
export default useLogin;
