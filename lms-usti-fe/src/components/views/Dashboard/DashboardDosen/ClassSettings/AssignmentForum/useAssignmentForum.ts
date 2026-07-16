"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classPolicySchema, type ClassPolicyFormData } from "@/schemas/classroom";
import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IClassroomPolicies } from "@/types/Classroom";

export function useAssignmentForum(classroomId: string, policies: IClassroomPolicies | null) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ClassPolicyFormData>({
    resolver: zodResolver(classPolicySchema),
    defaultValues: {
      forumPermission: "comment_only",
      commentPermission: "active",
    },
  });
  const { setValue } = form;

  useEffect(() => {
    if (policies) {
      setValue("forumPermission", policies.forum_permission as "full_access" | "comment_only" | "dosen_only");
      setValue("commentPermission", policies.comment_permission as "active" | "inactive");
    }
  }, [policies, setValue]);

  const onSubmit = async (data: ClassPolicyFormData) => {
    setIsPending(true);
    try {
      await classroomServices.updatePolicies(classroomId, {
        forum_permission: data.forumPermission,
        comment_permission: data.commentPermission,
      });
      toast.success("Kebijakan kelas berhasil diperbarui");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { form, isPending, onSubmit };
}
