export interface Transaction {
  id: number
  date: string
  type: "income" | "expense"
  amount: number
  description: string | null
  category: {
    id: number
    name: string
  }
}
