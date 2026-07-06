import { z } from "zod";

export const classPolicySchema = z.object({
  lateSubmission: z.enum(["allow", "not_allowed"], {
    required_error: "Pilih kebijakan pengumpulan tugas",
  }),
  forumPermission: z.enum(["full_access", "comment_only", "dosen_only"], {
    required_error: "Pilih izin forum kelas",
  }),
  commentPermission: z.enum(["active", "inactive"], {
    required_error: "Pilih izin komentar",
  }),
});

export type ClassPolicyFormData = z.infer<typeof classPolicySchema>;
