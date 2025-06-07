// Mark this route as dynamic
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getTrusteeOnboardingDetailsFromSession } from "@/app/actions/trustees"

export async function GET() {
  try {
    const result = await getTrusteeOnboardingDetailsFromSession()
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error("Error in trustee onboarding session API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
