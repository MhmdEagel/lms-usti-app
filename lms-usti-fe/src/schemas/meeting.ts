import z from "zod";

export const createMeetingSchema = z.object({
  topic: z.string({ required_error: "Topik harus diisi" }).min(1, "Topik harus diisi"),
  description: z.string().optional(),
});
