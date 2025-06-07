import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, creation_date, lawyer_name, lawyer_number, description, attachment_url } = body;
    if (!title || !creation_date) {
      return NextResponse.json({ error: "Title and creation date are required." }, { status: 400 });
    }
    const supabase = createServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user_id = session.user.id;
    const { error: insertError } = await supabase.from("wills").insert({
      user_id,
      title,
      creation_date,
      lawyer_name,
      lawyer_number,
      description,
      attachment_url: attachment_url || null,
    });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 