"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Create a bucket for family documents if it doesn't exist
async function ensureFamilyDocumentsBucket() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketName = "family-documents"

    if (!buckets?.find((bucket) => bucket.name === bucketName)) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        console.error("Error creating family documents bucket:", error)
        return { success: false, error: "Failed to create storage bucket" }
      }
    }

    return { success: true, bucketName }
  } catch (error) {
    console.error("Error ensuring family documents bucket:", error)
    return { success: false, error: "Failed to ensure storage bucket" }
  }
}

// Get all family members for the current user
export async function getFamilyMembers() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching family members:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getFamilyMembers:", error)
    return { success: false, error: "Failed to fetch family members" }
  }
}

// Get a specific family member by ID
export async function getFamilyMember(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching family member:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getFamilyMember:", error)
    return { success: false, error: "Failed to fetch family member" }
  }
}

// Add a new family member
export async function addFamilyMember(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    const memberName = formData.get("memberName") as string
    const contactNumber = formData.get("contactNumber") as string

    const { data, error } = await supabase
      .from("family_members")
      .insert({
        user_id: user.id,
        member_name: memberName,
        contact_number: contactNumber,
      })
      .select()

    if (error) {
      console.error("Error adding family member:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/family-vaults")
    return { success: true, data }
  } catch (error) {
    console.error("Error in addFamilyMember:", error)
    return { success: false, error: "Failed to add family member" }
  }
}

