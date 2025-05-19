export type RequestStatus = "approved" | "rejected" | "pending"

export interface RequestData {
  id: string
  title: string
  email: string
  amount: string
  comment: string
  status: RequestStatus
  date: string
  userName: string
  transactionType: string
  details: string
  attachment: string
}

export interface FilterOptions {
  status: RequestStatus | "all"
  dateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
}
