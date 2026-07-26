import { JSX } from "react";

interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon: JSX.Element;
  group?: string;
}

export type {SidebarItem};