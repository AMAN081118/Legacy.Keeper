"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Calendar, User, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface MessageCardProps {
  message: any
  onDelete: () => void
}

export function MessageCard({ message, onDelete }: MessageCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewAttachmentOpen, setIsViewAttachmentOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    onDelete()
    setIsDeleteDialogOpen(false)
  }

  const handleDownload = () => {
    if (message.attachment_url) {
      // Create a temporary anchor element
      const link = document.createElement("a")
      link.href = message.attachment_url
      link.target = "_blank"
      link.download = message.attachment_url.split("/").pop() || "attachment"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast({
        title: "Error",
        description: "No attachment available to download",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                {message.users?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium">{message.users?.name || "Unknown User"}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(message.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {message.is_for_all ? (
                <div className="flex items-center text-sm text-gray-500 mr-2">
                  <Users className="h-4 w-4 mr-1" />
                  <span>All Users</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500 mr-2">
                  <User className="h-4 w-4 mr-1" />
                  <span>Specific Users</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap">{message.message}</div>
        </CardContent>
        {message.attachment_url && (
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-gray-500">Attachment available</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsViewAttachmentOpen(true)}>
                View
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardFooter>
        )}
        <CardFooter className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this message? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attachment Dialog */}
      {message.attachment_url && (
        <Dialog open={isViewAttachmentOpen} onOpenChange={setIsViewAttachmentOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Attachment</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[70vh] overflow-auto">
              {message.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img
                  src={message.attachment_url || "/placeholder.svg"}
                  alt="Attachment"
                  className="max-w-full h-auto mx-auto"
                />
              ) : message.attachment_url.match(/\.(pdf)$/i) ? (
                <iframe src={message.attachment_url} className="w-full h-[60vh]" title="PDF Viewer" />
              ) : (
                <div className="text-center py-8">
                  <p>This file type cannot be previewed.</p>
                  <Button className="mt-4" onClick={handleDownload}>
                    Download File
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAttachmentOpen(false)}>
                Close
              </Button>
              <Button onClick={handleDownload}>Download</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
