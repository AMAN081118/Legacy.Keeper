// app/registration/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface OrderRequestBody {
  plan: string;
  price: number;
  currency: string;
}

export async function POST(req: NextRequest) {
  const start = process.hrtime(); // Start timing
  try {
    const body: OrderRequestBody = await req.json();

    //  Validate inputs
    if (!body.plan || typeof body.plan !== "string") {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    if (!body.price || typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 },
      );
    }

    if (!body.currency || typeof body.currency !== "string") {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 },
      );
    }

    // Prepare Razorpay order
    const options = {
      amount: Math.round(body.price * 100), // Convert to paise
      currency: body.currency,
      receipt: `receipt_${body.plan}_${Date.now()}`,
      notes: {
        plan: body.plan,
      },
    };

    const order = await razorpay.orders.create(options);

    // Performance log
    const [sec, nano] = process.hrtime(start);
    const ms = (sec * 1e3 + nano / 1e6).toFixed(2);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Performance] /registration/route.ts: order creation took ${ms}ms`,
      );
    }

    // Return order info to frontend
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const [sec, nano] = process.hrtime(start);
    const ms = (sec * 1e3 + nano / 1e6).toFixed(2);
    console.error(
      `[RAZORPAY_ERROR] [Performance] /registration/route.ts: failed after ${ms}ms`,
      error?.stack || error,
    );
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 },
    );
  }
}

// POST /registration/verify-payment
export async function PATCH(req: NextRequest) {
  const start = process.hrtime();
  try {
    const { order_id, payment_id, signature, plan } = await req.json();

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 },
      );
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    const isValid = generated_signature === signature;

    const [sec, nano] = process.hrtime(start);
    const ms = (sec * 1e3 + nano / 1e6).toFixed(2);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Performance] /registration/route.ts: payment verification took ${ms}ms`,
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // Get current user
    const cookieStore = cookies();
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Calculate subscription dates based on plan
    const startDate = new Date();
    const endDate = new Date();

    // Set end date based on plan (you can customize this logic)
    if (plan.toLowerCase().includes("monthly")) {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (
      plan.toLowerCase().includes("yearly") ||
      plan.toLowerCase().includes("annual")
    ) {
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      // Default to 1 year for other plans
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    // Insert subscription record
    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_email: user.email,
      plan_type: plan,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: "active",
      payment_id: payment_id,
      auto_renewal: false, // Default to false, can be updated later
    });

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      return NextResponse.json(
        { error: "Failed to record subscription" },
        { status: 500 },
      );
    }

    // Update user's subscription_status
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ subscription_status: plan })
      .eq("id", user.id);

    if (userUpdateError) {
      console.error(
        "Error updating user subscription_status:",
        userUpdateError,
      );
      // Do not fail the request, just log the error
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const [sec, nano] = process.hrtime(start);
    const ms = (sec * 1e3 + nano / 1e6).toFixed(2);
    console.error(
      `[PAYMENT_VERIFY_ERROR] [Performance] /registration/route.ts: failed after ${ms}ms`,
      error?.stack || error,
    );
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
