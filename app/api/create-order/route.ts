import { NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const { amount, plan } = await req.json()

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${plan}_${Date.now()}`,
      notes: {
        plan: plan,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    )
  }
} 