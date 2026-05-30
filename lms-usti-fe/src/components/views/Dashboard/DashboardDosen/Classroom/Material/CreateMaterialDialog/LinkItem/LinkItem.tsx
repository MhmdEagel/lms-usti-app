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
  index,
}: {
  linkName: string;
  arrayOfLinks: ILinkMaterial[];
  setArrayOfLinks: Dispatch<React.SetStateAction<ILinkMaterial[]>>;
  setValue: UseFormSetValue<INewMaterial>;
  index: number;
}) {
  const handleDelete = (index: number) => {
    const newArray = arrayOfLinks.splice(0, index);
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
        onClick={() => handleDelete(index)}
        type="button"
        variant={"ghost"}
        className="rounded-full cursor-pointer ml-auto "
      >
        <X />
      </Button>
    </div>
  );
}
