import Link from "next/link";
import { MessageSquare, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProdiQuickActions() {
  return (
    <Card className="flex flex-col min-h-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          Aksi Cepat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <Link href="/prodi/forum" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2" size="lg">
            <MessageSquare size={20} />
            Kelola Forum Publik
          </Button>
        </Link>
        <Link href="/prodi/penjadwalan" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-2" size="lg">
            <Calendar size={20} />
            Kelola Jadwal Perkuliahan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
