"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { IRubrics, ISubmission } from "@/types/Classroom";
import { Button } from "@/components/ui/button";

interface PropTypes {
  rubrics: IRubrics[];
  selectedSubmission: ISubmission | null;
}

export default function GradingCard({ rubrics, selectedSubmission }: PropTypes) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  const handleScoreChange = useCallback(
    (rubricId: string, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      setScores((prev) => ({ ...prev, [rubricId]: num }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!selectedSubmission) return;
    console.log("Save grading", { submissionId: selectedSubmission.id, scores, feedback });
  }, [selectedSubmission, scores, feedback]);

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = rubrics.reduce((sum, r) => sum + r.score, 0);

  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">
          Rubrik Penilaian
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
          disabled={!selectedSubmission}
        >
          Simpan
        </Button>
      </CardContent>
    </Card>
  );
}
