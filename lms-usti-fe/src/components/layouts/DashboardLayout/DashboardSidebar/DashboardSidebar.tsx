"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarItem } from "@/types/Dashboard";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/actions/logout";
import { DashboardUserNav } from "./DashboardUserNav/DashboardUserNav";

interface PropTypes {
  user?: {
    id: string;
    email: string;
    role: "MAHASISWA" | "DOSEN" | "ADMIN" | "PRODI";
    fullname?: string;
    profile?: string;
  };
  sidebarItems?: SidebarItem[];
}

const GROUP_ORDER = ["UTAMA", "PEMBELAJARAN", "KOMUNIKASI", "SISTEM"];
const GROUP_LABELS: Record<string, string> = {
  UTAMA: "Utama",
  PEMBELAJARAN: "Pembelajaran",
  KOMUNIKASI: "Komunikasi",
  SISTEM: "Sistem",
};

export default function DashboardSidebar(props: PropTypes) {
  const { sidebarItems, user } = props;
  const pathname = usePathname();
  const url = `/${pathname.split("/").filter(Boolean).slice(0, 2).join("/")}`;

  const handleLogout = async () => {
    await logoutUser();
  };

  const hasGroups = sidebarItems?.some((item) => item.group);

  return (
    <Sidebar>
      <SidebarHeader className="mb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div>
                <Image
                  width={30}
                  height={30}
                  alt="Logo USTI"
                  src={"/images/general/logo_usti.svg"}
                />
                <span className="text-lg font-semibold text-primary">
                  LMS USTI
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {hasGroups
          ? GROUP_ORDER.map((group) => {
              const groupItems = sidebarItems?.filter((item) => item.group === group);
              if (!groupItems || groupItems.length === 0) return null;
              return (
                <SidebarGroup key={group}>
                  <SidebarGroupLabel>{GROUP_LABELS[group]}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {groupItems.map((item) => (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton
                            className={cn({
                              "bg-blue-900 hover:bg-blue-900/95 text-white hover:text-white":
                                url === item.href,
                            })}
                            asChild
                          >
                            <a href={item.href}>
                              {item.icon}
                              <span>{item.label}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })
          : sidebarItems && (
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      className={cn({
                        "bg-blue-900 hover:bg-blue-900/95 text-white hover:text-white":
                          url === item.href,
                      })}
                      asChild
                    >
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
      </SidebarContent>
      <SidebarFooter>
        <DashboardUserNav
          user={{ avatar: user?.profile || "", name: user?.fullname, email: user?.email }}
          userRole={user?.role}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
