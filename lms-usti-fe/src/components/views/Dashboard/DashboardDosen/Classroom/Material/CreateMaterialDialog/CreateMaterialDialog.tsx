"use client";

import { Book, Link, Plus, UploadIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ContentEditor from "@/components/ui/content-editor";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import useCreateMaterialDialog from "./useCreateMaterialDialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteFileMaterial } from "@/actions/delete-file-material";
import type { IAttachment } from "@/types/Classroom";
import dynamic from "next/dynamic";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";

const ViewPdf = dynamic(() => import("@/components/common/ViewPdf/ViewPdf"), {
  ssr: false,
});

export default function CreateMaterialDialog({
  classroomId,
}: {
  classroomId: string;
}) {
  const {
    open,
    setOpen,
    attachments,
    setAttachments,
    isPending,
    isPendingUploadFile,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    setIsPending,
    setIsPendingUploadFile,
    handleClose,
  } = useCreateMaterialDialog();
  const [previewFile, setPreviewFile] = useState<IAttachment | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteAttachment = async (item: IAttachment) => {
    if (item.type === "FILE") {
      setIsPending(true);
      setIsPendingUploadFile(true);
      try {
        await deleteFileMaterial(item.unique_name);
        setAttachments((prev) =>
          prev.filter((a) => a.unique_name !== item.unique_name),
        );
      } finally {
        setIsPendingUploadFile(false);
        setIsPending(false);
      }
    } else {
      setAttachments((prev) => prev.filter((a) => a.id !== item.id));
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await handleUploadFile(file);
      }
      e.target.value = "";
    }
  };

  return (
    <>
      <Button onClick={() => setOpen("open")} type="button">
        <Plus /> Tambah Materi
      </Button>
      <div
        data-state={open}
        className="
        fixed 
        z-50 inset-0
        bg-white p-4 space-y-4 

        opacity-0 pointer-events-none

        data-[state=open]:opacity-100
        data-[state=open]:pointer-events-auto

        data-[state=open]:animate-in 
        data-[state=open]:fade-in

        data-[state=closed]:animate-out 
        data-[state=closed]:fade-out 

        overflow-y-auto duration-300 transition-opacity
        "
      >
        <div className="sticky top-0 left-0 right-0 z-60 bg-white px-4 flex items-center gap-4 border-b-[3px] pb-4">
          <Button
            onClick={() => handleClose()}
            type="button"
            variant={"secondary"}
          >
            <X />
          </Button>
          <Book />
          <div>
            <div className="text-lg md:text-xl font-bold">Buat Materi</div>
            <div>Silahkan isi form di bawah ini untuk membuat materi</div>
          </div>
          <Button
            disabled={isPending}
            type="button"
            onClick={() =>
              materialForm.handleSubmit((data) =>
                handleMaterialForm(data, classroomId),
              )()
            }
            className="ml-auto"
          >
            Simpan
          </Button>
        </div>
        <Form {...materialForm}>
          <form
            className="space-y-4 max-w-3xl mx-auto mt-4"
            encType="multipart/form-data"
          >
            <Card>
              <CardHeader>
                <div className="font-bold">Detail Kelas</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={materialForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="Judul materi..."
                          {...field}
                          value={field.value ?? ""}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={materialForm.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Deskripsi (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ContentEditor
                            className="min-h-32"
                            placeholder="Masukkan deskripsi..."
                            onChange={field.onChange}
                            isInvalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card className="relative">
              {isPendingUploadFile ? (
                <div className="bg-slate-600/90 absolute top-0 left-0 right-0 bottom-0 rounded-lg flex justify-center items-center">
                  <Spinner variant="circle" className="text-white" size={60} />
                </div>
              ) : null}

              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">Lampiran</div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      size={"icon"}
                      variant="outline"
                    >
                      <Plus />
                    </Button>
                  </div>
                  <hr className="mt-4" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.ms-powerpoint,video/*"
                  className="hidden"
                  multiple
                  onChange={handleFileInputChange}
                />

                {attachments.filter(
                  (a) => a.type === "FILE",
                ).length === 0 && (
                  <Dropzone
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc", ".docx"],
                      "application/vnd.ms-powerpoint": [".ppt", ".pptx"],
                      "video/*": [".mp4", ".mov", ".avi"],
                    }}
                    maxFiles={5}
                    onDrop={async (files) => {
                      for (const file of files) {
                        await handleUploadFile(file);
                      }
                    }}
                    onError={(error) => toast.error(error.message)}
                  >
                    <DropzoneEmptyState>
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <UploadIcon size={16} />
                      </div>
                      <p className="my-2 w-full truncate font-medium text-sm">
                        Unggah file
                      </p>
                      <p className="w-full truncate text-muted-foreground text-xs">
                        Seret dan lepas atau klik untuk mengunggah
                      </p>
                    </DropzoneEmptyState>
                  </Dropzone>
                )}

                {attachments.filter(
                  (a) => a.type === "FILE",
                ).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {attachments
                      .filter((a) => a.type === "FILE")
                      .map((item) => (
                        <FileItem
                          key={item.unique_name}
                          fileName={item.name}
                          onDelete={() => handleDeleteAttachment(item)}
                          isPending={isPending || isPendingUploadFile}
                          fileUrl={item.url}
                          onClick={() => setPreviewFile(item)}
                        />
                      ))}
                  </div>
                )}
                <div className="mt-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">Link Referensi</div>
                    <Button
                      onClick={() => setLinkDialogOpen(true)}
                      type="button"
                      size={"icon"}
                      variant="outline"
                    >
                      <Plus />
                    </Button>
                  </div>
                  <hr className="mt-4" />
                </div>
                {attachments.filter((a) => a.type === "LINK").length === 0 && (
                  <Button
                    onClick={() => setLinkDialogOpen(true)}
                    type="button"
                    variant="outline"
                    className="relative h-auto w-full flex-col overflow-hidden p-8"
                  >
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Link size={16} />
                    </div>
                    <p className="my-2 w-full truncate font-medium text-sm">
                      Tambah Link
                    </p>
                  </Button>
                )}

                {attachments.filter((a) => a.type === "LINK").length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {attachments
                      .filter((a) => a.type === "LINK")
                      .map((item) => (
                        <LinkItem
                          key={item.id}
                          linkName={item.name}
                          url={item.url}
                          onDelete={() => handleDeleteAttachment(item)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
      {previewFile && (
        <ViewPdf
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
      <AddLinkDialog
        open={linkDialogOpen}
        setOpen={setLinkDialogOpen}
        attachments={attachments}
        setAttachments={setAttachments}
        setValue={materialForm.setValue}
      />
    </>
  );
}
