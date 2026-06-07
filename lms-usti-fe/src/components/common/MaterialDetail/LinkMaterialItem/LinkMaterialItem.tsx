import { Card, CardContent } from "@/components/ui/card";
import { IAttachment } from "@/types/Classroom";
import { LinkIcon } from "lucide-react";
import Link from "next/link";

export default function LinkMaterialItem({ linkMateri }: { linkMateri: IAttachment }) {
  return (
    <Link target="_blank" className="group" href={linkMateri.url}>
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="p-4  bg-accent rounded-full">
            <LinkIcon />
          </div>
          <div className="space-y-2">
            <div>
              <div className="font-bold text-gray-500 text-xs md:text-sm ">NAMA LINK</div>
              <div className="text-base md:text-lg max-w-[350px] truncate group-hover:underline group-hover:text-blue-700">
                {linkMateri.name}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-500 text-xs md:text-sm">TIPE</div>
              <div className="text-sm md:text-base">LINK</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
