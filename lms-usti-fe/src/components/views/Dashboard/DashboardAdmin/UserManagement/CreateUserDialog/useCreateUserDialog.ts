import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/schemas/admin";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createUser } from "@/actions/admin";
import { z } from "zod";

const useCreateUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
  });
  const handleCloseForm = () => {
    setIsOpen(false);
    createUserForm.reset();
  };
  const handleCreateUser = async (data: z.infer<typeof createUserSchema>) => {
    try {
      setIsPending(true);
      const res = await createUser(data);
      if (res.meta?.status === 200) {
        handleCloseForm();
      }
    } catch (e) {
      createUserForm.setError("root", {
        message: (e as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };
  return {
    isOpen,
    isPending,
    setIsOpen,
    createUserForm,
    handleCreateUser,
    handleCloseForm,
  };
};

export default useCreateUserDialog;
