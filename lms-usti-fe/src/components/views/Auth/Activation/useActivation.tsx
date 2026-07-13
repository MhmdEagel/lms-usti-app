import authServices from "@/services/auth.service";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const useActivation = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Token tidak ada");
      return;
    }

    authServices.activate({ token })
      .then((res) => {
        setSuccess(res.data.meta.message);
      })
      .catch(() => {
        setError("Gagal aktivasi user");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return {
    error,
    success,
  };
};

export default useActivation;
