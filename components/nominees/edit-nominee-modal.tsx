"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { updateNominee } from "@/app/actions/nominees"
import { X } from "lucide-react"

interface Nominee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  access_categories: string[]
  profile_photo_url: string | null
  government_id_url: string | null
}

interface EditNomineeModalProps {
  isOpen: boolean
  onClose: () => void
  nominee: Nominee
  onSuccess: () => void
}

export function EditNomineeModal({ isOpen, onClose, nominee, onSuccess }: EditNomineeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(nominee.profile_photo_url)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(nominee.access_categories || [])
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const [governmentIdMarkedForDelete, setGovernmentIdMarkedForDelete] = useState(false)
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null)

  useEffect(() => {
    if (isOpen) {
      setProfilePhotoPreview(nominee.profile_photo_url)
      setSelectedCategories(nominee.access_categories || [])
    }
  }, [isOpen, nominee])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("id", nominee.id)

      // Add selected categories to formData
      selectedCategories.forEach((category) => {
        formData.append("accessCategories", category)
      })

      // Handle government ID file upload or deletion
      if (governmentIdFile) {
        formData.append("governmentId", governmentIdFile)
      }
      if (governmentIdMarkedForDelete) {
        formData.append("deleteGovernmentId", "true")
      }

      const result = await updateNominee(formData)

      if (result.success) {
        toast({
          title: "Nominee updated",
          description: "The nominee has been updated successfully.",
        })
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: `Failed to update nominee: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update nominee: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const categories = ["Finance", "Family", "Financial Planning"]

  // Drag and drop handler
  const handleGovernmentIdDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setGovernmentIdFile(e.dataTransfer.files[0]);
      setGovernmentIdMarkedForDelete(false);
    }
  }, [])

  const handleGovernmentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGovernmentIdFile(file)
      setGovernmentIdMarkedForDelete(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Nominee</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nominee Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={nominee.name}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Id
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={nominee.email}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <input
                type="text"
                id="relationship"
                name="relationship"
                defaultValue={nominee.relationship || ""}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone No
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={nominee.phone || ""}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access to Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center px-3 py-1 rounded-md text-sm ${
                    selectedCategories.includes(category) ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                  } cursor-pointer`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {selectedCategories.includes(category) && <X className="ml-1 h-3 w-3" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview || "/placeholder.svg"}
                      alt="Profile Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  id="profilePhoto"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Files
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Government ID</label>
              <div
                className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative"
                onDrop={handleGovernmentIdDrop}
                onDragOver={e => e.preventDefault()}
              >
                {/* Show current document link and delete button if exists and not marked for delete */}
                {nominee.government_id_url && !governmentIdMarkedForDelete && !governmentIdFile && (
                  <div className="flex items-center space-x-2 mb-2">
                    <a
                      href={nominee.government_id_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Document
                    </a>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => setGovernmentIdMarkedForDelete(true)}
                      title="Delete attached document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* Show file name if new file is selected */}
                {governmentIdFile && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-green-700">{governmentIdFile.name}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => setGovernmentIdFile(null)}
                      title="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* Drag and drop/upload UI */}
                <label
                  htmlFor="governmentId"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 py-2 px-3 border border-gray-300 shadow-sm text-xs"
                >
                  <span>{governmentIdFile ? "Replace file" : "Upload a file"}</span>
                  <input
                    id="governmentId"
                    name="governmentId"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleGovernmentIdChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, JPG, JPEG up to 10MB. Drag and drop to upload or click to select.</p>
                {/* Hidden input to signal deletion on submit */}
                {governmentIdMarkedForDelete && <input type="hidden" name="deleteGovernmentId" value="true" />}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
