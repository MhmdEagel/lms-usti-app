"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { classroomServices } from "@/services/classroom.service";
import type { IDosenListItem } from "@/types/Classroom";
import PROGRAM_STUDI from "@/constants/programStudi.constant";

function getProdiLabel(value: string): string {
  const found = PROGRAM_STUDI.find((p) => p.value === value);
  return found ? found.name : value;
}

export default function ActiveFilterCapsules() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dosenName, setDosenName] = useState("");

  const dosenId = searchParams.get("dosen_id");

  useEffect(() => {
    if (!dosenId) {
      setDosenName("");
      return;
    }
    classroomServices.getDosenList("").then((res) => {
      const items = res.data.data ?? [];
      const found = items.find((d: IDosenListItem) => d.id === dosenId);
      if (found) setDosenName(found.fullname);
    }).catch(() => {});
  }, [dosenId]);

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filters: { key: string; display: string }[] = [];

  const prodi = searchParams.get("prodi");
  if (prodi) {
    filters.push({ key: "prodi", display: `Prodi ${getProdiLabel(prodi)}` });
  }

  const term = searchParams.get("term");
  if (term) {
    filters.push({ key: "term", display: `Semester ${term}` });
  }

  const tahunAjaran = searchParams.get("tahun_ajaran");
  if (tahunAjaran) {
    filters.push({ key: "tahun_ajaran", display: `Tahun Ajaran ${tahunAjaran}` });
  }

  const roomNumber = searchParams.get("room_number");
  if (roomNumber) {
    filters.push({ key: "room_number", display: `Ruangan ${roomNumber}` });
  }

  if (dosenId) {
    filters.push({ key: "dosen_id", display: `Dosen ${dosenName || dosenId}` });
  }

  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center rounded-full gap-1 px-3 py-1.5 text-sm font-normal bg-secondary text-secondary-foreground"
        >
          {filter.display}
          <Button
            variant="ghost"
            size="icon"
            className="size-4 p-0 ml-1 hover:bg-transparent"
            onClick={() => removeFilter(filter.key)}
            aria-label={`Hapus filter ${filter.key}`}
            type="button"
          >
            <X size={12} />
          </Button>
        </span>
      ))}
    </div>
  );
}
