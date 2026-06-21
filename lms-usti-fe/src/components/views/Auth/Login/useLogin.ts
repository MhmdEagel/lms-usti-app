import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { ILogin } from "@/types/Auth";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "@/schemas/schemas";
import loginUser from "@/actions/login";
import { z } from "zod";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";

const useLogin = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
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
      await loginUser(data, callbackUrl);
    } catch (error) {
      const err = error as Error;
      setError("root", {
        message: err.message,
      });
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
