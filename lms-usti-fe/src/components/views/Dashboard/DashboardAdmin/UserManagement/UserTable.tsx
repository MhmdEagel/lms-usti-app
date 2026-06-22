"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roleConfig: Record<string, { label: string; style: string }> = {
  DOSEN: {
    label: "Dosen",
    style: "border-l-blue-500",
  },
  MAHASISWA: {
    label: "Mahasiswa",
    style: "border-l-green-500",
  },
  PRODI: {
    label: "Prodi",
    style: "border-l-purple-500",
  },
  ADMIN: {
    label: "Admin",
    style: "border-l-red-500",
  },
};

const roleBadgeStyles: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  DOSEN: "bg-blue-100 text-blue-700 border-blue-200",
  MAHASISWA: "bg-green-100 text-green-700 border-green-200",
  PRODI: "bg-purple-100 text-purple-700 border-purple-200",
};

const roleOrder = ["DOSEN", "MAHASISWA", "PRODI", "ADMIN"];

const columns: ColumnDef<IUser>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "fullname",
    header: "Nama Lengkap",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("fullname")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role: string = row.getValue("role");
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            roleBadgeStyles[role] || "bg-gray-100 text-gray-700 border-gray-200"
          )}
        >
          {role}
        </span>
      );
    },
  },
];

interface UserTableProps {
  users: IUser[];
}

export default function UserTable({ users }: UserTableProps) {
  const grouped = roleOrder
    .map((role) => ({
      role,
      label: roleConfig[role]?.label || role,
      style: roleConfig[role]?.style || "",
      data: users.filter((u) => u.role === role),
    }))
    .filter((g) => g.data.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <Card key={group.role} className={cn("border-l-4", group.style)}>
          <CardHeader>
            <CardTitle className="text-base">{group.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={group.data} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
