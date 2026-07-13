import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "@/schemas/admin";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import adminServices from "@/services/admin.service";
import { useRouter } from "next/navigation";
import { z } from "zod";

type UseEditUserDialogProps = {
  id: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const useEditUserDialog = ({ id, isOpen, setIsOpen, onSuccess }: UseEditUserDialogProps) => {
  const router = useRouter();
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
        const res = await adminServices.getUserById(id);
        const user = res.data.data as IUser;
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
      const res = await adminServices.updateUser(id, data);
      if (res.data.meta?.status === 200) {
        handleCloseForm();
        onSuccess?.();
        router.refresh();
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
