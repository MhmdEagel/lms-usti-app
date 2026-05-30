import { cn } from "@/lib/utils";

export default function NavbarItem({
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
      className={cn("p-3 rounded-xl min-w-[220px] max-w-[220px] cursor-pointer", {
        "bg-accent border-r-3 border-primary": isActiveNavbar === lable,
      })}
    >
      <div className="font-bold text-sm">{lable}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}