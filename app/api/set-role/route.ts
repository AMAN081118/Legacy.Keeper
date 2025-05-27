import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  console.log('[Debug] Setting role in cookie:', role);
  
  if (!role) {
    console.error('[Debug] No role provided in request');
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }
  
  // Set cookie for role (expires in 7 days)
  const response = new NextResponse(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Set-Cookie": `currentRole=${encodeURIComponent(JSON.stringify(role))}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; HttpOnly`,
        "Content-Type": "application/json"
      },
    }
  );
  
  console.log('[Debug] Role cookie set successfully');
  return response;
}
