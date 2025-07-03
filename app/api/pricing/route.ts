import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PricingResponse } from "@/types/pricing";

// GET - Fetch all pricing plans
export async function GET(): Promise<
  NextResponse<PricingResponse | { error: string }>
> {
  try {
    const supabase = createAdminClient();

    const { data: pricing, error } = await supabase
      .from("pricing_plan")
      .select("*")
      .eq("is_active", true) // Only fetch active plans
      .order("sort_order", { ascending: true }) // Order by sort_order
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pricing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure we return the correct format
    const response: PricingResponse = {
      pricing: pricing || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/pricing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
