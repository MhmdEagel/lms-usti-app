"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { IRubrics, ISubmission } from "@/types/Classroom";
import { Button } from "@/components/ui/button";
import { gradeSubmission } from "@/actions/grade-submission";
import { toast } from "sonner";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  rubrics?: IRubrics[] | null;
  selectedSubmission: ISubmission | null;
}

export default function GradingCard({ classroomId, assignmentId, rubrics, selectedSubmission }: PropTypes) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  const handleScoreChange = useCallback(
    (rubricId: string, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      setScores((prev) => ({ ...prev, [rubricId]: num }));
    },
    [],
  );

  useEffect(() => {
    setFeedback(selectedSubmission?.feedback ?? "");
    setScore(selectedSubmission?.score?.toString() ?? "");
    setScores({});
  }, [selectedSubmission]);

  const hasRubrics = rubrics && rubrics.length > 0;
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = hasRubrics ? rubrics.reduce((sum, r) => sum + r.score, 0) : 0;

  const handleSave = useCallback(async () => {
    if (!selectedSubmission) return;
    setSaving(true);
    const finalScore = hasRubrics ? totalScore : (score ? parseFloat(score) : null);
    const { error } = await gradeSubmission(
      classroomId,
      assignmentId,
      selectedSubmission.id,
      { score: finalScore, feedback: feedback || null },
    );
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan nilai");
    } else {
      toast.success("Nilai berhasil disimpan");
    }
  }, [selectedSubmission, scores, feedback, score, classroomId, assignmentId, hasRubrics, totalScore]);

  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">
          {hasRubrics ? "Rubrik Penilaian" : "Nilai"}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedSubmission ? (
          <div className="text-gray-500 text-center py-8">
            Silahkan pilih mahasiswa
          </div>
        ) : hasRubrics ? (
          <>
            {rubrics.map((rubric) => (
              <div key={rubric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{rubric.name}</span>
                  <span className="text-xs text-gray-500">
                    Maks: {rubric.score}
                  </span>
                </div>
                <input
                  type="number"
                  max={rubric.score}
                  min={0}
                  placeholder={`0 / ${rubric.score}`}
                  value={scores[rubric.id!] ?? ""}
                  onChange={(e) => handleScoreChange(rubric.id!, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-bold">Total Nilai</span>
              <span className="text-sm font-bold">
                {totalScore} / {maxScore}
              </span>
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium block mb-1">
              Nilai
            </label>
            <input
              type="number"
              min={0}
              placeholder="Masukkan nilai..."
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
