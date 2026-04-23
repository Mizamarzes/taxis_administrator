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
import { gananciasPorDia } from "../data/mockData"

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("es-ES")}`

export const GananciasChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganancias por día</CardTitle>
        <CardDescription>
          Ingresos y cantidad de tarifas de los últimos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={gananciasPorDia}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="dia"
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
              formatter={(value, name) =>
                name === "ingresos" ? [formatCurrency(value as number), "Ingresos"] : [value, "Tarifas"]
              }
              contentStyle={{
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Legend
              formatter={(value) => (value === "ingresos" ? "Ingresos" : "Tarifas")}
              wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
            />
            <Bar
              yAxisId="ingresos"
              dataKey="ingresos"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="tarifas"
              dataKey="tarifas"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              opacity={0.5}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
