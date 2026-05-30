import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface PropTypes {
  children: ReactNode;
}
export default function ErrorCard(props: PropTypes) {
  const { children } = props;
  return (
    <Card className="py-3 w-fit bg-red-100">
      <CardContent className="flex items-center gap-3  text-red-600 font-semibold">
        <div className="w-7 h-7 bg-red-600 text-xl rounded-full flex text-white justify-center items-center">
          &#33;
        </div>
        <span className="text-sm">{children}</span>
      </CardContent>
    </Card>
  );
}
