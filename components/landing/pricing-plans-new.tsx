"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PricingPlan } from "@/types/pricing";
import { useUserProfile } from "@/hooks/useUserProfile";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingPlansNew() {
  const router = useRouter();
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(8);
  const [seconds, setSeconds] = useState(5);

  const { profile: userProfile } = useUserProfile();
  const userSubscribedPlan = userProfile?.subscription_status;

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/pricing");

        if (!response.ok) {
          throw new Error(`Failed to fetch pricing plans: ${response.status}`);
        }

        const data = await response.json();
        setPricingPlans(data.pricing || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching pricing plans:", err);
        setError("Failed to load pricing plans");
        setPricingPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

  const handleSubscribe = (plan: PricingPlan) => {
    // Redirect to registration page with plan info
    router.push(
      `/registration?plan=${plan.name}&price=${plan.price}&currency=${plan.currency}`,
    );
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else if (hours > 0) {
        setHours(hours - 1);
        setMinutes(59);
        setSeconds(59);
      } else if (days > 0) {
        setDays(days - 1);
        setHours(23);
        setMinutes(59);
        setSeconds(59);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [days, hours, minutes, seconds]);

  // Get all unique features from all plans
  const getAllFeatures = () => {
    const allFeatures = new Set<string>();
    pricingPlans.forEach((plan) => {
      if (plan.features && Array.isArray(plan.features)) {
        plan.features.forEach((feature) => allFeatures.add(feature));
      }
    });
    return Array.from(allFeatures);
  };

  const allFeatures = getAllFeatures();

  // Helper function to get button color class
  const getButtonColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case "green":
        return "bg-green-600 hover:bg-green-700";
      case "blue":
        return "bg-blue-900 hover:bg-blue-800";
      case "red":
        return "bg-red-600 hover:bg-red-700";
      case "purple":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-blue-900 hover:bg-blue-800";
    }
  };

  // Helper function to format price
  const formatPrice = (price: number, currency: string) => {
    return `${currency === "INR" ? "₹" : "$"}${price}`;
  };

  // Helper function to get duration text
  const getDurationText = (days: number | null, billingCycle: string) => {
    if (days) {
      return `${days} Days`;
    }
    return billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);
  };

  if (loading) {
    return (
      <section className="w-full py-16 px-4 bg-blue-50/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
              <span className="text-gray-600">Our Plans</span>
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Choose a <span className="text-green-600">Plan That's Right</span>{" "}
              For You
            </h1>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-16 px-4 bg-blue-50/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
              <span className="text-gray-600">Our Plans</span>
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Choose a <span className="text-green-600">Plan That's Right</span>{" "}
              For You
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-900 hover:bg-blue-800"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
            <span className="text-gray-600">Our Plans</span>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Choose a <span className="text-green-600">Plan That's Right</span>{" "}
            For You
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Legacy Keeper offers comprehensive plans that cater to different
            needs and budgets. From the free trial to our premium offering, we
            provide solutions designed to help you manage and protect your
            family's important information.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid grid-cols-1 ${
            pricingPlans.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          } gap-8`}
        >
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden relative ${
                plan.is_popular ? "border-2 border-green-500" : ""
              }`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-green-500 text-white px-4 py-1 text-sm font-medium">
                    Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{plan.name}</h2>

                <div className="flex items-center mb-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  {plan.original_price > plan.price && (
                    <span className="ml-2 text-gray-500 line-through">
                      {formatPrice(plan.original_price, plan.currency)}
                    </span>
                  )}
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {getDurationText(plan.duration_days, plan.billing_cycle)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h3 className="font-semibold mb-2">Highlights</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {plan.highlights}
                  </p>
                </div>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  className={`w-full ${getButtonColorClass(plan.button_color)}`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={userSubscribedPlan === plan.name}
                >
                  {userSubscribedPlan === plan.name
                    ? "Subscribed"
                    : plan.button_text}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        {allFeatures.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
            <div
              className={`grid grid-cols-${pricingPlans.length + 1} border-b`}
            >
              <div className="p-4 font-semibold">Features</div>
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="p-4 text-center font-semibold">
                  {plan.name}
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {allFeatures.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-${pricingPlans.length + 1} ${
                  index % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <div className="p-4 border-t">{feature}</div>
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 flex justify-center items-center border-t"
                  >
                    {plan.features && plan.features.includes(feature) ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Limited Time Offer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Limited Time Offer</h3>
              </div>
              <p className="text-gray-700">
                <span className="font-semibold">
                  Take charge of your family's future today!
                </span>{" "}
                We're offering an{" "}
                <span className="text-green-600 font-semibold">
                  exclusive discounted rate
                </span>{" "}
                for the first 1000 subscribers. Don't miss out—secure your
                family's future by signing up now!
              </p>
            </div>

            <div className="flex space-x-2">
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {days}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {hours.toString().padStart(2, "0")}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {minutes.toString().padStart(2, "0")}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {seconds.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button className="bg-blue-900 hover:bg-blue-800 px-8 py-3">
              Register Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
