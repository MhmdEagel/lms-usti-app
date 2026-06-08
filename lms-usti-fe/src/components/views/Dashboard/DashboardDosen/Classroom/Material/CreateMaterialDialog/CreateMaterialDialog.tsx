"use client";

import { Book, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
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
import ContentEditor from "@/components/ui/content-editor";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import useCreateMaterialDialog from "./useCreateMaterialDialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteFileMaterial } from "@/actions/delete-file-material";
export default function CreateMaterialDialog({
  classroomId,
}: {
  classroomId: string;
}) {
  const {
    open,
    setOpen,
    arrayOfFiles: arrayOfAttachments,
    setArrayOfFiles: setArrayOfAttachments,
    arrayOfLinks: linkAttachments,
    setArrayOfLinks: setLinkAttachments,
    isPending,
    isPendingUploadFile,
    pdfMateriRef,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    setIsPending,
    setIsPendingUploadFile,
    handleClose,
  } = useCreateMaterialDialog();
  return (
    <>
      <Tooltip>
        <TooltipTrigger className="ml-auto" asChild>
          <Button onClick={() => setOpen("open")} type="button" size={"icon"}>
            <Plus />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Buat Materi</p>
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
          <Book />
          <div className="text-lg md:text-xl">Buat Materi</div>
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
            Posting
          </Button>
        </div>
        <Form {...materialForm}>
          <form
            className="space-y-4 max-w-xl mx-auto mt-4"
            encType="multipart/form-data"
          >
            <Card className="max-w-lg mx-auto">
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
                <FormField
                  control={materialForm.control}
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
                {arrayOfAttachments.filter(a => a.type === "FILE" || a.type === "VIDEO").length > 0 ? (
                  <Card className="mb-4">
                    <CardHeader>
                      <div>File</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        {arrayOfAttachments.filter(a => a.type === "FILE" || a.type === "VIDEO").map((item) => {
                          const handleDeleteFile = async () => {
                            const newArray = arrayOfAttachments.filter(
                              (a) => a.unique_name !== item.unique_name,
                            );
                            setIsPending(true);
                            setIsPendingUploadFile(true);
                            try {
                              await deleteFileMaterial(item.unique_name);
                              setArrayOfAttachments(newArray);
                              materialForm.setValue("attachments", newArray);
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
                {linkAttachments.filter(a => a.type === "LINK").length > 0 ? (
                  <Card className="mb-4">
                    <CardHeader>
                      <div>Link</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 ">
                        {linkAttachments.filter(a => a.type === "LINK").map((item, index) => {
                          const handleDeleteLink = () => {
                            const newArray = linkAttachments.filter((_, i) => i !== index);
                            setLinkAttachments(newArray);
                            materialForm.setValue("attachments", newArray);
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
                    attachments={linkAttachments}
                    setAttachments={setLinkAttachments}
                    setValue={materialForm.setValue}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </>
  );
}
