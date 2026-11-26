import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { EarningDay } from "../types/dashboard.types"

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("es-ES")}`

interface GananciasChartProps {
  data: EarningDay[]
}

export const GananciasChart = ({ data }: GananciasChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganancias por día</CardTitle>
        <CardDescription>
          Ingresos y cantidad de tarifas en el periodo seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Sin datos en el periodo
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="fecha"
              tickFormatter={(value: string) => format(parseISO(value), "dd MMM", { locale: es })}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="ingresos"
              orientation="left"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="tarifas"
              orientation="right"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              className="fill-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              labelFormatter={(label) =>
                label ? format(parseISO(String(label)), "dd MMM yyyy", { locale: es }) : ""
              }
              formatter={(value, name) =>
                name === "ingresos" ? [formatCurrency(value as number), "Ingresos"] : [value, "Tarifas"]
              }
              contentStyle={{
                borderRadius: "8px",
                fontSize: "13px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              itemStyle={{ color: "var(--foreground)" }}
            />
            <Legend
              formatter={(value) => (value === "ingresos" ? "Ingresos" : "Tarifas")}
              wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
            />
            <Bar
              yAxisId="ingresos"
              dataKey="ingresos"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="tarifas"
              dataKey="tarifas"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
