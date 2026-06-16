import { DollarSignIcon, ReceiptIcon } from "lucide-react"
import { KpiCard } from "./components/KpiCard"
import { GananciasChart } from "./components/GananciasChart"
import { RankingTaxis } from "./components/RankingTaxis"
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
        />
        <KpiCard
          title="Total tarifas aplicadas"
          value={kpiData.totalTarifas}
          subtitle={`${kpiData.tarifasHoy} tarifas hoy`}
          icon={ReceiptIcon}
        />
      </div>

      {/* Gráfica de barras */}
      <GananciasChart />

      {/* Ranking de taxis */}
      <RankingTaxis />
    </div>
  )
}

export default Dashboard;
