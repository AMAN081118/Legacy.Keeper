import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ userId: data.id });
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const cookieStore = cookies()
    const supabase = createServerClient()

    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const user = users?.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ userId: user.id })
  } catch (error) {
    console.error("Error getting user ID by email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
