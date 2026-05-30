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
  materialId: string;
  classroomName: string;
  materialName: string;
  role: "DOSEN" | "MAHASISWA";
}

export default function MaterialBreadcrumb(props: PropTypes) {
  const { classroomName, role, classroomId, materialId, materialName } = props;
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
          <BreadcrumbLink
            href={`/${type}/kelas/${classroomId}/materi`}
            className="capitalize"
          >
            Materi
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/${type}/kelas/${classroomId}/materi/${materialId}`}
            className="capitalize"
          >
            {materialName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
