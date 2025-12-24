export interface ChartItem {
  month: number
  income: number
  expense: number
}

export interface DashboardChartResponse {
  year: number
  data: ChartItem[]
}
