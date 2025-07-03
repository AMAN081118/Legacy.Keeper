import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET - Fetch all blogs
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error in GET /api/blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
