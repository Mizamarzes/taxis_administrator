import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangeFilterProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false)

  const hasRange = value?.from || value?.to

  const label = React.useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, "dd MMM yyyy", { locale: es })} – ${format(value.to, "dd MMM yyyy", { locale: es })}`
    }
    if (value?.from) {
      return `Desde ${format(value.from, "dd MMM yyyy", { locale: es })}`
    }
    return "Filtrar por fecha"
  }, [value])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasRange ? "default" : "outline"}
          size="sm"
          className="h-9 gap-2 text-sm"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">Fecha</span>
          {hasRange && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="ml-1 rounded-full hover:bg-white/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={value?.from ?? new Date()}
          selected={value}
          onSelect={(range) => {
            onChange(range)
            if (range?.from && range?.to) {
              setOpen(false)
            }
          }}
          numberOfMonths={2}
          disabled={(date) => date > new Date()}
          locale={es}
        />
        {hasRange && (
          <div className="border-t p-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
            >
              Limpiar filtro
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
