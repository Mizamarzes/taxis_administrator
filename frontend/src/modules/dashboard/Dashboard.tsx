import { DollarSignIcon, ReceiptIcon } from "lucide-react"
import { KpiCard } from "./components/KpiCard"
import { GananciasChart } from "./components/GananciasChart"
import { RankingTaxis } from "./components/RankingTaxis"
import { TopConductores } from "./components/TopConductores"
import { kpiData } from "./data/mockData"

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          title="Total ingresos del mes"
          value={`$${kpiData.totalIngresos.toLocaleString("es-ES")}`}
          subtitle={`$${kpiData.ingresosHoy.toLocaleString("es-ES")} hoy`}
          icon={DollarSignIcon}
          trend={{ value: 8.2, label: "vs. mes anterior" }}
        />
        <KpiCard
          title="Total tarifas aplicadas"
          value={kpiData.totalTarifas}
          subtitle={`${kpiData.tarifasHoy} tarifas hoy`}
          icon={ReceiptIcon}
          trend={{ value: 4.5, label: "vs. mes anterior" }}
        />
      </div>

      {/* Gráfica de barras */}
      <GananciasChart />

      {/* Ranking + Top conductores */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RankingTaxis />
        <TopConductores />
      </div>
    </div>
  )
}

export default Dashboard;
