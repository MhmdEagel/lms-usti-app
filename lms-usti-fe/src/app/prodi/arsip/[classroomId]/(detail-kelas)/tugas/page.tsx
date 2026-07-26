import Assignment from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/Assignment";

export default async function ProdiArsipTugasPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const { classroomId } = await params;
  const { page, limit, search } = await searchParams;

  return (
    <Assignment
      classroomId={classroomId}
      type="prodi"
      page={page ? Number(page) : 1}
      limit={limit ? Number(limit) : 10}
      search={search || ""}
      readOnly
    />
  );
}
