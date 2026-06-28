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
import RubrikItem from "../RubrikItem/RubrikItem";
import useCreateAssignmentDialog from "./useCreateAssignmentDialog";
import { Label } from "@/components/ui/label";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import { deleteFileAssignment } from "@/actions/delete-file-assignment";
import { DatePickerTime } from "@/components/ui/calendar-time-picker";
import { Spinner } from "@/components/ui/spinner";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
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
    arrayOfRubrics,
    setArrayOfRubrics,
    isPending,
    setIsPending,
    handleAddRubric,
    handleAssignmentForm,
    assignmentForm,
    handleClose,
    rubricName,
    rubricValue,
    setRubricName,
    setRubricValue,
    totalScore,
    canAddRubric,
    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
  } = useCreateAssignmentDialog();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteAttachment = async (item: IAttachment) => {
    if (item.type === "FILE" || item.type === "VIDEO") {
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
          <FileText />
          <div>
            <div className="text-lg md:text-xl font-bold">Buat Tugas</div>
            <div>Silahkan isi form di bawah ini untuk membuat tugas</div>
          </div>
          <Button
            disabled={isPending}
            type="button"
            onClick={() =>
              assignmentForm.handleSubmit((data) =>
                handleAssignmentForm(data, classroomId),
              )()
            }
            className="ml-auto"
          >
            Simpan
          </Button>
        </div>
        <Form {...assignmentForm}>
          <form className="space-y-4 max-w-3xl mx-auto mt-4">
            <Card>
              <CardHeader>
                <div className="font-bold">Detail Tugas</div>
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
                            value={field.value}
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
                  (a) => a.type === "FILE" || a.type === "VIDEO",
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
                  (a) => a.type === "FILE" || a.type === "VIDEO",
                ).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {attachments
                      .filter((a) => a.type === "FILE" || a.type === "VIDEO")
                      .map((item) => (
                        <FileItem
                          key={item.unique_name}
                          fileName={item.name}
                          onDelete={() => handleDeleteAttachment(item)}
                          isPending={isPending || isPendingUploadFile}
                          fileUrl={item.url}
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
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {attachments
                      .filter((a) => a.type === "LINK")
                      .map((item) => (
                        <LinkItem
                          key={item.id}
                          linkName={item.name}
                          onDelete={() => handleDeleteAttachment(item)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="mx-auto p-2 rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="font-bold">Rubrik Penilaian</div>
                  <div className="text-sm text-gray-500">
                    Total: {totalScore}/100
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-4 items-end">
                  <div className="grid gap-2">
                    <Label>Nama</Label>
                    <Input
                      value={rubricName}
                      onChange={(e) => setRubricName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nilai</Label>
                    <Input
                      value={rubricValue}
                      onChange={(e) => setRubricValue(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddRubric(rubricName, rubricValue)}
                    disabled={!canAddRubric || !rubricName || !rubricValue}
                  >
                    Tambah Rubrik
                  </Button>
                </div>
                {arrayOfRubrics.length > 0 ? (
                  <div className="grid grid-cols-3">
                    {arrayOfRubrics.map((rubric, index) => (
                      <RubrikItem
                        key={index}
                        index={index}
                        name={rubric.name}
                        score={rubric.score}
                        arrayOfRubrics={arrayOfRubrics}
                        setArrayOfRubrics={setArrayOfRubrics}
                      />
                    ))}
                  </div>
                ) : null}
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
