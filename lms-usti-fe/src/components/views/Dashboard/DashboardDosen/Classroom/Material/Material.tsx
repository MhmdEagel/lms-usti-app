import { getCurrentUser } from "@/lib/auth";
import MaterialHeader from "./MaterialHeader/MaterialHeader";
import MaterialItem from "./MaterialItem/MaterialItem";
import { materialServices } from "@/services/material.service";
import { IMaterial } from "@/types/Classroom";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
import { SearchBar } from "@/components/ui/searchfield";
import CreateMaterialDialog from "./CreateMaterialDialog/CreateMaterialDialog";

export default async function Material({
  classroomId,
  page = 1,
  limit = 10,
  search = "",
  showHeader = true,
}: {
  classroomId: string;
  page?: number;
  limit?: number;
  search?: string;
  showHeader?: boolean;
}) {
  const user = await getCurrentUser();
  const res = await materialServices.findAllMaterials(classroomId, { page, limit, search });
  const pagination: PaginationInfo = res.data?.pagination;
  const listMateri: IMaterial[] | null = res.data?.data;

  return (
    <>
      {showHeader && <MaterialHeader />}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <div className="w-full sm:w-auto sm:flex-1">
          <SearchBar placeholder="Cari materi..." />
        </div>
        {user?.role === "DOSEN" ? <CreateMaterialDialog classroomId={classroomId} /> : null}
      </div>
      <div className="mt-4 flex flex-col gap-4">
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
      {pagination && (
        <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
          <PaginationControls
            current={pagination.current}
            limit={pagination.limit}
          />
          <PaginationNav
            current={pagination.current}
            totalPages={pagination.total_pages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      )}
    </>
  );
}
