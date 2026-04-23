import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingDownIcon, TrendingUpIcon, UsersIcon } from "lucide-react"
import { topConductores } from "../data/mockData"

export const TopConductores = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          Top conductores
        </CardTitle>
        <CardDescription>Rendimiento vs. mes anterior</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-5">
        {topConductores.map((c, index) => (
          <div key={c.nombre}>
            <div className="flex items-center gap-3 py-3">
              {/* Avatar inicial */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {c.avatar}
              </div>

              {/* Nombre e ingresos */}
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="truncate text-sm font-medium">{c.nombre}</span>
                <span className="text-xs text-muted-foreground">
                  ${c.ingresos.toLocaleString("es-ES")} este mes
                </span>
              </div>

              {/* Tendencia */}
              <div
                className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
                  c.variacion >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {c.variacion >= 0 ? (
                  <TrendingUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDownIcon className="h-3.5 w-3.5" />
                )}
                {c.variacion >= 0 ? "+" : ""}
                {c.variacion}%
              </div>
            </div>
            {index < topConductores.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
