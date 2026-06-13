"use client";

import { FileText, Plus, Upload, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import { deleteFileAssignment } from "@/actions/delete-file-assignment";
import { DatePickerTime } from "@/components/ui/calendar-time-picker";

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
    pdfMateriRef,
    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
    arrayOfFiles,
    setArrayOfFiles,
    arrayOfLinks,
    setArrayOfLinks,
  } = useCreateAssignmentDialog();
  console.log(arrayOfFiles);
  return (
    <>
      <Tooltip>
        <TooltipTrigger className="ml-auto" asChild>
          <Button onClick={() => setOpen("open")} type="button" size={"icon"}>
            <Plus />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Buat Tugas</p>
        </TooltipContent>
      </Tooltip>
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
          <div className="text-lg md:text-xl">Buat Tugas</div>
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
            Posting
          </Button>
        </div>
        <Form {...assignmentForm}>
          <form className="space-y-4 max-w-2xl mx-auto mt-4">
            <Card className="max-w-lg mx-auto">
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
                <FormField
                  control={assignmentForm.control}
                  name="attachments"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input
                          {...fieldProps}
                          ref={pdfMateriRef}
                          type="file"
                          id="material_file"
                          accept="application/pdf"
                          onChange={async (e) => {
                            if (
                              e.target &&
                              e.target.files![0].type !== "application/pdf"
                            ) {
                              toast.error("File harus berupa pdf");
                              e.target.value = "";
                              return;
                            }
                            const file = e.target.files![0];
                            await handleUploadFile(file);
                            e.target.value = "";
                          }}
                        />
                      </FormControl>
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
            <Card className="max-w-xl mx-auto relative">
              {isPendingUploadFile ? (
                <div className="bg-slate-600/90 absolute top-0 left-0 right-0 bottom-0 rounded-lg flex justify-center items-center">
                  <Spinner variant="circle" className="text-white" size={60} />
                </div>
              ) : null}
              <CardHeader>
                <div className="font-bold">Lampiran</div>
              </CardHeader>
              <CardContent>
                {arrayOfFiles.length > 0 ? (
                  <Card className="mb-4">
                    <CardHeader>
                      <div>File</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        {arrayOfFiles.map((item) => {
                          const handleDeleteFile = async () => {
                            setIsPending(true);
                            setIsPendingUploadFile(true);
                            try {
                              await deleteFileAssignment(item.unique_name);
                              const newArray = arrayOfFiles.filter(
                                (a) => a.unique_name !== item.unique_name,
                              );
                              setArrayOfFiles(newArray);
                              assignmentForm.setValue("attachments", newArray);
                            } finally {
                              setIsPendingUploadFile(false);
                              setIsPending(false);
                            }
                          };
                          return (
                            <FileItem
                              key={item.unique_name}
                              fileName={item.name}
                              onDelete={handleDeleteFile}
                              isPending={isPending || isPendingUploadFile}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                {arrayOfLinks.length > 0 ? (
                  <Card className="mb-4">
                    <CardHeader>
                      <div>Link</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 ">
                        {arrayOfLinks.map((item, index) => {
                          const handleDeleteLink = () => {
                            const newArray = arrayOfLinks.filter((_, i) => i !== index);
                            setArrayOfLinks(newArray);
                            assignmentForm.setValue("attachments", newArray);
                          };
                          return (
                            <LinkItem
                              key={index}
                              linkName={item.name}
                              onDelete={handleDeleteLink}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col gap-2 items-center font-semibold text-sm">
                    <Button
                      onClick={() => pdfMateriRef.current?.click()}
                      type="button"
                      size={"icon"}
                    >
                      <Upload />
                    </Button>
                    Upload
                  </div>
                  <AddLinkDialog
                    attachments={arrayOfLinks}
                    setAttachments={setArrayOfLinks}
                    setValue={assignmentForm.setValue}
                  />
                </div>
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
    </>
  );
}
