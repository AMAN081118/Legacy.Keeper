"use client"
import { DebtsLoansHeader } from "@/components/debts-loans/debts-loans-header"

export default function DebtsLoansHeaderClient() {
  if (!DebtsLoansHeader) {
    console.error("DebtsLoansHeader is undefined!")
    return null
  }
  return <DebtsLoansHeader />
}
