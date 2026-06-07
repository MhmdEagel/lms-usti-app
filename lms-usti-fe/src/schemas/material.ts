import z from "zod";

const AttachmentSchema = z.object({
  name: z.string(),
  type: z.enum(["FILE", "VIDEO", "LINK"]),
  url: z.string(),
  unique_name: z.string(),
  status: z.string().optional(),
});

export const createMaterialSchema = z.object({
  title: z.string({required_error: "Judul harus diisi"}),
  description: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "" || val === "<p><br></p>") {
        return null;
      }
      return val;
    })
    .nullable()
    .optional(),
  files: z.array(AttachmentSchema).optional(),
  links: z.array(AttachmentSchema).optional(),
});