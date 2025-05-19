"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditBusinessPlanModal } from "./edit-business-plan-modal"
import { DeleteBusinessPlanModal } from "./delete-business-plan-modal"
import { ViewBusinessPlanModal } from "./view-business-plan-modal"
import { Download } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import type { BusinessPlan } from "@/lib/supabase/database.types"

interface BusinessPlansTableProps {
  businessPlans: BusinessPlan[]
  error: string | null
}

export function BusinessPlansTable({ businessPlans, error }: BusinessPlansTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter business plans based on search term
  const filteredBusinessPlans = businessPlans.filter((plan) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      plan.business_name.toLowerCase().includes(searchTermLower) ||
      plan.business_type.toLowerCase().includes(searchTermLower) ||
      (plan.succession_plans && plan.succession_plans.toLowerCase().includes(searchTermLower))
    )
  })

  // Paginate business plans
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBusinessPlans = filteredBusinessPlans.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBusinessPlans.length / itemsPerPage)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (error) {
    return <div className="text-red-500">Error loading business plans: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Business name</th>
                <th className="text-left p-3 font-medium">Business Type and Owner</th>
                <th className="text-left p-3 font-medium">Own ship percentage</th>
                <th className="text-left p-3 font-medium">Invested Amount</th>
                <th className="text-left p-3 font-medium">Succession plans and notes</th>
                <th className="text-center p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBusinessPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-muted-foreground">
                    No business plans found
                  </td>
                </tr>
              ) : (
                currentBusinessPlans.map((plan) => (
                  <tr key={plan.id} className="border-t">
                    <td className="p-3">{plan.business_name}</td>
                    <td className="p-3">{plan.business_type}</td>
                    <td className="p-3">{plan.ownership_percentage || "-"}</td>
                    <td className="p-3">{formatCurrency(plan.investment_amount)}</td>
                    <td className="p-3">{plan.succession_plans || "-"}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <ViewBusinessPlanModal businessPlan={plan} />
                        <EditBusinessPlanModal businessPlan={plan} />
                        <DeleteBusinessPlanModal businessPlanId={plan.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBusinessPlans.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBusinessPlans.length)} of{" "}
            {filteredBusinessPlans.length} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
