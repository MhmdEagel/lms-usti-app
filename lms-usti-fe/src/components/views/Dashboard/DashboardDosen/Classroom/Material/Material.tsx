import { getCurrentUser } from "@/lib/auth";
import MaterialHeader from "./MaterialHeader/MaterialHeader";
import MaterialItem from "./MaterialItem/MaterialItem";
import { materialServices } from "@/services/material.service";
import { IMaterial } from "@/types/Classroom";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";

export default async function Material({
  classroomId,
  page = 1,
  limit = 10,
}: {
  classroomId: string;
  page?: number;
  limit?: number;
}) {
  const user = await getCurrentUser();
  const res = await materialServices.findAllMaterials(classroomId, { page, limit });
  const pagination: PaginationInfo = res.data?.pagination;
  const listMateri: IMaterial[] | null = res.data?.data;

  return (
    <>
      <MaterialHeader classroomId={classroomId} userRole={user?.role} />
      <div className="mt-4 space-y-4">
        {listMateri && listMateri.length > 0 ? (
          listMateri.map((item) => (
            <MaterialItem
              key={item.id}
              materialId={item.id}
              title={item.title}
              createdAt={item.created_at}
            />
          ))
        ) : (
          <div className="h-32 flex justify-center items-center">Belum ada materi yang ditambahkan</div>
        )}
      </div>
      {pagination && pagination.total_pages > 1 && (
        <PaginationControls
          current={pagination.current}
          totalPages={pagination.total_pages}
          total={pagination.total}
          limit={pagination.limit}
        />
      )}
    </>
  );
}
