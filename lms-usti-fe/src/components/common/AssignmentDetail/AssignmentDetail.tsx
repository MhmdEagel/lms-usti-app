import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { FileText } from "lucide-react";
import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment, IMySubmission } from "@/types/Classroom";
import { getCurrentUser } from "@/lib/auth";
import AssignmentAttachmentSection from "./AssignmentAttachmentSection";
import AssignmentAction from "./AssignmentAction";
import SubmitAssignmentDialog from "./SubmitAssignmentDialog/SubmitAssignmentDialog";
import BackButton from "@/components/common/BackButton/BackButton";
import AssignmentDetailTabNavbar from "./AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";
import AssignmentBreadcrumb from "./AssignmentBreadcrumb/AssignmentBreadcrumb";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  type: "dosen" | "mahasiswa";
}
export default async function AssignmentDetail(props: PropTypes) {
  const { classroomId, assignmentId, type } = props;
  const [assignmentRes, mySubmissionRes, currentUser] = await Promise.all([
    assignmentServices.findAssignmentById(classroomId, assignmentId),
    type === "mahasiswa"
      ? assignmentServices
          .findMySubmission(classroomId, assignmentId)
          .catch(() => null)
      : Promise.resolve(null),
    getCurrentUser().catch(() => null),
  ]);
  const data: IAssignment = assignmentRes.data?.data;
  const mySubmission: IMySubmission | null =
    mySubmissionRes?.data?.data || null;
  const role: string = currentUser?.role || "";
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
      <div className="mb-2">
        <BackButton />
      </div>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type={type}
      />
      <div className="p-4 max-w-4xl mx-auto">
        {type === "mahasiswa" ? (
          <Card>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 min-w-0">
                <CardHeader>
                  <div className="flex gap-4 items-center w-full">
                    <div className="bg-primary p-4 border rounded-full shrink-0">
                      <FileText color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base md:text-xl font-bold">
                        {data.title}
                      </div>
                      {hasDeadline && (
                        <div
                          className={`text-sm sm:text-lg ${isOverdue ? "text-red-500" : "text-gray-500"}`}
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
                  {mySubmission?.feedback && (
                    <>
                      <div className="font-bold text-gray-500 text-sm mt-4">
                        UMPAN BALIK
                      </div>
                      <div className="text-base whitespace-pre-wrap">
                        {mySubmission.feedback}
                      </div>
                    </>
                  )}
                </CardContent>
              </div>
              <div className="hidden lg:block w-px bg-border" />
              <hr className="lg:hidden border-t border-border" />
              <div className="w-full lg:w-72 shrink-0 p-4 space-y-4">
                <div>
                  <div className="font-bold text-gray-500 text-xs">STATUS</div>
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusConfig[submissionStatus].className}`}
                  >
                    {statusConfig[submissionStatus].label}
                  </span>
                </div>
                {mySubmission?.score !== null && (
                  <div>
                    <div className="font-bold text-gray-500 text-xs">NILAI</div>
                    <div className="text-xl font-bold text-primary mt-1">
                      {mySubmission?.score} / 100
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-500 text-xs mb-2">
                    AKSI
                  </div>
                  <SubmitAssignmentDialog
                    classroomId={classroomId}
                    assignmentId={assignmentId}
                    mySubmission={mySubmission}
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 min-w-0">
                <CardHeader>
                  <div className="flex gap-4 items-center w-full">
                    <div className="bg-primary p-4 border rounded-full shrink-0">
                      <FileText color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base md:text-xl font-bold">
                        {data.title}
                      </div>
                      {hasDeadline && (
                        <div
                          className={`text-sm sm:text-lg ${isOverdue ? "text-red-500" : "text-gray-500"}`}
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
                    <>
                      <div className="font-bold text-gray-500 text-sm mt-2">
                        INSTRUKSI
                      </div>
                      <div>Tidak ada instruksi</div>
                    </>
                  )}
                </CardContent>
              </div>
              <div className="hidden lg:block w-px bg-border" />
              <hr className="lg:hidden border-t border-border" />
              <div className="w-full lg:w-72 shrink-0 p-4 space-y-4">
                {data.stats && (
                  <div className="space-y-2">
                    <div className="font-bold text-gray-500 text-xs">
                      STATUS PENGUMPULAN
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        Belum dikumpulkan:{" "}
                        {data.stats.total_students - data.stats.total_submitted}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                        Menunggu nilai:{" "}
                        {data.stats.total_submitted - data.stats.total_graded}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        Sudah dinilai: {data.stats.total_graded}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-500 text-xs mb-2">
                    AKSI
                  </div>
                  <AssignmentAction
                    assignment={data}
                    classroomId={classroomId}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">LAMPIRAN</div>
          </CardHeader>
          <CardContent>
            {data.attachments && data.attachments.length > 0 ? (
              <AssignmentAttachmentSection attachments={data.attachments} />
            ) : (
              <div className="h-23 flex items-center justify-center">
                Tidak ada lampiran
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
