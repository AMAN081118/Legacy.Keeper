"use client"

import { useState } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditHealthConditionModal } from "./edit-health-condition-modal"
import { deleteHealthCondition } from "@/app/actions/health-conditions"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface HealthConditionActionsProps {
  condition: {
    id: string
    health_record_id: string
    condition_name: string
    doctor_name: string | null
    visit_date: string | null
    description: string | null
    attachment_url: string | null
  }
}

export function HealthConditionActions({ condition }: HealthConditionActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteHealthCondition(condition.id, condition.health_record_id)
      toast({
        title: "Success",
        description: "Health condition deleted successfully",
      })
      setIsDeleteDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting health condition:", error)
      toast({
        title: "Error",
        description: "Failed to delete health condition",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsViewDialogOpen(true)}
          aria-label="View condition details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <EditHealthConditionModal
          condition={condition}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit condition">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700"
          onClick={() => setIsDeleteDialogOpen(true)}
          aria-label="Delete condition"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{condition.condition_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {condition.doctor_name && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                <p>{condition.doctor_name}</p>
              </div>
            )}
            {condition.visit_date && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Visit Date</h4>
                <p>{new Date(condition.visit_date).toLocaleDateString()}</p>
              </div>
            )}
            {condition.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="whitespace-pre-wrap">{condition.description}</p>
              </div>
            )}
            {condition.attachment_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Attachment</h4>
                <a
                  href={condition.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Health Condition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this health condition? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 