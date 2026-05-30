import { Card, CardContent } from "@/components/ui/card";
import { getFileExtension, getFileName } from "@/lib/utils";
import { IFileMaterial } from "@/types/Classroom";
import { File } from "lucide-react";
import Link from "next/link";

export default function FileMaterialItem({
  fileMateri,
}: {
  fileMateri: IFileMaterial;
}) {
  return (
    <Link href={fileMateri.file_url} target="_blank">
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="p-4  bg-accent rounded-full">
            <File />
          </div>
          <div className="space-y-2">
            <div>
              <div className="font-bold text-gray-500 text-xs md:text-sm">NAMA FILE</div>
              <div className="text-base md:text-lg">{getFileName(fileMateri.file_name)}</div>
            </div>
            <div>
              <div className="font-bold text-gray-500 text-xs md:text-sm">TIPE</div>
              <div className="text-sm md:text-base">{getFileExtension(fileMateri.file_url).toUpperCase()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
