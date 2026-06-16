export interface DashboardKpis {
  totalIngresos: number
  totalTarifas: number
}

export interface EarningDay {
  fecha: string
  ingresos: number
  tarifas: number
}

export interface RankingItem {
  id: number
  conductor: string
  placa: string
  ingresos: number
  tarifas: number
}

export interface DashboardSummary {
  kpis: DashboardKpis
  gananciasPorDia: EarningDay[]
  ranking: RankingItem[]
}
