import { redirect } from "next/navigation";

export default async function MateriPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  redirect(`/dosen/kelas/${classroomId}/pertemuan/materi`);
}
