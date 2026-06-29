import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ISubmission, ISubmissionDetail } from "@/types/Classroom";
import { Skeleton } from "@/components/ui/skeleton";
import { File, LinkIcon } from "lucide-react";
import { getFileExtension, getFileName } from "@/lib/utils";
import Link from "next/link";

interface PropTypes {
  selectedSubmission: ISubmission | null;
  submissionDetail: ISubmissionDetail | null;
  loadingDetail: boolean;
}

export default function AttachmentCard({
  selectedSubmission,
  submissionDetail,
  loadingDetail,
}: PropTypes) {
  if (!selectedSubmission) {
    return (
      <Card>
        <CardHeader className="border-b-2 pb-2">
          <div className="text-base md:text-xl font-bold">Unggahan</div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Silahkan pilih mahasiswa
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingDetail) {
    return (
      <Card>
        <CardHeader className="border-b-2 pb-2">
          <div className="text-base md:text-xl font-bold">Unggahan</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const attachments = submissionDetail?.attachments || [];

  const fileAttachments = attachments.filter(
    (a) => a.type === "FILE" || a.type === "VIDEO",
  );
  const linkAttachments = attachments.filter((a) => a.type === "LINK");

  if (attachments.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b-2 pb-2">
          <div className="text-base md:text-xl font-bold">Unggahan</div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Belum ada unggahan
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">Unggahan</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fileAttachments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fileAttachments.map((attachment, idx) => (
              <Link
                key={idx}
                href={attachment.url}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="p-2 bg-accent rounded-full">
                  <File className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {getFileName(attachment.name)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getFileExtension(attachment.url).toUpperCase()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {linkAttachments.length > 0 && (
          <div>
            <div className="font-bold text-gray-500 text-xs mb-2">LINK</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkAttachments.map((attachment, idx) => (
                <Link
                  key={idx}
                  href={attachment.url}
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 bg-accent rounded-full">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {attachment.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {attachment.url}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
