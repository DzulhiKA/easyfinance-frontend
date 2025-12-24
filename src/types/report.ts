export interface TransactionReport {
  id: number
  date: string
  category: string
  type: "income" | "expense"
  amount: number
  description: string | null
}
