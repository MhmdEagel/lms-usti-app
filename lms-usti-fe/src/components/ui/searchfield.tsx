"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";
import useDebounce from "@/hooks/useDebounce";

function SearchBar({ placeholder = "Cari kelas..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounce = useDebounce();
  const currentSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(currentSearch);

  const navigateWithSearch = useCallback(
    (searchValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      debounce(() => navigateWithSearch(newValue), 500);
    },
    [debounce, navigateWithSearch],
  );

  const handleClear = useCallback(() => {
    setValue("");
    debounce(() => navigateWithSearch(""), 0);
  }, [debounce, navigateWithSearch]);

  return (
    <div className="space-y-2 w-full">
      <div className="relative">
        <Input
          className="peer ps-9 pe-9"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={handleChange}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { SearchBar };
