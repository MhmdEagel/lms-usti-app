import { extractErrorMessage } from "@/lib/error";
import { broadcastMessageSchema } from "@/schemas/schemas";
import { classroomServices } from "@/services/classroom.service";
import { IBroadcastMessage } from "@/types/Classroom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const useBroadcastMessage = () => {
  const router = useRouter();
  const form = useForm<IBroadcastMessage>({
    resolver: zodResolver(broadcastMessageSchema),
  });

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const handleBroadcast = async (
    data: IBroadcastMessage,
    classroomId: string,
  ) => {
    setIsPending(true);
    try {
      const response = await classroomServices.broadcastMessage(classroomId, data);
      const recipientCount = response.data?.data?.recipient_count;
      toast.success(
        typeof recipientCount === "number" && recipientCount > 0
          ? `Broadcast terkirim ke ${recipientCount} mahasiswa`
          : "Broadcast berhasil dikirim",
      );
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return {
    form,
    open,
    handleOpen,
    handleClose,
    handleBroadcast,
    isPending,
  };
};

export default useBroadcastMessage;
