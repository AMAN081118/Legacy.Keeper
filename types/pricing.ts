export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  currency: string;
  billing_cycle: string;
  duration_days: number | null;
  highlights: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  button_text: string;
  button_color: string;
  features: string[];
  feature_comparison: any; // This can be string or object based on your data
  created_at: string;
  updated_at: string;
}

export interface PricingResponse {
  pricing: PricingPlan[];
}

export interface SinglePricingResponse {
  pricing: PricingPlan;
}
