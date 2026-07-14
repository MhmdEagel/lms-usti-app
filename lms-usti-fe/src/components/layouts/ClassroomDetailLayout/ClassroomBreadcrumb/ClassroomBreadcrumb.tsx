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
  const segment = pathname.split("/")[2] || "kelas";
  const validPages = ["materi", "tugas", "mahasiswa", "pengaturan", "anggota", "pertemuan"];
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const page = validPages.includes(lastSegment) ? lastSegment : null;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${type}/${segment}`}>
            {segment === "arsip" ? "Arsip" : "Kelas"}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${type}/${segment}/${classroomId}`} className="max-w-[120px] sm:max-w-[200px] truncate inline-block">
            {classroomName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {page ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${type}/${segment}/${classroomId}/${page}`}
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
                href={`/${type}/${segment}/${classroomId}/${classroomId}`}
                className="capitalize"
              >
                Forum Kelas
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
