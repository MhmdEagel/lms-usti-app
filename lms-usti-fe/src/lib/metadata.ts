import { MetaHeader } from "@/types/metadata";
import { Metadata } from "next";

export const createMetadata = ({
  title,
  description,
}: MetaHeader): Metadata => ({
  title,
  description:
    description ??
    "LMS USTI merupakan sistem manajemen pembelajaran yang dikhususkan untuk menunjang kegiatan akademik di kampus Universitas Sains Dan Teknologi Indonesia.",
});
