import z from "zod";

const RubricSchema = z.object({
  name: z.string({ required_error: "Nama rubrik harus diisi" }),
  score: z.string({ required_error: "Nilai harus diisi" }),
});

const FileSchema = z.object({
  file_name: z.string(),
  unique_file_name: z.string(),
  file_url: z.string(),
});

const LinkSchema = z.object({
  link_name: z.string(),
  link_url: z.string(),
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
  files: z.array(FileSchema).optional(),
  links: z.array(LinkSchema).optional()
});
