import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { getCurrentUser } from "@/lib/auth";
import { FileText } from "lucide-react";
import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment } from "@/types/Classroom";
import AssignmentAttachmentSection from "@/components/common/AssignmentDetail/AssignmentAttachmentSection";
import AssignmentRubricSection from "@/components/common/AssignmentDetail/AssignmentRubricSection";
import LinkMaterialItem from "@/components/common/MaterialDetail/LinkMaterialItem/LinkMaterialItem";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function DetailTugasPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;

  const user = await getCurrentUser();
  const res = await assignmentServices.findAssignmentById(
    classroomId,
    assignmentId,
  );
  const data: IAssignment = res.data?.data;

  dayjs.locale("id");

  const hasDeadline = data.deadline && !data.deadline.startsWith("0001");
  const isOverdue =
    hasDeadline &&
    dayjs(data.deadline)
      .tz("Asia/Jakarta")
      .isBefore(dayjs().tz("Asia/Jakarta"));

  return (
    <>
      <div className="p-4 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-center w-full">
              <div className="bg-primary p-4 border rounded-full">
                <FileText color="white" />
              </div>
              <div>
                <div className="text-base md:text-xl font-bold">
                  {data.title}
                </div>
                {hasDeadline && (
                  <div
                    className={`text-sm ${isOverdue ? "text-red-500" : "text-gray-500"}`}
                  >
                    Batas pengumpulan:{" "}
                    {dayjs(data.deadline).format("DD MMMM YYYY, HH:mm")}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.instruction ? (
              <>
                <div className="font-bold text-gray-500 text-sm">INSTRUKSI</div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(data.instruction),
                  }}
                />
              </>
            ) : (
              <div className="text-gray-500">Tidak ada instruksi</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">Lampiran</div>
          </CardHeader>
          <CardContent>
            {data.attachments && data.attachments.filter((a) => a.type === "FILE" || a.type === "VIDEO").length > 0 ? (
              <AssignmentAttachmentSection attachments={data.attachments.filter((a) => a.type === "FILE" || a.type === "VIDEO")} />
            ): <div className="h-23 flex items-center justify-center">Tidak ada lampiran</div>}
          </CardContent>
        </Card>
      </div>
      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">Link Referensi</div>
          </CardHeader>
          <CardContent>
            {data.attachments && data.attachments.filter((a) => a.type === "LINK").length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {data.attachments.filter((a) => a.type === "LINK").map((item) => (
                  <LinkMaterialItem key={item.id} linkMateri={item} />
                ))}
              </div>
            ): <div className="h-23 flex items-center justify-center">Tidak ada link referensi</div>}
          </CardContent>
        </Card>
      </div>
      {data.rubrics && data.rubrics.length > 0 && (
        <div className="p-4 w-full">
          <Card>
            <CardHeader className="border-b-2 pb-2">
              <div className="text-base md:text-xl font-bold">
                RUBRIK PENILAIAN
              </div>
            </CardHeader>
            <CardContent>
              <AssignmentRubricSection rubrics={data.rubrics} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
