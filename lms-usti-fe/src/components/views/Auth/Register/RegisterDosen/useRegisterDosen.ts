import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerUser } from "@/actions/register";
import { registerSchema } from "@/schemas/schemas";
import { IRegister } from "@/types/Auth";
import z from "zod";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";

const useRegister = () => {
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [isPending, setIsPending] = useState(false);

  const toggleVisibility = (identifier: "password" | "confirmPassword") => {
    if (identifier === "password") {
      setVisibility({ ...visibility, password: !visibility.password });
    } else {
      setVisibility({
        ...visibility,
        confirmPassword: !visibility.confirmPassword,
      });
    }
  };

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "DOSEN",
    },
  });
  const { setError } = form;
  const { errors } = form.formState;
  const handleRegister = async (data: IRegister) => {
    try {
      setIsPending(true);
      await registerUser(data);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      setError("root", {
        message: err.response?.data.meta.message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    visibility,
    handleRegister,
    form,
    errors,
    toggleVisibility,
    isPending,
  };
};
export default useRegister;
