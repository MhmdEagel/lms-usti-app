"use client";

import { useState, useCallback } from "react";
import { classroomServices } from "@/services/classroom.service";
import { ComboBox, type ComboBoxOption } from "@/components/ui/combobox";
import type { IDosenListItem } from "@/types/Classroom";

interface PropTypes {
  value: string;
  onChange: (value: string) => void;
}

export default function DosenCombobox({ value, onChange }: PropTypes) {
  const [options, setOptions] = useState<ComboBoxOption[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await classroomServices.getDosenList(query);
      const items = res.data.data ?? [];
      setOptions(
        items.map((d: IDosenListItem) => ({
          value: d.id,
          label: d.fullname,
          sublabel: d.email,
        })),
      );
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ComboBox
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Cari dosen untuk ditugaskan di kelas"
      onSearch={handleSearch}
      loading={loading}
      emptyMessage="Tidak ada dosen ditemukan."
    />
  );
}
