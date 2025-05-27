"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateMessageModal } from "./create-message-modal"
import { MessageCard } from "./message-card"
import { EmptyState } from "./empty-state"
import { getSpecialMessages, deleteSpecialMessage } from "@/app/actions/special-messages"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SpecialMessagesClient() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState("5")
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(messages.length / Number(itemsPerPage))
  const startIndex = (currentPage - 1) * Number(itemsPerPage)
  const endIndex = startIndex + Number(itemsPerPage)
  const currentMessages = messages.slice(startIndex, endIndex)

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const data = await getSpecialMessages()
      if (Array.isArray(data)) {
        setMessages(data)
      } else {
        console.error("Error fetching messages:", data.error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (id: string) => {
    try {
      const result = await deleteSpecialMessage(id)
      if (result.success) {
        setMessages(messages.filter((message) => message.id !== id))
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleMessageCreated = (newMessage: any) => {
    setMessages([newMessage, ...messages])
    // Refresh messages to get the actual data from the server
    fetchMessages()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Special Message</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#0a2642] hover:bg-[#0a2642]/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Message
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState onCreateMessage={() => setIsCreateModalOpen(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {currentMessages.map((message) => (
              <MessageCard key={message.id} message={message} onDelete={() => handleDeleteMessage(message.id)} />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row mt-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, messages.length)} of {messages.length} entries
              </p>
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              {totalPages > 5 && <span>...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <CreateMessageModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onMessageCreated={handleMessageCreated}
      />
    </div>
  )
}
