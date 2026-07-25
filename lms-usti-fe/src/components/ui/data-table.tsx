"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-md border max-w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { sticky?: boolean; headerClassName?: string }
                  | undefined;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      meta?.sticky && "sticky left-0 z-10 bg-background",
                      meta?.headerClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | { sticky?: boolean; cellClassName?: string }
                    | undefined;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        meta?.sticky && "sticky left-0 z-10 bg-background",
                        meta?.cellClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {table.getFooterGroups().map((footerGroup) => (
          <TableFooter key={footerGroup.id}>
            <TableRow>
              {footerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { sticky?: boolean; footerClassName?: string }
                  | undefined;
                return (
                  <TableCell
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      meta?.sticky && "sticky left-0 z-10",
                      meta?.footerClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableFooter>
        ))}
      </Table>
    </div>
  )
}
