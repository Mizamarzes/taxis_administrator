import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrophyIcon } from "lucide-react"
import type { RankingItem } from "../types/dashboard.types"

const medalColors: Record<number, string> = {
  0: "text-yellow-500",
  1: "text-slate-400",
  2: "text-amber-600",
}

interface RankingTaxisProps {
  data: RankingItem[]
}

export const RankingTaxis = ({ data }: RankingTaxisProps) => {
  const maxIngresos = data.length > 0 ? data[0].ingresos : 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="h-4 w-4 text-yellow-500" />
          Ranking de taxis
        </CardTitle>
        <CardDescription>Top conductores por ingresos del periodo</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-5">
        {data.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Sin datos en el periodo
          </div>
        )}
        {data.map((taxi, index) => (
          <div key={taxi.id}>
            <div className="flex items-center gap-3 py-3">
              {/* Posición */}
              <span
                className={`w-5 shrink-0 text-center text-sm font-bold ${
                  medalColors[index] ?? "text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>

              {/* Info conductor */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{taxi.conductor}</span>
                  <span className="shrink-0 text-sm font-semibold">
                    ${taxi.ingresos.toLocaleString("es-ES")}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(taxi.ingresos / maxIngresos) * 100}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {taxi.tarifas} tarifas
                  </Badge>
                </div>
              </div>
            </div>
            {index < data.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
