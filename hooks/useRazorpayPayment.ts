import { useState } from "react";

interface RazorpayPaymentArgs {
  plan: string;
  price: number | string;
  currency: string;
  userProfile: { name?: string; email?: string; phone?: string } | null;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function useRazorpayPayment({
  plan,
  price,
  currency,
  userProfile,
  onSuccess,
  onError,
}: RazorpayPaymentArgs) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject("Razorpay SDK failed to load");
      document.body.appendChild(script);
    });
  };

  const startPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadRazorpayScript();
      const response = await fetch("/registration/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, price: Number(price), currency }),
      });
      const data = await response.json();
      if (!data.success) {
        setError("Failed to create order");
        setLoading(false);
        return;
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "Legacy Keeper",
        description: `Subscribe to ${plan} plan`,
        order_id: data.orderId,
        handler: function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          setVerifying(true);
          setError(null);
          fetch("/registration/api", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan: plan,
            }),
          })
            .then((res) => res.json())
            .then((verifyData) => {
              setVerifying(false);
              if (verifyData.success) {
                setShowThankYou(true);
                if (onSuccess) onSuccess();
              } else {
                setError(
                  "Payment verification failed. Please contact support.",
                );
                if (onError)
                  onError(
                    "Payment verification failed. Please contact support.",
                  );
              }
            })
            .catch(() => {
              setVerifying(false);
              setError("Error verifying payment. Please try again.");
              if (onError)
                onError("Error verifying payment. Please try again.");
            });
        },
        prefill: {
          name: userProfile?.name || "",
          email: userProfile?.email || "",
          contact: userProfile?.phone || "",
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: function () {
            setError(
              "Payment popup closed. If you didn't complete payment, please try again.",
            );
            if (onError)
              onError(
                "Payment popup closed. If you didn't complete payment, please try again.",
              );
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      if (onError) onError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    startPayment,
    loading,
    verifying,
    error,
    showThankYou,
    setShowThankYou,
  };
}
