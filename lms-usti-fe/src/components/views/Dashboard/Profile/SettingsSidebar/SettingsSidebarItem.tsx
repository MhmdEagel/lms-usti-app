import { cn } from "@/lib/utils";

export default function SettingsSidebarItem({
  lable,
  description,
  isActiveNavbar,
  handleClick,
}: {
  lable: string;
  description: string;
  isActiveNavbar: string;
  handleClick: (identifier: string) => void;
}) {
  return (
    <div
      onClick={() => handleClick(lable)}
      className={cn("p-2 md:p-3 rounded-xl md:min-w-[220px] md:max-w-[220px] cursor-pointer whitespace-nowrap md:whitespace-normal shrink-0", {
        "bg-accent md:border-r-3 md:border-primary border-b-2 border-primary md:border-b-0": isActiveNavbar === lable,
      })}
    >
      <div className="font-bold text-sm">{lable}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
