"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Link, Notebook, Pen, Plus, UploadIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import { Spinner } from "@/components/ui/spinner";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import { assignmentServices } from "@/services/assignment.service";
import useSubmitAssignmentDialog from "./useSubmitAssignmentDialog";
import type { IMySubmission } from "@/types/Classroom";

const ViewPdf = dynamic(() => import("@/components/common/ViewPdf/ViewPdf"), {
  ssr: false,
});

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  mySubmission: IMySubmission | null;
}

export default function SubmitAssignmentDialog({
  classroomId,
  assignmentId,
  mySubmission,
}: PropTypes) {
  const router = useRouter();
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const {
    open,
    setOpen,
    trackedAttachments,
    currentAttachments,
    setAttachments,
    isPending,
    setIsPending,
    isPendingUploadFile,
    linkDialogOpen,
    setLinkDialogOpen,
    fileInputRef,
    handleDeleteAttachment,
    handleUploadFile,
    handleFileInputChange,
    handleClose,
  } = useSubmitAssignmentDialog(mySubmission);

  const hasSubmission = mySubmission?.status === "submitted";

  const handleSubmit = async () => {
    setIsPending(true);
    const active = currentAttachments.map((a) => ({
      name: a.name,
      type: a.type,
      url: a.url,
      unique_name: a.unique_name,
    }));
    try {
      await assignmentServices.createSubmission(classroomId, assignmentId, { attachments: active });
      toast.success("Tugas berhasil dikumpulkan");
      await handleClose();
      router.refresh();
    } catch {
      toast.error("Gagal mengumpulkan tugas");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant="outline">
        {}
        {hasSubmission ? (
          <>
            <Pen /> Edit Pengumpulan
          </>
        ) : (
          <>
            <Notebook /> Unggah Tugas
          </>
        )}
      </Button>
      <div
        data-state={open ? "open" : "closed"}
        className="fixed z-50 inset-0 bg-white p-4 space-y-4 opacity-0 pointer-events-none data-[state=open]:opacity-100 data-[state=open]:pointer-events-auto data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out overflow-y-auto duration-300 transition-opacity"
      >
        <div className="sticky top-0 left-0 right-0 z-60 bg-white px-4 flex items-center gap-4 border-b-[3px] pb-4">
          <Button onClick={handleClose} type="button" variant="secondary">
            <X />
          </Button>
          <div>
            <div className="text-lg md:text-xl font-bold">Kumpulkan Tugas</div>
            <div>Unggah file atau tambahkan link referensi tugas</div>
          </div>
          <Button
            disabled={isPending || currentAttachments.length === 0}
            onClick={handleSubmit}
            className="ml-auto"
            type="button"
          >
            {isPending ? "Mengumpulkan..." : "Kumpulkan"}
          </Button>
        </div>

        <Card className="relative max-w-3xl mx-auto mt-4">
          {isPendingUploadFile ? (
            <div className="bg-slate-600/90 absolute top-0 left-0 right-0 bottom-0 rounded-lg flex justify-center items-center z-10">
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
                  size="icon"
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

            {currentAttachments.filter((a) => a.type === "FILE").length ===
              0 && (
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

            {currentAttachments.filter((a) => a.type === "FILE").length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {currentAttachments
                  .filter((a) => a.type === "FILE")
                  .map((item) => (
                    <FileItem
                      key={item.unique_name}
                      fileName={item.name}
                      onDelete={() => handleDeleteAttachment(item)}
                      isPending={isPending || isPendingUploadFile}
                      fileUrl={item.url}
                      onClick={() =>
                        setPreviewFile({ url: item.url, name: item.name })
                      }
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
                  size="icon"
                  variant="outline"
                >
                  <Plus />
                </Button>
              </div>
              <hr className="mt-4" />
            </div>

            {currentAttachments.filter((a) => a.type === "LINK").length ===
              0 && (
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

            {currentAttachments.filter((a) => a.type === "LINK").length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {currentAttachments
                  .filter((a) => a.type === "LINK")
                  .map((item) => (
                    <LinkItem
                      key={item.id || item.unique_name}
                      linkName={item.name}
                      url={item.url}
                      onDelete={() => handleDeleteAttachment(item)}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddLinkDialog
          open={linkDialogOpen}
          setOpen={setLinkDialogOpen}
          attachments={currentAttachments}
          setAttachments={setAttachments}
          setValue={() => {}}
        />
      </div>
      {previewFile && (
        <ViewPdf
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}
