"use client";

import { useState, useEffect } from "react";
import type {
  IAssignment,
  ISubmission,
  ISubmissionDetail,
} from "@/types/Classroom";
import { assignmentServices } from "@/services/assignment.service";
import SubmissionListCard from "./SubmissionListCard";
import AttachmentCard from "./AttachmentCard";
import GradingCard from "./GradingCard";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
import { findSubmissionById } from "@/actions/find-submission";
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
  const [selectedSubmission, setSelectedSubmission] =
    useState<ISubmission | null>(null);
  const [submissionDetail, setSubmissionDetail] =
    useState<ISubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedSubmission) {
      setSubmissionDetail(null);
      return;
    }
    const fetchDetail = async () => {
      setLoadingDetail(true);
      const { data } = await findSubmissionById(
        classroomId,
        assignmentId,
        selectedSubmission.id,
      );
      setSubmissionDetail(data);
      setLoadingDetail(false);
    };
    fetchDetail();
  }, [selectedSubmission, classroomId, assignmentId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <div className="space-y-4">
        <SubmissionListCard
          submissions={submissions}
          assignment={assignment}
          selectedSubmission={selectedSubmission}
          onSelectSubmission={setSelectedSubmission}
        />
        {pagination && (
          <div className="flex items-center justify-between">
            <PaginationControls
              current={pagination.current}
              limit={pagination.limit}
            />
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
        <GradingCard
          classroomId={classroomId}
          assignmentId={assignmentId}
          selectedSubmission={selectedSubmission}
        />
      </div>
    </div>
  );
}
