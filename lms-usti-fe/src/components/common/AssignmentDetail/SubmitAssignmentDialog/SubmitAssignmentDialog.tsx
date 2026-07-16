"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link, Notebook, Pen, UploadIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import AddLinkDialog from "@/components/common/AddLinkDialog/AddLinkDialog";
import FileItem from "@/components/common/FileItem/FileItem";
import LinkItem from "@/components/common/LinkItem/LinkItem";
import { Spinner } from "@/components/ui/spinner";
import { assignmentServices } from "@/services/assignment.service";
import useSubmitAssignmentDialog from "./useSubmitAssignmentDialog";
import type { IMySubmission } from "@/types/Classroom";

dayjs.extend(utc);
dayjs.extend(timezone);

const ViewPdf = dynamic(() => import("@/components/common/ViewPdf/ViewPdf"), {
  ssr: false,
});

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  mySubmission: IMySubmission | null;
  deadline?: string | null;
  lateSubmission?: string;
}

export default function SubmitAssignmentDialog({
  classroomId,
  assignmentId,
  mySubmission,
  deadline,
  lateSubmission,
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
  const hasDeadline = deadline && !deadline.startsWith("0001");
  const isOverdue = !!(hasDeadline && dayjs(deadline).tz("Asia/Jakarta").isBefore(dayjs().tz("Asia/Jakarta")));
  const isSubmissionBlocked = !!(isOverdue && lateSubmission === "not_allowed");

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
            disabled={isPending || currentAttachments.length === 0 || isSubmissionBlocked}
            onClick={handleSubmit}
            className="ml-auto"
            type="button"
          >
            {isPending ? "Mengumpulkan..." : "Kumpulkan"}
          </Button>
        </div>

        {isSubmissionBlocked && (
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Tugas ini sudah melewati batas pengumpulan. Pengumpulan tidak diterima.
              </AlertDescription>
            </Alert>
          </div>
        )}

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
                    className="text-xs sm:text-base"
                    size="sm"
                  >
                    <UploadIcon className="mr-1 size-3 sm:size-4" />
                    Upload
                  </Button>
                  <Button
                    onClick={() => setLinkDialogOpen(true)}
                    type="button"
                    variant="outline"
                    className="text-xs sm:text-base"
                    size="sm"
                  >
                    <Link className="mr-1 size-3 sm:size-4" />
                    Link
                  </Button>
                </div>
              </div>
              <hr className="mt-4" />
            </div>

            {currentAttachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
                {currentAttachments.map((item) =>
                  item.type === "FILE" ? (
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
                  ) : (
                    <LinkItem
                      key={item.id || item.unique_name}
                      linkName={item.name}
                      url={item.url}
                      onDelete={() => handleDeleteAttachment(item)}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="mt-4 text-center text-muted-foreground text-xs sm:text-sm py-8 border border-dashed rounded-lg">
                Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.
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
