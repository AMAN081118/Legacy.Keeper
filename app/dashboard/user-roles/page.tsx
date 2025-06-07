import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentRoleFromSession } from "@/app/actions/user-roles";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export default async function UserRolesPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get current role from session
  let currentRole = null;
  try {
    currentRole = await getCurrentRoleFromSession();
  } catch (error) {
    console.error("Error getting current role:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Roles</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Current Role</h2>
          <p className="text-gray-600">
            {currentRole ? currentRole.name : "No role assigned"}
          </p>
        </div>
      </div>
    </div>
  );
} 