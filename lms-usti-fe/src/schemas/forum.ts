import { z } from "zod";

export const createForumPostSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().optional(),
});

export type CreateForumPostForm = z.infer<typeof createForumPostSchema>;
