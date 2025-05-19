"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSpecialMessage, getUsers } from "@/app/actions/special-messages"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X } from "lucide-react"
import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessageCreated?: (message: any) => void
}

export function CreateMessageModal({ open, onOpenChange, onMessageCreated }: CreateMessageModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState("all")
  const [message, setMessage] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        const usersData = await getUsers()
        setUsers(usersData)
      }
      fetchUsers()
    } else {
      // Reset form when modal closes
      setMessageType("all")
      setMessage("")
      setSelectedUsers([])
      setSelectedFile(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    if (messageType === "particular" && selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", message)
      formData.append("isForAll", messageType === "all" ? "true" : "false")
      formData.append("recipientIds", JSON.stringify(selectedUsers.map((user) => user.id)))

      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      const result = await createSpecialMessage(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Message created successfully",
        })
        onOpenChange(false)
        if (onMessageCreated) {
          onMessageCreated({
            id: "temp-id",
            message,
            is_for_all: messageType === "all",
            recipient_ids: selectedUsers.map((user) => user.id),
            attachment_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
            created_at: new Date().toISOString(),
            users: { name: "You" },
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user && !selectedUsers.some((u) => u.id === userId)) {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleBrowseFiles = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Message</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="users">Users</Label>
            <RadioGroup value={messageType} onValueChange={setMessageType} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="particular" id="particular" />
                <Label htmlFor="particular">Particular Users</Label>
              </div>
            </RadioGroup>
          </div>

          {messageType === "particular" && (
            <div className="grid gap-2">
              <Label>Select Users</Label>
              <Select onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select users" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveUser(user.id)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label>Attachment</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Drag & Drop files here</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Supported format: .pdf, .jpg, .png, .video</p>
                <p className="text-xs text-gray-500 mt-1">Or</p>
                <Button variant="outline" size="sm" onClick={handleBrowseFiles} className="mt-2">
                  Browse Files
                </Button>
                {selectedFile && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-500">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
