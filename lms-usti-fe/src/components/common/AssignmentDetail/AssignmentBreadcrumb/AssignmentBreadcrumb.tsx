"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  classroomName: string;
  assignmentTitle: string;
  role: "DOSEN" | "MAHASISWA";
}

export default function AssignmentBreadcrumb(props: PropTypes) {
  const { classroomName, assignmentTitle, role, classroomId, assignmentId } = props;
  const type = role.toLowerCase();
  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${type}/kelas`}>Kelas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${type}/kelas/${classroomId}`}>
            {classroomName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${type}/kelas/${classroomId}/tugas`} className="capitalize">
            Tugas
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/${type}/kelas/${classroomId}/tugas/${assignmentId}`}
            className="capitalize"
          >
            {assignmentTitle}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
