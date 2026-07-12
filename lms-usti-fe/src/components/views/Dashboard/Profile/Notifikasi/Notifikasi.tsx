import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Notifikasi() {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
        <h3 className="text-sm md:text-base font-bold text-primary">
          Notifikasi
        </h3>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Fitur notifikasi akan segera tersedia.
        </p>
      </CardContent>
    </Card>
  );
}
