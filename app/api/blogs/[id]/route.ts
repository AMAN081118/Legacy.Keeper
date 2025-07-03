import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET - Fetch single blog by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createAdminClient();

    const { data: blog, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching blog:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error in GET /api/blogs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
