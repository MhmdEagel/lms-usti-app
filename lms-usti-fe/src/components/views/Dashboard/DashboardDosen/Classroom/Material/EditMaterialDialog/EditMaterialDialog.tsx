"use client";

import { Book, Link, UploadIcon, X } from "lucide-react";
import { useState, useRef } from "react";
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
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import ViewPdf from "@/components/common/ViewPdf/ViewPdf";
import useEditMaterialDialog, { type TrackedAttachment } from "./useEditMaterialDialog";
import { Spinner } from "@/components/ui/spinner";
import type { IAttachment, IMaterial } from "@/types/Classroom";
import { Dispatch, SetStateAction, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

interface PropTypes {
  open: string;
  setOpen: Dispatch<SetStateAction<string>>;
  classroomId: string;
  material: IMaterial;
}

const ContentEditor = dynamic(() => import("@/components/ui/content-editor"), {
  ssr: false,
});

export default function EditMaterialDialog(props: PropTypes) {
  const {
    trackedAttachments,
    setTrackedAttachments,
    isPending,
    isPendingUploadFile,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    handleDeleteFile,
    handleClose,
    initializeAttachments,
  } = useEditMaterialDialog();
  const { open, setOpen, material, classroomId } = props;
  const [previewFile, setPreviewFile] = useState<IAttachment | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setAttachments: Dispatch<SetStateAction<IAttachment[]>> = useCallback(
    (value) => {
      setTrackedAttachments((prev) => {
        if (typeof value === "function") {
          return value(prev) as TrackedAttachment[];
        }
        return value as TrackedAttachment[];
      });
    },
    [setTrackedAttachments],
  );

  useEffect(() => {
    if (material.attachments && material.attachments.length > 0) {
      initializeAttachments(material.attachments);
    }
  }, [material]);

  const currentAttachments = trackedAttachments.filter(
    (f) => f.status !== "deleted",
  );

  const handleDeleteAttachment = async (item: IAttachment) => {
    if (item.type === "FILE") {
      handleDeleteFile(item.unique_name);
    } else {
      setTrackedAttachments((prev) =>
        prev.filter((a) => a.id !== item.id),
      );
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
      <div
        data-state={open}
        className="
        fixed inset-0 z-[9999] bg-white
        opacity-0 pointer-events-none
        data-[state=open]:opacity-100
        data-[state=open]:pointer-events-auto
        overflow-y-auto flex flex-col
        "
      >
        <div className="sticky top-0 z-10 bg-white px-4 flex items-center gap-4 border-b-[3px] pb-4 shrink-0">
          <Button
            onClick={() => handleClose(setOpen)}
            type="button"
            variant={"secondary"}
          >
            <X />
          </Button>
          <Book />
          <div>
            <div className="text-lg md:text-xl font-bold">Edit Materi</div>
            <div>Silahkan edit form di bawah ini</div>
          </div>
          <Button
            disabled={isPending}
            type="button"
            onClick={() =>
              materialForm.handleSubmit((data) =>
                handleMaterialForm(data, classroomId, material.id, setOpen),
              )()
            }
            className="ml-auto"
          >
            Simpan
          </Button>
        </div>
        <div className="flex-1 px-4">
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
                    defaultValue={material.title}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Judul materi..."
                            {...field}
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
                          <ContentEditor
                            className="min-h-32"
                            placeholder="Masukkan deskripsi..."
                            defaultValue={material.description}
                            onChange={field.onChange}
                            isInvalid={!!fieldState.error}
                          />
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
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf,application/msword,application/vnd.ms-powerpoint,video/*"
                          className="hidden"
                          multiple
                          onChange={handleFileInputChange}
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                          variant="outline"
                          size="sm"
                        >
                          <UploadIcon className="mr-1 size-4" />
                          Upload
                        </Button>
                        <Button
                          onClick={() => setLinkDialogOpen(true)}
                          type="button"
                          variant="outline"
                          size="sm"
                        >
                          <Link className="mr-1 size-4" />
                          Link
                        </Button>
                      </div>
                    </div>
                    <hr className="mt-4" />
                  </div>

                  {currentAttachments.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {currentAttachments.map((item) =>
                        item.type === "FILE" ? (
                          <FileItem
                            key={item.unique_name}
                            fileName={item.name}
                            onDelete={() => handleDeleteAttachment(item)}
                            isPending={isPending || isPendingUploadFile}
                            fileUrl={item.url}
                            onClick={() => setPreviewFile(item)}
                          />
                        ) : (
                          <LinkItem
                            key={item.id}
                            linkName={item.name}
                            url={item.url}
                            onDelete={() => handleDeleteAttachment(item)}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-8 border border-dashed rounded-lg">
                      Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
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
        attachments={trackedAttachments}
        setAttachments={setAttachments}
        setValue={materialForm.setValue}
      />
    </>
  );
}
