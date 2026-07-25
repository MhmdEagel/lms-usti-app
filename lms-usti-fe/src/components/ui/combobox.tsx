"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface ComboBoxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface PropTypes {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
}

export function ComboBox({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  onSearch,
  loading = false,
  emptyMessage = "Tidak ada data",
  disabled = false,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  useEffect(() => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = inputValue ? 400 : 0;
    debounceRef.current = setTimeout(() => {
      onSearch(inputValue);
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, onSearch]);

  const filteredOptions = useMemo(() => {
    if (onSearch) return options;
    if (!inputValue) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [options, inputValue, onSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: ComboBoxOption) => {
    onChange(option.value);
    setInputValue("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={isOpen ? inputValue : selectedLabel}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mencari...
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent text-accent-foreground",
                )}
              >
                <div>
                  <div>{option.label}</div>
                  {option.sublabel && (
                    <div className="text-xs text-muted-foreground">{option.sublabel}</div>
                  )}
                </div>
                {value === option.value && (
                  <Check className="size-4 shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComboBox;
