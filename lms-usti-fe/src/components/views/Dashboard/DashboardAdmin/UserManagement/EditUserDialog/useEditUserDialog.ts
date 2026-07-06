import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "@/schemas/admin";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getUserById, updateUser } from "@/actions/admin";
import { z } from "zod";

type UseEditUserDialogProps = {
  id: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const useEditUserDialog = ({ id, isOpen, setIsOpen, onSuccess }: UseEditUserDialogProps) => {
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const editUserForm = useForm({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await getUserById(id);
        const user = res.data as IUser;
        editUserForm.reset({
          fullname: user.fullname,
          email: user.email,
          role: user.role as IUpdateUserRequest["role"],
        });
      } catch {
        editUserForm.setError("root", {
          message: "Gagal mengambil data dari server",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [isOpen, id, editUserForm]);

  const handleCloseForm = () => {
    setIsOpen(false);
    editUserForm.reset();
  };

  const handleUpdateUser = async (data: z.infer<typeof updateUserSchema>) => {
    try {
      setIsPending(true);
      const res = await updateUser(id, data);
      if (res.meta?.status === 200) {
        handleCloseForm();
        onSuccess?.();
      }
    } catch (e) {
      editUserForm.setError("root", {
        message: (e as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    isOpen,
    isPending,
    isLoading,
    setIsOpen,
    editUserForm,
    handleUpdateUser,
    handleCloseForm,
  };
};

export default useEditUserDialog;
