import { NextRequest, NextResponse } from "next/server"
import { getTrusteeOnboardingDetails } from "@/app/actions/trustees"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email parameter is required" },
        { status: 400 }
      )
    }

    const result = await getTrusteeOnboardingDetails(email)
    
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
    console.error("Error in trustee onboarding API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
