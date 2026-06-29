"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { IAssignment, ISubmission } from "@/types/Classroom";
import { SearchBar } from "@/components/ui/searchfield";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  submissions: ISubmission[];
  assignment: IAssignment;
  selectedSubmission: ISubmission | null;
  onSelectSubmission: (submission: ISubmission) => void;
}

type FilterType = "semua" | "telat" | "belum_dinilai" | "belum_mengirim" | "sudah_dinilai";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "telat", label: "Telat" },
  { key: "sudah_dinilai", label: "Sudah dinilai" },
  { key: "belum_dinilai", label: "Belum dinilai" },
  { key: "belum_mengirim", label: "Belum Mengirim" },
];

export default function SubmissionListCard({
  submissions,
  assignment,
  selectedSubmission,
  onSelectSubmission,
}: PropTypes) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("semua");

  const hasDeadline =
    assignment.deadline && !assignment.deadline.startsWith("0001");
  const deadlineDate = hasDeadline
    ? dayjs(assignment.deadline).tz("Asia/Jakarta")
    : null;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (activeFilter === "semua") return true;

      const submitDate = submission.submission_date
        ? dayjs(submission.submission_date).tz("Asia/Jakarta")
        : null;
      const isOverdue =
        deadlineDate && submitDate ? submitDate.isAfter(deadlineDate) : false;

      switch (activeFilter) {
        case "telat":
          return submission.status === "submitted" && isOverdue;
        case "sudah_dinilai":
          return (
            submission.status === "submitted" &&
            submission.score !== null &&
            submission.score > 0
          );
        case "belum_dinilai":
          return (
            submission.status === "submitted" &&
            (submission.score === null || submission.score === 0)
          );
        case "belum_mengirim":
          return submission.status !== "submitted";
        default:
          return true;
      }
    });
  }, [submissions, activeFilter, deadlineDate]);

  const getStatusBadge = (submission: ISubmission) => {
    const submitDate = submission.submission_date
      ? dayjs(submission.submission_date).tz("Asia/Jakarta")
      : null;
    const isOverdue =
      deadlineDate && submitDate ? submitDate.isAfter(deadlineDate) : false;

    if (submission.status === "submitted") {
      if (isOverdue) {
        return { label: "Telat", className: "bg-red-100 text-red-600" };
      }
      if (submission.score && submission.score > 0) {
        return {
          label: "Sudah dinilai",
          className: "bg-green-100 text-green-600",
        };
      }
      return {
        label: "Belum dinilai",
        className: "bg-yellow-100 text-yellow-600",
      };
    }
    return {
      label: "Belum mengirim",
      className: "bg-gray-100 text-gray-500",
    };
  };

  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">Pengumpulan</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-bold text-gray-500 text-sm mb-2">
            Cari Mahasiswa
          </div>
          <SearchBar placeholder="Cari mahasiswa..." />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {activeFilter === "belum_mengirim"
                ? "Semua mahasiswa sudah mengirim"
                : "Tidak ada pengumpulan"}
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const isSelected = selectedSubmission?.id === submission.id;
              const submitDate = submission.submission_date
                ? dayjs(submission.submission_date).tz("Asia/Jakarta")
                : null;
              const badge = getStatusBadge(submission);
              return (
                <div
                  key={submission.id}
                  onClick={() => onSelectSubmission(submission)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <Avatar className="h-12 w-12 rounded-full">
                    <AvatarImage
                      src={submission.mahasiswa.profile}
                      alt={submission.mahasiswa.fullname}
                    />
                    <AvatarFallback className="rounded-lg">
                      {submission.mahasiswa.fullname
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {submission.mahasiswa.fullname}
                    </div>
                    {submitDate && (
                      <div className="text-xs text-gray-500">
                        {submitDate.format("DD/MM/YYYY | HH:mm")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {submission.score !== null && (
                      <span className="text-sm font-semibold text-gray-700">
                        {submission.score}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
