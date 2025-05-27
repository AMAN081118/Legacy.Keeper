"use server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureSpecialMessageBucket() {
  const adminClient = createAdminClient();
  const bucketName = "special-message-document";

  // Check if the bucket exists
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
  if (bucketsError) {
    console.error("Error checking buckets:", bucketsError);
    return false;
  }
  if (buckets?.some((bucket) => bucket.name === bucketName)) {
    return true;
  }

  // Create the bucket if it doesn't exist
  const { error } = await adminClient.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 10485760, // 10MB
  });
  if (error) {
    console.error("Error creating special message bucket:", error);
    return false;
  }
  return true;
} 