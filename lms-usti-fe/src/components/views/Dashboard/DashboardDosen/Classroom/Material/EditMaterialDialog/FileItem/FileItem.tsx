import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FileStatus = "original" | "new" | "deleted";

interface FileItemProps {
  fileName: string;
  uniqueFileName: string;
  fileUrl?: string;
  fileStatus?: FileStatus;
  onDelete: (uniqueFileName: string) => Promise<void>;
  isPending?: boolean;
}

export default function FileItem({
  fileName,
  uniqueFileName,
  fileStatus = "original",
  onDelete,
  isPending = false,
}: FileItemProps) {
  const handleDelete = async () => {
    try {
      await onDelete(uniqueFileName);
      toast.success("File berhasil dihapus");
    } catch {
      toast.error("File gagal dihapus");
    }
  };

  return (
    <div className="p-4 border rounded-lg flex">
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-gray-600 p-2">
          <FileText size={"24"} color="white" />
        </div>
        <span className="text-sm truncate max-w-[200px]">{fileName}</span>
      </div>
      <Button
        onClick={handleDelete}
        type="button"
        variant={"ghost"}
        className="rounded-full cursor-pointer ml-auto"
        disabled={isPending}
      >
        <X />
      </Button>
    </div>
  );
}