"use client";

import { FileText, Link, Plus, UploadIcon, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import ContentEditor from "@/components/ui/content-editor";
import useCreateAssignmentDialog from "./useCreateAssignmentDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import { deleteFileAssignment } from "@/actions/delete-file-assignment";
import { DatePickerTime } from "@/components/ui/calendar-time-picker";
import { Spinner } from "@/components/ui/spinner";
import type { IAttachment } from "@/types/Classroom";

export default function CreateAssignmentDialog({
  classroomId,
}: {
  classroomId: string;
}) {
  const {
    open,
    setOpen,
    hasDeadline,
    setHasDeadline,
    attachments,
    setAttachments,
    isPending,
    setIsPending,
    handleAssignmentForm,
    assignmentForm,
    handleClose,
    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
  } = useCreateAssignmentDialog();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteAttachment = async (item: IAttachment) => {
    if (item.type === "FILE") {
      setIsPending(true);
      setIsPendingUploadFile(true);
      try {
        await deleteFileAssignment(item.unique_name);
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
        <Plus /> Tambah Tugas
      </Button>
      <div
        data-state={open}
        className="
        fixed 
        z-50 inset-0
        bg-white pt-16 px-4
 
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
        <div className="fixed top-0 left-0 right-0 z-60 bg-white p-4 flex items-center gap-2 sm:gap-4 border-b-[3px]">
          <Button
            onClick={() => handleClose()}
            type="button"
            variant={"secondary"}
            size="icon"
            className="size-8 md:size-9"
          >
            <X />
          </Button>
          <FileText className="size-5 sm:size-6" />
          <div>
            <div className="text-base sm:text-lg md:text-xl font-bold">Buat Tugas</div>
            
          </div>
          <Button
            disabled={isPending}
            type="button"
            onClick={() =>
              assignmentForm.handleSubmit((data) =>
                handleAssignmentForm(data, classroomId),
              )()
            }
            size="sm"
            className="ml-auto"
          >
            Simpan
          </Button>
        </div>
        <Form {...assignmentForm}>
          <form className="space-y-4 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="font-bold text-sm sm:text-base">Detail Tugas</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={assignmentForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          placeholder="Judul tugas..."
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
                  control={assignmentForm.control}
                  name="instruction"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Instruksi</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ContentEditor
                            className="min-h-32"
                            placeholder="Masukkan instruksi..."
                            onChange={field.onChange}
                            isInvalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormLabel>Tenggat Waktu</FormLabel>
                  <Switch
                    checked={hasDeadline}
                    onCheckedChange={setHasDeadline}
                  />
                </div>
                {hasDeadline && (
                  <FormField
                    control={assignmentForm.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DatePickerTime
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                    <div className="font-bold text-sm sm:text-base">Lampiran</div>
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
                        className="text-xs sm:text-base"
                      >
                        <UploadIcon className="mr-1 size-3 sm:size-4" />
                        Upload
                      </Button>
                      <Button
                        onClick={() => setLinkDialogOpen(true)}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-base"
                      >
                        <Link className="mr-1 size-3 sm:size-4" />
                        Link
                      </Button>
                    </div>
                  </div>
                  <hr className="mt-4" />
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
                    {attachments.map((item) =>
                      item.type === "FILE" ? (
                        <FileItem
                          key={item.unique_name}
                          fileName={item.name}
                          onDelete={() => handleDeleteAttachment(item)}
                          isPending={isPending || isPendingUploadFile}
                          fileUrl={item.url}
                        />
                      ) : (
                        <LinkItem
                          key={item.id}
                          url={item.url}
                          linkName={item.name}
                          onDelete={() => handleDeleteAttachment(item)}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-xs sm:text-sm py-8 border border-dashed rounded-lg">
                    Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
      <AddLinkDialog
        open={linkDialogOpen}
        setOpen={setLinkDialogOpen}
        attachments={attachments}
        setAttachments={setAttachments}
        setValue={assignmentForm.setValue}
      />
    </>
  );
}
