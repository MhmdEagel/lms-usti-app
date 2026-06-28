import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, FileText } from "lucide-react";
import { assignmentServices } from "@/services/assignment.service";
import { classroomServices } from "@/services/classroom.service";
import type { IAssignment, IClassroom } from "@/types/Classroom";
import AssignmentBreadcrumb from "./AssignmentBreadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AssignmentAttachmentSection from "./AssignmentAttachmentSection";
import AssignmentRubricSection from "./AssignmentRubricSection";
import LinkMaterialItem from "../MaterialDetail/LinkMaterialItem/LinkMaterialItem";
import AssignmentAction from "./AssignmentAction";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  type?: "dosen" | "mahasiswa";
}

export default async function AssignmentDetail(props: PropTypes) {
  const { classroomId, assignmentId, type = "dosen" } = props;

  const classroomDetail = await classroomServices.getDetail(classroomId);
  const user = await getCurrentUser();
  const res = await assignmentServices.findAssignmentById(
    classroomId,
    assignmentId,
  );
  const data: IAssignment = res.data?.data;
  const classroomData: IClassroom = classroomDetail.data?.data;

  dayjs.locale("id");
  const role = user.role as "DOSEN" | "MAHASISWA";

  if (!data) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-128">
        <Image
          width={300}
          height={300}
          src={"/images/ilustration/404.svg"}
          alt="Not Found Image"
        />
        <div className="text-2xl md:text-4xl font-bold text-primary mb-1">
          404
          <div className="text-base md:text-2xl">Tugas tidak ditemukan</div>
        </div>
      </div>
    );
  }

  const hasDeadline = data.deadline && !data.deadline.startsWith("0001");
  const isOverdue =
    hasDeadline &&
    dayjs(data.deadline)
      .tz("Asia/Jakarta")
      .isBefore(dayjs().tz("Asia/Jakarta"));

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomData.id!}
        assignmentId={assignmentId}
        classroomName={classroomData.class_name}
        assignmentTitle={data.title}
        role={role}
      />
      <Link
        className="mb-2"
        href={`/${role.toLowerCase()}/kelas/${classroomId}/tugas`}
      >
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
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
              {user?.role === "DOSEN" ? (
                <div className="ml-auto">
                  <CardAction>
                    <AssignmentAction
                      assignment={data}
                      classroomId={classroomId}
                    />
                  </CardAction>
                </div>
              ) : null}
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
    </div>
  );
}
