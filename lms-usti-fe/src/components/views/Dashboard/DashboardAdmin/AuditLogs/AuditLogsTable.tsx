"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLogsTableProps {
  logs: IAuditLog[];
  pagination: PaginationInfo;
}

const limitOptions = [5, 10, 20, 50];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogsTable({ logs, pagination }: AuditLogsTableProps) {
  const router = useRouter();
  const { current, total_pages, total, limit } = pagination;

  const navigate = (page: number, newLimit?: number) => {
    const params = new URLSearchParams();
    params.set("limit", String(newLimit ?? limit));
    params.set("page", String(page));
    router.push(`/admin/audit?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="font-bold text-lg">Log Audit</CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">No</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Belum ada log audit
                      </TableCell>
                    </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.ID}>
                      <TableCell className="text-muted-foreground">
                        {(current - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{log.Title}</TableCell>
                      <TableCell>{log.Description}</TableCell>
                      <TableCell>{log.User?.fullname || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(log.CreatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
