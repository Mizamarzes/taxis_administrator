import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterPlaceholder?: string
  toolbarRight?: React.ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  pageCount?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterPlaceholder = "Buscar...",
  toolbarRight,
  searchValue,
  onSearchChange,
  pageCount,
  currentPage = 1,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [internalFilter, setInternalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])

  const isServerSearch = onSearchChange !== undefined
  const isServerPagination = onPageChange !== undefined

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: isServerSearch ? (searchValue ?? "") : internalFilter,
    },
    manualFiltering: isServerSearch,
    manualPagination: isServerPagination,
    pageCount: isServerPagination ? (pageCount ?? 1) : undefined,
    onSortingChange: setSorting,
    onGlobalFilterChange: isServerSearch ? onSearchChange : setInternalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const displayPage = isServerPagination ? currentPage : table.getState().pagination.pageIndex + 1
  const displayTotal = isServerPagination ? (pageCount ?? 1) : (table.getPageCount() || 1)
  const canPrev = isServerPagination ? currentPage > 1 : table.getCanPreviousPage()
  const canNext = isServerPagination ? currentPage < (pageCount ?? 1) : table.getCanNextPage()

  const handlePrev = () => {
    if (isServerPagination) {
      onPageChange(currentPage - 1)
    } else {
      table.previousPage()
    }
  }

  const handleNext = () => {
    if (isServerPagination) {
      onPageChange(currentPage + 1)
    } else {
      table.nextPage()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={filterPlaceholder}
            value={isServerSearch ? (searchValue ?? "") : internalFilter}
            onChange={(e) =>
              isServerSearch
                ? onSearchChange(e.target.value)
                : setInternalFilter(e.target.value)
            }
            className="pl-9"
          />
        </div>
        {toolbarRight}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay tarifas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          Página {displayPage} de {displayTotal}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canNext}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
