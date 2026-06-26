import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface PropTypes {
  classroomId: string;
  profileId?: string;
  classroomName: string;
  profileName: string;
  role: "DOSEN" | "MAHASISWA";
}

export default function MemberProfileBreadcrumb(props: PropTypes) {
  const { classroomId, profileId, classroomName, profileName, role } = props;
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
            href={`/${type}/kelas/${classroomId}/anggota`}
            className="capitalize"
          >
            Anggota
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/${type}/kelas/${classroomId}/anggota/${profileId}`}
            className="capitalize"
          >
            {profileName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
