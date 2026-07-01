import z from "zod";

const AttachmentSchema = z.object({
  name: z.string(),
  type: z.enum(["FILE", "LINK"]),
  url: z.string(),
  unique_name: z.string(),
});

export const createAssignmentSchema = z.object({
  title: z.string({ required_error: "Judul harus diisi" }),
  deadline: z.string().nullable().optional(),
  instruction: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "" || val === "<p><br></p>") {
        return null;
      }
      return val;
    })
    .nullable()
    .optional(),
  attachments: z.array(AttachmentSchema).optional(),
});
