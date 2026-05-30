"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

interface PropTypes {
  classroomName: string;
  classroomId: string;
  type: "dosen" | "mahasiswa";
}

export default function ClassroomBreadcrumb(props: PropTypes) {
  const { classroomName, type, classroomId } = props;
  const pathname = usePathname();
  const validPages = ["materi", "tugas", "mahasiswa", "pengaturan"];
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const page = validPages.includes(lastSegment) ? lastSegment : null;
  return (
    <Breadcrumb>
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
        {page ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${type}/kelas/${classroomId}/${page}`}
                className="capitalize"
              >
                {page}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${type}/kelas/${classroomId}/${classroomId}`}
                className="capitalize"
              >
                Pengumuman
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
