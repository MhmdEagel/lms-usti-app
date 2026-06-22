"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CreateUserDialog from "./CreateUserDialog/CreateUserDialog";

const roleBadgeStyles: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  DOSEN: "bg-blue-100 text-blue-700 border-blue-200",
  MAHASISWA: "bg-green-100 text-green-700 border-green-200",
  PRODI: "bg-purple-100 text-purple-700 border-purple-200",
};

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
  pagination: PaginationInfo;
}

const limitOptions = [5, 10, 20, 50];

export default function UserTable({ users, pagination }: UserTableProps) {
  const router = useRouter();
  const { current, total_pages, total, limit } = pagination;

  const navigate = (page: number, newLimit?: number) => {
    const params = new URLSearchParams();
    params.set("limit", String(newLimit ?? limit));
    params.set("page", String(page));
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total: {total} pengguna
        </p>
        <CreateUserDialog onSuccess={() => router.refresh()} />
      </div>
      <Card>
        <CardHeader className="font-bold text-lg">Tabel User</CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Baris per halaman</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => navigate(1, Number(v))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current <= 1}
              onClick={() => navigate(current - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <span className="text-sm text-muted-foreground">
              {current} dari {total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= total_pages}
              onClick={() => navigate(current + 1)}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
      </div>
    </div>
  );
}
