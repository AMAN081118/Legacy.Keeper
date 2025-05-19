import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Use admin client to bypass RLS policies
    const supabase = createAdminClient()

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    // If the bucket already exists, return success
    if (buckets?.some((bucket) => bucket.name === "user_documents")) {
      return NextResponse.json({ success: true, message: "Bucket already exists" })
    }

    // Try to create the bucket with admin privileges
    const { data, error } = await supabase.storage.createBucket("user_documents", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Bucket created successfully" })
  } catch (error: any) {
    console.error("Error setting up storage:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
