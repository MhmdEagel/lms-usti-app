import { redirect } from "next/navigation";

export default async function ProdiKelasMateriPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  redirect(`/prodi/kelas/${classroomId}/pertemuan/materi`);
}
