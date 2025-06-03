import { NextRequest, NextResponse } from "next/server"
import { rejectTrusteeInvitation, rejectTrusteeInvitationFromSession } from "@/app/actions/trustees"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, trusteeId } = body

    let result

    if (token) {
      // Token-based approach (new system)
      result = await rejectTrusteeInvitation(token)
    } else if (trusteeId) {
      // Session-based approach (current system) - ignore trusteeId, use session
      result = await rejectTrusteeInvitationFromSession()
    } else {
      // Session-based approach without any parameters
      result = await rejectTrusteeInvitationFromSession()
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Trustee invitation rejected successfully"
    })
  } catch (error) {
    console.error("Error in trustee reject API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
