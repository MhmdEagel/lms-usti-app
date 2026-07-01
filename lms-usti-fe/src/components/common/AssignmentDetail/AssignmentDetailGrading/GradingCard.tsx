"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ISubmission } from "@/types/Classroom";
import { Button } from "@/components/ui/button";
import { gradeSubmission } from "@/actions/grade-submission";
import { toast } from "sonner";
import { z } from "zod";

const gradeSchema = z.object({
  score: z.coerce.number().min(0).max(100, "Nilai tidak boleh lebih dari 100"),
});

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  selectedSubmission: ISubmission | null;
}

export default function GradingCard({
  classroomId,
  assignmentId,
  selectedSubmission,
}: PropTypes) {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFeedback(selectedSubmission?.feedback ?? "");
    setScore(selectedSubmission?.score?.toString() ?? "");
  }, [selectedSubmission]);

  const handleSave = useCallback(async () => {
    if (!selectedSubmission) return;

    const parsed = gradeSchema.safeParse({ score });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    const { error } = await gradeSubmission(
      classroomId,
      assignmentId,
      selectedSubmission.id,
      { score: parsed.data.score, feedback: feedback || null },
    );
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan nilai");
    } else {
      toast.success("Nilai berhasil disimpan");
    }
  }, [selectedSubmission, feedback, score, classroomId, assignmentId]);

  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">Nilai</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedSubmission ? (
          <div className="text-gray-500 text-center py-8">
            Silahkan pilih mahasiswa
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium block mb-1">Nilai</label>
            <input
              min={1}
              max={16}
              autoComplete="off"
              type="number"
              placeholder="Tulis nilai"
              inputMode="numeric"
              pattern="[1-9]{1}"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        {selectedSubmission && (
          <>
            <div>
              <label className="text-sm font-medium block mb-1">
                Umpan Balik
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tulis umpan balik..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!selectedSubmission || saving}
            >
              Simpan
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
