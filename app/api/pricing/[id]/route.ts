import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SinglePricingResponse } from "@/types/pricing";

// GET - Fetch single pricing plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<SinglePricingResponse | { error: string }>> {
  try {
    const supabase = createAdminClient();

    const { data: pricing, error } = await supabase
      .from("pricing_plan")
      .select("*")
      .eq("id", params.id)
      .eq("is_active", true) // Only fetch active plans
      .single();

    if (error) {
      console.error("Error fetching pricing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pricing) {
      return NextResponse.json(
        { error: "Pricing plan not found" },
        { status: 404 },
      );
    }

    // Ensure we return the correct format
    const response: SinglePricingResponse = {
      pricing,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/pricing/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
