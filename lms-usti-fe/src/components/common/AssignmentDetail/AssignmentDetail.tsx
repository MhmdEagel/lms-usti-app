import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, FileText } from "lucide-react";
import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment, IMySubmission } from "@/types/Classroom";
import AssignmentAttachmentSection from "./AssignmentAttachmentSection";
import AssignmentRubricSection from "./AssignmentRubricSection";
import LinkMaterialItem from "../MaterialDetail/LinkMaterialItem/LinkMaterialItem";
import AssignmentAction from "./AssignmentAction";
import SubmitAssignmentDialog from "./SubmitAssignmentDialog/SubmitAssignmentDialog";
import AssignmentBreadcrumb from "./AssignmentBreadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AssignmentDetailTabNavbar from "./AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  type: "dosen" | "mahasiswa";
}
export default async function AssignmentDetail(props: PropTypes) {
  const { classroomId, assignmentId, type } = props;
  const [assignmentRes, mySubmissionRes] = await Promise.all([
    assignmentServices.findAssignmentById(classroomId, assignmentId),
    type === "mahasiswa"
      ? assignmentServices
          .findMySubmission(classroomId, assignmentId)
          .catch(() => null)
      : Promise.resolve(null),
  ]);
  const data: IAssignment = assignmentRes.data?.data;
  const mySubmission: IMySubmission | null =
    mySubmissionRes?.data?.data || null;
  dayjs.locale("id");
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

  const maxScore = data.rubrics
    ? data.rubrics.reduce((sum, r) => sum + r.score, 0)
    : 0;
  const submissionStatus =
    !mySubmission || mySubmission.status !== "submitted"
      ? "not_submitted"
      : mySubmission.score !== null
        ? "graded"
        : "submitted";
  const statusConfig = {
    not_submitted: {
      label: "Belum Dikerjakan",
      className: "bg-gray-100 text-gray-500",
    },
    submitted: {
      label: "Belum Dinilai",
      className: "bg-yellow-100 text-yellow-700",
    },
    graded: {
      label: "Sudah Dinilai",
      className: "bg-green-100 text-green-700",
    },
  } as const;

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomId}
        assignmentId={assignmentId}
        classroomName={data.classroom_name}
        assignmentTitle={data.title}
        role={type}
      />
      <Link className="mb-2" href={`/${type}/kelas/${classroomId}/tugas`}>
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type={type}
      />
      <div className="p-4 w-full">
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-start w-full">
              <div className="bg-primary p-4 border rounded-full shrink-0">
                <FileText color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base md:text-xl font-bold">
                  {data.title}
                </div>
                {hasDeadline && (
                  <div
                    className={`text-lg ${isOverdue ? "text-red-500" : "text-gray-500"}`}
                  >
                    Batas pengumpulan:{" "}
                    {dayjs(data.deadline).format("DD MMMM YYYY, HH:mm")}
                  </div>
                )}
                {type === "mahasiswa" && (
                  <div className="mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[submissionStatus].className}`}
                    >
                      {statusConfig[submissionStatus].label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {type === "mahasiswa" && mySubmission?.score !== null && (
              <>
                <div className="font-bold text-gray-500 text-sm">NILAI</div>
                <div className="shrink-0">
                  <div className="text-xl font-bold text-primary">
                    {mySubmission?.score} / 100
                  </div>
                </div>
              </>
            )}
            {data.instruction ? (
              <>
                <div className="font-bold text-gray-500 text-sm mt-2">
                  INSTRUKSI
                </div>
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

            {type === "dosen" && (
              <>
                <div className="font-bold text-gray-500 text-sm mt-4 mb-2">
                  AKSI
                </div>
                <AssignmentAction
                  assignment={data}
                  classroomId={classroomId}
                />
              </>
            )}
            {type === "mahasiswa" && (
              <>
                <div className="font-bold text-gray-500 text-sm mt-2 mb-1">
                  AKSI
                </div>
                <SubmitAssignmentDialog
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  mySubmission={mySubmission}
                />
              </>
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
            {data.attachments &&
            data.attachments.filter(
              (a) => a.type === "FILE" || a.type === "VIDEO",
            ).length > 0 ? (
              <AssignmentAttachmentSection
                attachments={data.attachments.filter(
                  (a) => a.type === "FILE" || a.type === "VIDEO",
                )}
              />
            ) : (
              <div className="h-23 flex items-center justify-center">
                Tidak ada lampiran
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">Link Referensi</div>
          </CardHeader>
          <CardContent>
            {data.attachments &&
            data.attachments.filter((a) => a.type === "LINK").length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {data.attachments
                  .filter((a) => a.type === "LINK")
                  .map((item) => (
                    <LinkMaterialItem key={item.id} linkMateri={item} />
                  ))}
              </div>
            ) : (
              <div className="h-23 flex items-center justify-center">
                Tidak ada link referensi
              </div>
            )}
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
