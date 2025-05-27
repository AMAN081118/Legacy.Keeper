"use client"

import type React from "react"

import { useState, useRef } from "react"
import { UploadCloud, Loader2 } from "lucide-react"
import { uploadFile } from "@/app/actions/upload"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "./ui/use-toast"

interface FileUploadProps {
  bucket?: string
  onUploadComplete?: (url: string) => void
  onFileChange?: (file: File | null) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({
  bucket = "deposits-investments",
  onUploadComplete,
  onFileChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update file name for display
    setFileName(file.name)

    // If onFileChange is provided, call it with the file
    if (onFileChange) {
      onFileChange(file)
      return
    }

    // Otherwise, proceed with upload
    if (onUploadComplete) {
      await uploadFileToServer(file)
    }
  }

  const uploadFileToServer = async (file: File) => {
    if (!bucket) {
      toast({
        title: "Upload Error",
        description: "Missing bucket configuration",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Ensure bucket exists before upload
      const bucketExists = await ensureBucketExists(bucket)
      if (!bucketExists) {
        throw new Error(`Storage bucket "${bucket}" is not available`)
      }

      setUploadProgress(30)

      // Generate a unique file ID
      const fileId = uuidv4()
      const fileExt = file.name.split(".").pop() || "file"
      const fileName = `${fileId}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      setUploadProgress(50)

      // Upload file
      const result = await uploadFile(bucket, filePath, fileBuffer, file.type)

      setUploadProgress(100)

      if (result.success && result.url) {
        if (onUploadComplete) {
          onUploadComplete(result.url)
        }
        toast({
          title: "Upload successful",
          description: "File has been uploaded successfully",
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error: any) {
      console.error("File upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        accept={accept}
      />
      <label htmlFor="file-upload" className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 mb-2 text-gray-500" />
                <p className="text-sm font-medium">Drag & Drop files here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                {fileName && <p className="text-xs mt-2 text-green-600">Selected: {fileName}</p>}
              </>
            )}
          </div>
        </div>
      </label>
    </div>
  )
}