// Update an existing family member
export async function updateFamilyMember(id: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    const memberName = formData.get("memberName") as string
    const contactNumber = formData.get("contactNumber") as string

    const { data, error } = await supabase
      .from("family_members")
      .update({
        member_name: memberName,
        contact_number: contactNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Error updating family member:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/family-vaults")
    revalidatePath(`/dashboard/family-vaults/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateFamilyMember:", error)
    return { success: false, error: "Failed to update family member" }
  }
}

// Delete a family member
export async function deleteFamilyMember(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    // First, get all documents for this family member to delete their attachments
    const { data: documents } = await supabase
      .from("family_documents")
      .select("attachment_url")
      .eq("family_member_id", id)

    // Delete any document attachments from storage
    if (documents && documents.length > 0) {
      const bucketResult = await ensureFamilyDocumentsBucket()
      if (bucketResult.success) {
        for (const doc of documents) {
          if (doc.attachment_url) {
            const filePath = doc.attachment_url.split("/").pop()
            if (filePath) {
              await supabase.storage.from(bucketResult.bucketName).remove([filePath])
            }
          }
        }
      }
    }

    // Now delete the family member (cascade will delete documents)
    const { error } = await supabase.from("family_members").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting family member:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/family-vaults")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteFamilyMember:", error)
    return { success: false, error: "Failed to delete family member" }
  }
}

// Get all documents for a family member
export async function getFamilyDocuments(familyMemberId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    // First verify this family member belongs to the user
    const { data: familyMember, error: memberError } = await supabase
      .from("family_members")
      .select("id")
      .eq("id", familyMemberId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !familyMember) {
      console.error("Error verifying family member:", memberError)
      return { success: false, error: "Family member not found" }
    }

    const { data, error } = await supabase
      .from("family_documents")
      .select("*")
      .eq("family_member_id", familyMemberId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching family documents:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getFamilyDocuments:", error)
    return { success: false, error: "Failed to fetch family documents" }
  }
}

// Add a new document for a family member
export async function addFamilyDocument(familyMemberId: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    // First verify this family member belongs to the user
    const { data: familyMember, error: memberError } = await supabase
      .from("family_members")
      .select("id")
      .eq("id", familyMemberId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !familyMember) {
      console.error("Error verifying family member:", memberError)
      return { success: false, error: "Family member not found" }
    }

    const documentTitle = formData.get("documentTitle") as string
    const documentCategory = formData.get("documentCategory") as string
    const documentDate = formData.get("documentDate") as string
    const description = formData.get("description") as string
    const attachment = formData.get("attachment") as File

    let attachmentUrl = null

    // Upload attachment if provided
    if (attachment && attachment.size > 0) {
      const bucketResult = await ensureFamilyDocumentsBucket()
      if (!bucketResult.success) {
        return { success: false, error: "Failed to ensure storage bucket" }
      }

      const fileExt = attachment.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketResult.bucketName)
        .upload(fileName, attachment)

      if (uploadError) {
        console.error("Error uploading document:", uploadError)
        return { success: false, error: "Failed to upload document" }
      }

      const { data: urlData } = supabase.storage.from(bucketResult.bucketName).getPublicUrl(fileName)

      attachmentUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from("family_documents")
      .insert({
        family_member_id: familyMemberId,
        document_title: documentTitle,
        document_category: documentCategory || null,
        document_date: documentDate || null,
        description: description || null,
        attachment_url: attachmentUrl,
      })
      .select()

    if (error) {
      console.error("Error adding family document:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/family-vaults/${familyMemberId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in addFamilyDocument:", error)
    return { success: false, error: "Failed to add family document" }
  }
}

// Update an existing document
export async function updateFamilyDocument(documentId: string, familyMemberId: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    // First verify this family member belongs to the user
    const { data: familyMember, error: memberError } = await supabase
      .from("family_members")
      .select("id")
      .eq("id", familyMemberId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !familyMember) {
      console.error("Error verifying family member:", memberError)
      return { success: false, error: "Family member not found" }
    }

    const documentTitle = formData.get("documentTitle") as string
    const documentCategory = formData.get("documentCategory") as string
    const documentDate = formData.get("documentDate") as string
    const description = formData.get("description") as string
    const attachment = formData.get("attachment") as File

    // Get the current document to check if we need to replace the attachment
    const { data: currentDoc, error: docError } = await supabase
      .from("family_documents")
      .select("attachment_url")
      .eq("id", documentId)
      .eq("family_member_id", familyMemberId)
      .single()

    if (docError) {
      console.error("Error fetching current document:", docError)
      return { success: false, error: "Document not found" }
    }

    let attachmentUrl = currentDoc.attachment_url

    // Upload new attachment if provided
    if (attachment && attachment.size > 0) {
      const bucketResult = await ensureFamilyDocumentsBucket()
      if (!bucketResult.success) {
        return { success: false, error: "Failed to ensure storage bucket" }
      }

      // Delete old attachment if it exists
      if (attachmentUrl) {
        const oldFilePath = attachmentUrl.split("/").pop()
        if (oldFilePath) {
          await supabase.storage.from(bucketResult.bucketName).remove([oldFilePath])
        }
      }

      const fileExt = attachment.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from(bucketResult.bucketName).upload(fileName, attachment)

      if (uploadError) {
        console.error("Error uploading document:", uploadError)
        return { success: false, error: "Failed to upload document" }
      }

      const { data: urlData } = supabase.storage.from(bucketResult.bucketName).getPublicUrl(fileName)

      attachmentUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from("family_documents")
      .update({
        document_title: documentTitle,
        document_category: documentCategory || null,
        document_date: documentDate || null,
        description: description || null,
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .eq("family_member_id", familyMemberId)
      .select()

    if (error) {
      console.error("Error updating family document:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/family-vaults/${familyMemberId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateFamilyDocument:", error)
    return { success: false, error: "Failed to update family document" }
  }
}

// Delete a document
export async function deleteFamilyDocument(documentId: string, familyMemberId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirect("/login")
    }

    // First verify this family member belongs to the user
    const { data: familyMember, error: memberError } = await supabase
      .from("family_members")
      .select("id")
      .eq("id", familyMemberId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !familyMember) {
      console.error("Error verifying family member:", memberError)
      return { success: false, error: "Family member not found" }
    }

    // Get the document to delete its attachment
    const { data: document, error: docError } = await supabase
      .from("family_documents")
      .select("attachment_url")
      .eq("id", documentId)
      .eq("family_member_id", familyMemberId)
      .single()

    if (docError) {
      console.error("Error fetching document:", docError)
      return { success: false, error: "Document not found" }
    }

    // Delete the attachment if it exists
    if (document.attachment_url) {
      const bucketResult = await ensureFamilyDocumentsBucket()
      if (bucketResult.success) {
        const filePath = document.attachment_url.split("/").pop()
        if (filePath) {
          await supabase.storage.from(bucketResult.bucketName).remove([filePath])
        }
      }
    }

    // Delete the document record
    const { error } = await supabase
      .from("family_documents")
      .delete()
      .eq("id", documentId)
      .eq("family_member_id", familyMemberId)

    if (error) {
      console.error("Error deleting family document:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/family-vaults/${familyMemberId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in deleteFamilyDocument:", error)
    return { success: false, error: "Failed to delete family document" }
  }
}
