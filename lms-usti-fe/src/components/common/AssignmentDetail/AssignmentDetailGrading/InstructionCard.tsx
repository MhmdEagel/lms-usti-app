import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PropTypes {
  instruction?: string | null;
}

export default function InstructionCard({ instruction }: PropTypes) {
  return (
    <Card>
      <CardHeader className="border-b-2 pb-2">
        <div className="text-base md:text-xl font-bold">
          Instruksi / Petunjuk
        </div>
      </CardHeader>
      <CardContent>
        {instruction ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(instruction),
            }}
          />
        ) : (
          <div className="text-gray-500 text-center py-4">
            Tidak ada instruksi
          </div>
        )}
      </CardContent>
    </Card>
  );
}
