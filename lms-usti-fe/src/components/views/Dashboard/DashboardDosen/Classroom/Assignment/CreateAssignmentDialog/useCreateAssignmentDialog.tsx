"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAssignmentSchema } from "@/schemas/assignment";
import { newAssignment } from "@/actions/new-assignment";
import { z } from "zod";
import { uploadMaterial } from "@/actions/upload-material";
import { IAttachment } from "@/types/Classroom";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { uploadAssignment } from "@/actions/upload-assignment";

const useCreateAssignmentDialog = () => {
  const [open, setOpen] = useState("closed");
  const [arrayOfFiles, setArrayOfFiles] = useState<IAttachment[]>([]);
  const [arrayOfLinks, setArrayOfLinks] = useState<IAttachment[]>([]);

  const [hasDeadline, setHasDeadline] = useState(false);
  const [arrayOfRubrics, setArrayOfRubrics] = useState<
    { name: string; score: string }[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);

  const [rubricName, setRubricName] = useState("");
  const [rubricValue, setRubricValue] = useState("");

  const totalScore = arrayOfRubrics.reduce(
    (sum, r) => sum + (parseInt(r.score) || 0),
    0,
  );
  const canAddRubric = totalScore < 100;

  const assignmentForm = useForm({
    defaultValues: {
      title: "",
      instruction: "",
      deadline: "",
      rubrics: [],
    },
    resolver: zodResolver(createAssignmentSchema),
  });

  const pdfMateriRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    assignmentForm.setValue("rubrics", arrayOfRubrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayOfRubrics]);

  const handleAddRubric = (rubricName: string, rubricScore: string) => {
    setArrayOfRubrics((prev) => [
      ...prev,
      { name: rubricName, score: rubricScore },
    ]);
    setRubricName("");
    setRubricValue("");
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await uploadAssignment(formData);
      console.log(res)
      const newFile: IAttachment = {
        name: res.data?.file_name,
        url: res.data?.file_url,
        unique_name: res.data?.unique_file_name,
        type: "FILE",
      };
      setArrayOfFiles((prevValue) => [...prevValue, newFile]);
      toast.success("File berhasil diupload");
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleAssignmentForm = async (
    data: z.infer<typeof createAssignmentSchema>,
    classroomId: string,
  ) => {
    setIsPending(true);
    console.log(data)
    const payload = {
      ...data,
      rubrics: data.rubrics?.filter((r) => r.name && r.score) || [],
    };

    // const res = await newAssignment(payload, classroomId);
    // if (!res.success && res.error) {
    //   toast.error(res.error);
    //   setIsPending(false);
    //   return;
    // }
    setIsPending(false);
    // toast.success(res.success);
    setArrayOfRubrics([]);
    setHasDeadline(false);
    setOpen("closed");
  };

  const handleClose = () => {
    setArrayOfRubrics([]);
    setHasDeadline(false);
    setOpen("closed");
  };

  return {
    open,
    setOpen,

    hasDeadline,
    setHasDeadline,

    arrayOfRubrics,
    setArrayOfRubrics,

    setIsPending,
    isPending,

    handleAddRubric,
    handleAssignmentForm,
    handleClose,

    assignmentForm,

    rubricName,
    rubricValue,
    setRubricName,
    setRubricValue,
    totalScore,

    canAddRubric,
    pdfMateriRef,

    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
    arrayOfFiles,
    setArrayOfFiles,

    arrayOfLinks,
    setArrayOfLinks
  };
};

export default useCreateAssignmentDialog;
