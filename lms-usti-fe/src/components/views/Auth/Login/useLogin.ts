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

  useEffect(() => {
    const registerSuccess = searchParams.get("success");
    if (registerSuccess) {
      setRegisterSuccess(true);
      const timeout = setTimeout(() => {
        setRegisterSuccess(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const handleVisibility = () => setIsVisible(!isVisible);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const { errors } = form.formState;
  const { setError } = form;

  const handleLogin = async (data: ILogin) => {
    try {
      setIsPending(true);
      await loginUser(data);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      setError("root", { message: err.response?.data.meta.message || "Terjadi kesalahan, coba lagi" });
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
    registerSuccess,
  };
};
export default useLogin;
