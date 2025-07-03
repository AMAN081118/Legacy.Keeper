"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegistrationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan");
  const price = searchParams.get("price");
  const currency = searchParams.get("currency");

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();
  const {
    startPayment,
    loading: paymentLoading,
    verifying,
    error: paymentError,
    showThankYou,
    setShowThankYou,
  } = useRazorpayPayment({
    plan,
    price,
    currency,
    userProfile: profile,
    onSuccess: () => {
      setTimeout(() => {
        setShowThankYou(false);
        router.push("/dashboard");
      }, 2000);
    },
    onError: () => {},
  });

  const ThankYouModal = dynamic(() => import("@/components/ThankYouModal"), {
    ssr: false,
  });

  useEffect(() => {
    if (
      !plan ||
      !price ||
      !currency ||
      !profile ||
      profileLoading ||
      profileError
    )
      return;
    startPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, price, currency, profile, profileLoading, profileError]);

  if (!plan || !price || !currency) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Missing plan details in URL</div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (profileError) {
    if (profileError === "Not authenticated") {
      router.push(
        "/auth/login?redirect=/registration?plan=" +
          encodeURIComponent(plan) +
          "&price=" +
          encodeURIComponent(price) +
          "&currency=" +
          encodeURIComponent(currency),
      );
      return null;
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">{profileError}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {(paymentLoading || verifying) && (
        <div className="text-lg font-medium text-gray-600">
          {verifying ? "Verifying Payment..." : "Processing Payment..."}
        </div>
      )}
      {paymentError &&
        !paymentLoading &&
        !verifying &&
        (paymentError ===
        "Payment popup closed. If you didn't complete payment, please try again." ? (
          <div className="flex flex-col items-center justify-center w-full animate-fade-in-up">
            <Card className="max-w-md w-full border-yellow-300">
              <CardHeader className="flex flex-col items-center">
                <span className="mb-2">
                  <svg
                    className="w-10 h-10 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="#FEF3C7"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 8v4m0 4h.01"
                    />
                  </svg>
                </span>
                <CardTitle className="text-yellow-700">
                  Payment Not Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <p className="text-gray-700 mb-4 text-center">
                  Payment popup was closed. If you didn't complete payment,
                  please try again.
                </p>
                <Button onClick={startPayment} className="mb-2 w-full max-w-xs">
                  Retry Payment
                </Button>
                <a
                  href="/landing/pricing"
                  className="text-blue-700 underline text-sm hover:text-blue-900 mt-1"
                >
                  Back to Pricing
                </a>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-lg text-red-500">{paymentError}</div>
        ))}
      {!paymentLoading && !verifying && !paymentError && profile && null}
      {showThankYou && <ThankYouModal />}
    </div>
  );
}
