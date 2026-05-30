"use client";

import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PropTypes {
  index: number;
  name: string;
  score: string;
  arrayOfRubrics: { name: string; score: string }[];
  setArrayOfRubrics: React.Dispatch<
    React.SetStateAction<{ name: string; score: string }[]>
  >;
}

export default function RubrikItem({
  index,
  name,
  score,
  arrayOfRubrics,
  setArrayOfRubrics,
}: PropTypes) {
  const handleDelete = () => {
    const newRubrics = arrayOfRubrics.filter((_, i) => i !== index);
    setArrayOfRubrics(newRubrics);
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg w-fit">
      <Label>{name} /</Label>
      <Label className="text-black/70">{score}</Label>
      <button
        type="button"
        onClick={handleDelete}
        className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
      >
        <X className="w-4 h-4 text-destructive" />
      </button>
    </div>
  );
}
