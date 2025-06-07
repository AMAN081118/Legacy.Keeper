import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();
    console.log('[Debug] Setting role in cookie:', role);
    
    if (!role) {
      console.error('[Debug] No role provided in request');
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Verify user is authenticated
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Set cookie for role (expires in 7 days)
    const response = new NextResponse(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `currentRole=${encodeURIComponent(JSON.stringify(role))}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; HttpOnly; Secure`,
          "Content-Type": "application/json"
        },
      }
    );
    
    console.log('[Debug] Role cookie set successfully');
    return response;
  } catch (error) {
    console.error('[Debug] Error setting role:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
