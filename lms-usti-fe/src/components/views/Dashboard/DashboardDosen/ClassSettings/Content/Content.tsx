"use client";

import Detail from "../Detail/Detail";
import Navbar from "../Navbar/Navbar";
import { useContent } from "./useContent";
import Privacy from "../Privacy/Privacy";
import Evaluation from "../Evaluation/Evaluation";
import { IClassroom } from "@/types/Classroom";

export default function Content({
  classroomId,
  classDetail,
}: {
  classroomId: string;
  classDetail: IClassroom;
}) {
  const { isActive, handleActiveBar } = useContent();

  const renderContent = () => {
    switch (isActive) {
      case "Detail":
        return <Detail classroomId={classroomId} classDetail={classDetail} />;
      case "Privasi":
        return <Privacy />;
      case "Penilaian":
        return <Evaluation />;
    }
  };
  return (
    <>
      <Navbar isActive={isActive} handleActiveBar={handleActiveBar} />
      <div className="flex-1 px-6 pt-6">{renderContent()}</div>
    </>
  );
}
