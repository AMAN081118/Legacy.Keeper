"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateMessageModal } from "./create-message-modal"
import { MessageCard } from "./message-card"
import { EmptyState } from "./empty-state"
import { getSpecialMessages, deleteSpecialMessage } from "@/app/actions/special-messages"
import { useToast } from "@/components/ui/use-toast"

export function SpecialMessagesClient() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

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
        <div className="grid grid-cols-1 gap-6">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} onDelete={() => handleDeleteMessage(message.id)} />
          ))}
        </div>
      )}

      <CreateMessageModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onMessageCreated={handleMessageCreated}
      />
    </div>
  )
}
