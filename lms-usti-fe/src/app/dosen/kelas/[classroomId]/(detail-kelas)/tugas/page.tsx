import { redirect } from "next/navigation";

export default async function TugasPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  redirect(`/dosen/kelas/${classroomId}/pertemuan/tugas`);
}
