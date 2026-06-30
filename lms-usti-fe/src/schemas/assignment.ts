import z from "zod";

const RubricSchema = z.object({
  name: z.string({ required_error: "Nama rubrik harus diisi" }),
  score: z.string({ required_error: "Nilai harus diisi" }),
});

const AttachmentSchema = z.object({
  name: z.string(),
  type: z.enum(["FILE", "LINK"]),
  url: z.string(),
  unique_name: z.string(),
});

export const createAssignmentSchema = z.object({
  title: z.string({ required_error: "Judul harus diisi" }),
  deadline: z.string().optional(),
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
  rubrics: z.array(RubricSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});
