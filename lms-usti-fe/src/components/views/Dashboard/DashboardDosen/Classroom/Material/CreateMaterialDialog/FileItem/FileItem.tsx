import { FileText, X } from "lucide-react";
import { useId, type Dispatch, type SetStateAction } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { IAttachment } from "@/types/Classroom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { deleteFileMaterial } from "@/actions/delete-file-material";
import { z } from "zod";
import { newMaterialSchema } from "@/schemas/schemas";

export default function FileItem({
  fileName,
  uniqueFileName,
  arrayOfAttachments,
  setArrayOfAttachments,
  setValue,
  setIsPending,
  setIsPendingUploadFile,
}: {
  fileName: string;
  uniqueFileName: string;
  arrayOfAttachments: IAttachment[];
  setArrayOfAttachments: Dispatch<React.SetStateAction<IAttachment[]>>;
  setValue: UseFormSetValue<z.infer<typeof newMaterialSchema>>;
  setIsPending: Dispatch<SetStateAction<boolean>>;
  setIsPendingUploadFile: Dispatch<SetStateAction<boolean>>;
}) {
  const handleDelete = async (unique_file_name: string) => {
    const newArray = arrayOfAttachments.filter(
      (item) => item.unique_name != unique_file_name,
    );
    const file = arrayOfAttachments.find(
      (item) => item.unique_name === unique_file_name,
    );
    try {
      setIsPending(true);
      setIsPendingUploadFile(true);
      await deleteFileMaterial(file?.unique_name!);
      toast.success("File berhasil dihapus");
      setArrayOfAttachments(newArray);
      setValue("attachments", newArray);
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      console.log(err.response?.data);
      toast.error("File gagal dihapus");
    } finally {
      setIsPendingUploadFile(false);
      setIsPending(false);
    }
  };
  return (
    <div className="p-4 border rounded-lg flex">
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-gray-600 p-2">
          <FileText size={"24"} color="white" />
        </div>
        {fileName}
      </div>
      <Button
        onClick={() => handleDelete(uniqueFileName)}
        type="button"
        variant={"ghost"}
        className="rounded-full cursor-pointer ml-auto "
      >
        <X />
      </Button>
    </div>
  );
}
