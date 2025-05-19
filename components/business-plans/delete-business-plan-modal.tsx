"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteBusinessPlan } from "@/app/actions/business-plans"
import { useToast } from "@/components/ui/use-toast"

interface DeleteBusinessPlanModalProps {
  businessPlanId: string
}

export function DeleteBusinessPlanModal({ businessPlanId }: DeleteBusinessPlanModalProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteBusinessPlan(businessPlanId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Business plan deleted successfully",
        })
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete business plan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting business plan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Business Plan</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>Are you sure you want to delete this business plan? This action cannot be undone.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
