"use client";

import { Link } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateUuid, isValidUrl } from "@/lib/utils";
import type { IAttachment } from "@/types/Classroom";

export default function AddLinkDialog({
  setValue,
  attachments,
  setAttachments,
}: {
  setValue: UseFormSetValue<any>;
  attachments: IAttachment[];
  setAttachments: Dispatch<SetStateAction<IAttachment[]>>;
}) {
  const [linkName, setLinkName] = useState("");
  const [linkString, setLinkString] = useState("https://www.");
  const [open, setOpen] = useState(false);

  const handleAddLink = () => {
    if (!isValidUrl(linkString)) {
      toast.error("Link tidak valid");
      return;
    }
    const newLink: IAttachment = {
      id: generateUuid(),
      name: linkName,
      url: linkString,
      type: "LINK",
      unique_name: "",
    };
    const newArray = [...attachments, newLink];
    setAttachments(newArray);
    setValue("attachments", newArray);
    setLinkString("https://www.");
    setLinkName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col gap-2 items-center font-semibold text-sm">
          <Button type="button" size={"icon"}>
            <Link />
          </Button>
          Link
        </div>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const input = document.getElementById(
            "link-string",
          ) as HTMLInputElement;
          if (input) {
            const end = input.value.length;
            input.focus();
            input.setSelectionRange(end, end);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload Link</DialogTitle>
          <DialogDescription>
            Tambahkan link yang ingin diupload.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="link-string">Nama Link</Label>
            <Input
              id="link-string"
              type="text"
              value={linkName}
              onChange={(e) => {
                setLinkName(e.target.value);
              }}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="link-string">Link Url</Label>
            <Input
              id="link-string"
              type="text"
              value={linkString}
              onChange={(e) => {
                setLinkString(e.target.value);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => setLinkString("https://www.")}
              variant="outline"
            >
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleAddLink} type="button">
            Tambah Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
