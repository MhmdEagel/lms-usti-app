"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PROGRAM_STUDI from "@/constants/programStudi.constant";

const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function FilterSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentProdi = searchParams.get("prodi") || "";
  const currentTerm = searchParams.get("term") || "";
  const currentTahunAjaran = searchParams.get("tahun_ajaran") || "";
  const currentRoomNumber = searchParams.get("room_number") || "";

  const closeAndNavigate = useCallback(
    (params: URLSearchParams) => {
      setOpen(false);
      router.push(`?${params.toString()}`);
    },
    [router],
  );

  const applyFilters = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const prodi = formData.get("prodi") as string;
      const term = formData.get("term") as string;
      const tahun_ajaran = formData.get("tahun_ajaran") as string;
      const room_number = formData.get("room_number") as string;

      const params = new URLSearchParams(searchParams.toString());

      if (prodi && prodi !== "all") {
        params.set("prodi", prodi);
      } else {
        params.delete("prodi");
      }
      if (term && term !== "all") {
        params.set("term", term);
      } else {
        params.delete("term");
      }
      if (tahun_ajaran) {
        params.set("tahun_ajaran", tahun_ajaran);
      } else {
        params.delete("tahun_ajaran");
      }
      if (room_number) {
        params.set("room_number", room_number);
      } else {
        params.delete("room_number");
      }
      params.delete("page");

      closeAndNavigate(params);
    },
    [searchParams, closeAndNavigate],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("prodi");
    params.delete("term");
    params.delete("tahun_ajaran");
    params.delete("room_number");
    params.delete("page");
    closeAndNavigate(params);
  }, [searchParams, closeAndNavigate]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Kelas</SheetTitle>
          <SheetDescription>
            Filter kelas berdasarkan program studi, semester, tahun ajaran, atau
            ruangan.
          </SheetDescription>
        </SheetHeader>
        <form key={String(open)} onSubmit={applyFilters} className="flex flex-col gap-6 p-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="prodi">Program Studi</Label>
            <Select name="prodi" defaultValue={currentProdi}>
              <SelectTrigger id="prodi" className="w-full">
                <SelectValue placeholder="Semua Program Studi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Semua Program Studi
                </SelectItem>
                {PROGRAM_STUDI.map((item) => (
                  <SelectItem key={item.id} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Semester</Label>
            <Select name="term" defaultValue={currentTerm}>
              <SelectTrigger id="term" className="w-full">
                <SelectValue placeholder="Semua Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Semua Semester
                </SelectItem>
                {SEMESTER_OPTIONS.map((sem) => (
                  <SelectItem key={sem} value={String(sem)}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
            <Input
              id="tahun_ajaran"
              name="tahun_ajaran"
              placeholder="Contoh: 2025/2026"
              defaultValue={currentTahunAjaran}
              autoComplete="off"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_number">Nomor Ruangan</Label>
            <Input
              id="room_number"
              name="room_number"
              type="number"
              min={1}
              placeholder="Contoh: 5"
              defaultValue={currentRoomNumber}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Terapkan Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
