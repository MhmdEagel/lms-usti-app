"use client";

import { useState, useEffect } from "react";
import type { IAssignment, ISubmission, ISubmissionDetail } from "@/types/Classroom";
import { assignmentServices } from "@/services/assignment.service";
import SubmissionListCard from "./SubmissionListCard";
import AttachmentCard from "./AttachmentCard";
import InstructionCard from "./InstructionCard";
import GradingCard from "./GradingCard";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
interface PaginationInfo {
  limit: number;
  total_pages: number;
  total: number;
  current: number;
}

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  assignment: IAssignment;
  submissions: ISubmission[];
  pagination?: PaginationInfo;
}

export default function GradingContent({
  classroomId,
  assignmentId,
  assignment,
  submissions,
  pagination,
}: PropTypes) {
  const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
  const [submissionDetail, setSubmissionDetail] = useState<ISubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedSubmission) {
      setSubmissionDetail(null);
      return;
    }
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await assignmentServices.findSubmissionDetail(
          classroomId,
          assignmentId,
          selectedSubmission.id,
        );
        setSubmissionDetail(res.data?.data || null);
      } catch {
        setSubmissionDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedSubmission, classroomId, assignmentId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="lg:col-span-2">
        <SubmissionListCard
          submissions={submissions}
          assignment={assignment}
          selectedSubmission={selectedSubmission}
          onSelectSubmission={setSelectedSubmission}
        />
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <PaginationControls current={pagination.current} limit={pagination.limit} />
            <PaginationNav
              current={pagination.current}
              totalPages={pagination.total_pages}
              total={pagination.total}
              limit={pagination.limit}
            />
          </div>
        )}
      </div>
      <div className="space-y-4">
        <AttachmentCard
          selectedSubmission={selectedSubmission}
          submissionDetail={submissionDetail}
          loadingDetail={loadingDetail}
        />
        <InstructionCard instruction={assignment.instruction} />
        {assignment.rubrics && assignment.rubrics.length > 0 && (
          <GradingCard
            rubrics={assignment.rubrics}
            selectedSubmission={selectedSubmission}
          />
        )}
      </div>
    </div>
  );
}
