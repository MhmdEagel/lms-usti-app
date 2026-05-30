import { FileText, X } from "lucide-react";
import { useId, type Dispatch, type SetStateAction } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { IFileMaterial } from "@/types/Classroom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { deleteFileMaterial } from "@/actions/delete-file-material";
import { z } from "zod";
import { newMaterialSchema } from "@/schemas/schemas";

export default function FileItem({
  fileName,
  uniqueFileName,
  arrayOfFiles,
  setArrayOfFiles,
  setValue,
  setIsPending,
  setIsPendingUploadFile,
}: {
  fileName: string;
  uniqueFileName: string;
  arrayOfFiles: IFileMaterial[];
  setArrayOfFiles: Dispatch<React.SetStateAction<IFileMaterial[]>>;
  setValue: UseFormSetValue<z.infer<typeof newMaterialSchema>>;
  setIsPending: Dispatch<SetStateAction<boolean>>;
  setIsPendingUploadFile: Dispatch<SetStateAction<boolean>>;
}) {
  const handleDelete = async (unique_file_name: string) => {
    const newArray = arrayOfFiles.filter(
      (item) => item.unique_file_name != unique_file_name,
    );
    const file = arrayOfFiles.find(
      (item) => item.unique_file_name === unique_file_name,
    );
    try {
      setIsPending(true);
      setIsPendingUploadFile(true);
      await deleteFileMaterial(file?.unique_file_name!);
      toast.success("File berhasil dihapus");
      setArrayOfFiles(newArray);
      setValue("files", newArray);
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
