import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getCurrentRoleFromSession } from "@/app/actions/user-roles";
import { redirect } from "next/navigation";
import { getDepositsInvestments, getDepositsInvestmentsStats } from "@/app/actions/deposits-investments";
import DepositsInvestmentsClient from "@/components/deposits-investments/deposits-investments-client";

export default async function DepositsInvestmentsPage() {
  const supabase = createServerComponentClient({ cookies });
  const cookieStore = cookies();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get current role from session (if available)
  let currentRole = null;
  try {
    currentRole = await getCurrentRoleFromSession(cookieStore);
  } catch {}

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Finance' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Finance"))
  ) {
    redirect("/dashboard");
  }
  // -----------------------------------------------------------------------------

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
  const statsResponse = await getDepositsInvestmentsStats(userId);

  return (
    <DepositsInvestmentsClient
      initialDeposits={depositsResponse.success ? depositsResponse.data : []}
      initialStats={statsResponse.success ? statsResponse.data : { totalAmount: 0, count: 0 }}
      userId={userId}
    />
  );
}
