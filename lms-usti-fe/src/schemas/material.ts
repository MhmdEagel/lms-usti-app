import z from "zod";

const LinkSchema = z.object({
  link_name: z.string(),
  link_url: z.string(),
});

const FileSchema = z.object({
  file_name: z.string(),
  file_url: z.string(),
  unique_file_name: z.string(),
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
  files: z.array(FileSchema).optional(),
  links: z.array(LinkSchema).optional(),
});