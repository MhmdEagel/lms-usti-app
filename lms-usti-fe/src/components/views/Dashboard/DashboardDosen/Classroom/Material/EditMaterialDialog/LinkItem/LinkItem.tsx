import { FileText, X } from "lucide-react";
import type { Dispatch } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { ILinkMaterial, INewMaterial } from "@/types/Classroom";

export default function LinkItem({
  linkName,
  arrayOfLinks,
  setArrayOfLinks,
  setValue,
  id,
}: {
  linkName: string;
  arrayOfLinks: ILinkMaterial[];
  setArrayOfLinks: Dispatch<React.SetStateAction<ILinkMaterial[]>>;
  setValue: UseFormSetValue<INewMaterial>;
  id: string | null | undefined;
}) {
  const handleDelete = (id: string | null | undefined) => {
    const newArray = arrayOfLinks.filter((item) => item.id !== id);
    setArrayOfLinks(newArray);
    setValue("links", newArray);
  };
  return (
    <div className="p-4 border rounded-lg flex">
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-gray-600 p-2">
          <FileText size={"24"} color="white" />
        </div>
        {linkName}
      </div>
      <Button
        onClick={() => handleDelete(id)}
        type="button"
        variant={"ghost"}
        className="rounded-full cursor-pointer ml-auto "
      >
        <X />
      </Button>
    </div>
  );
}
