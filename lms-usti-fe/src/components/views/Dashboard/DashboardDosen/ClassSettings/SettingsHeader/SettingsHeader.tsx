import { cn } from "@/lib/utils";

interface PropTypes {
  title: string;
  description?: string;
  isDanger?: boolean;
}

export default function SettingsHeader({
  title,
  description,
  isDanger,
}: PropTypes) {
  return (
    <div className="border-b pb-4 mb-6">
      <h2
        className={cn("text-base md:text-xl font-semibold", {
          "text-destructive": isDanger,
        })}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
