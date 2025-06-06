import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getCurrentRoleFromSession } from "@/app/actions/user-roles";
import { redirect } from "next/navigation";
import { getDepositsInvestments, getDepositsInvestmentsStats } from "@/app/actions/deposits-investments";
import DepositsInvestmentsClient from "@/components/deposits-investments/deposits-investments-client";
import type { DepositInvestment } from "@/lib/supabase/database.types";

export default async function DepositsInvestmentsPage() {
  const supabase = createServerComponentClient({ cookies });
  const cookieStore = await cookies();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get current role from session (if available)
  let currentRole = null;
  try {
    currentRole = await getCurrentRoleFromSession();
  } catch (error) {
    console.error("Error getting current role:", error);
  }

  // Determine the correct userId to fetch data for
  let userId = session.user.id;
  if (currentRole?.name === "nominee" && currentRole.relatedUser?.email) {
    const { data: relatedUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", currentRole.relatedUser.email)
      .single();
    if (relatedUser?.id) userId = relatedUser.id;
  }

  // Fetch data for the correct user
  const depositsResponse = await getDepositsInvestments(userId);
  const statsResponse = await getDepositsInvestmentsStats();

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Financial Planning' access ---
  if (currentRole === "nominee") {
    const { data: nomineeAccess } = await supabase
      .from("nominee_access")
      .select("access_type")
      .eq("user_id", userId)
      .eq("access_type", "Financial Planning")
      .single();

    if (!nomineeAccess) {
      redirect("/dashboard");
    }
  }

  // Ensure we have the correct types for the client component
  const initialDeposits: DepositInvestment[] = depositsResponse.success && depositsResponse.data ? depositsResponse.data : [];
  const initialStats = statsResponse.success && statsResponse.data ? statsResponse.data : { totalAmount: 0, count: 0 };

  return (
    <DepositsInvestmentsClient
      userId={userId}
      initialDeposits={initialDeposits}
      initialStats={initialStats}
    />
  );
}
