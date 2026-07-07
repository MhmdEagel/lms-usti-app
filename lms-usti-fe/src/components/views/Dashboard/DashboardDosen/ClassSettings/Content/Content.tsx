"use client";

import Detail from "../Detail/Detail";
import Navbar from "../Navbar/Navbar";
import { useContent } from "./useContent";
import AssignmentForum from "../AssignmentForum/AssignmentForum";
import { IClassroom, IClassroomPolicies } from "@/types/Classroom";

export default function Content({
  classroomId,
  classDetail,
  policies,
}: {
  classroomId: string;
  classDetail: IClassroom;
  policies: IClassroomPolicies | null;
}) {
  const { isActive, handleActiveBar } = useContent();

  const renderContent = () => {
    switch (isActive) {
      case "Detail":
        return <Detail classroomId={classroomId} classDetail={classDetail} />;
      case "Tugas dan Forum":
        return <AssignmentForum classroomId={classroomId} policies={policies} />;
    }
  };
  return (
    <>
      <Navbar isActive={isActive} handleActiveBar={handleActiveBar} />
      <div className="flex-1 px-6 pt-6">{renderContent()}</div>
    </>
  );
}
