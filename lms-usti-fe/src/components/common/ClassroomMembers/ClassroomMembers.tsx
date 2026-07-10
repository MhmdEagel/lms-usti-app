import React from "react";
import MemberItem from "./MemberItem/MemberItem";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { IClassroomMembers } from "@/types/Classroom";

export default async function ClassroomMembers({
  classroomId,
}: {
  classroomId: string;
}) {
  const user = await getCurrentUser();
  const res = await classroomServices.getMembers(classroomId);
  const members: IClassroomMembers = res.data.data;
  if (!members) {
    return (
      <div className="h-32 flex justify-center items-center text-center">
        Terjadi kesalahan. Periksa jaringan anda
      </div>
    );
  }


  return (
    <div className="mt-4 space-y-6">
      <div className="flex flex-col gap-4 border-b-2 pb-6">
        <div className="text-base sm:text-lg font-bold">
          {user?.role !== "DOSEN" ? "Dosen" : "Anda"}
        </div>
        <MemberItem
          viewerRole={user?.role}
          classroomId={classroomId}
          id={members.dosen?.id}
          fullname={members.dosen?.fullname}
          profile={members.dosen?.profile}
          isCurrentUser={user?.id === members.dosen?.id}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-base sm:text-lg font-bold">Mahasiswa</div>
        {members.mahasiswa && members.mahasiswa.length > 0 ? (
          members.mahasiswa?.map((mahasiswa) => (
            <MemberItem
              key={mahasiswa.id}
              viewerRole={user?.role}
              classroomId={classroomId}
              id={mahasiswa.id}
              fullname={mahasiswa.fullname}
              profile={mahasiswa.profile}
              isCurrentUser={user?.id === mahasiswa.id}
            />
          ))
        ) : (
          <div className="h-24 flex justify-center items-center text-center">
            Belum ada yang bergabung ke dalam kelas
          </div>
        )}
      </div>
    </div>
  );
}
