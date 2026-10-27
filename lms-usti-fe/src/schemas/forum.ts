import { z } from "zod";

export const createForumPostSchema = z.object({
  title: z.string({ required_error: "Judul harus diisi" }),
  content: z.string().optional(),
});

export type CreateForumPostForm = z.infer<typeof createForumPostSchema>;
