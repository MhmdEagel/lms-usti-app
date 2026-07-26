import { redirect } from "next/navigation";

export default async function ProdiKelasTugasPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  redirect(`/prodi/kelas/${classroomId}/pertemuan/tugas`);
}
