"use client";

import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Role, UserRole } from "@/lib/supabase/database.types";

export default function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleRelatedUsers, setRoleRelatedUsers] = useState<Record<string, { name: string | null; email: string | null } | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      // Get user_roles for this user
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select("role_id, related_user_id")
        .eq("user_id", userData.user.id);
      if (userRolesError) {
        setError("Failed to fetch user roles");
        setLoading(false);
        return;
      }
      const roleIds = userRoles?.map((ur: { role_id: string }) => ur.role_id) || [];
      if (roleIds.length === 0) {
        setRoles([]);
        setLoading(false);
        return;
      }
      // Get role details
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .in("id", roleIds);
      if (rolesError) {
        setError("Failed to fetch roles");
        setLoading(false);
        return;
      }
      setRoles(rolesData || []);

      // For nominee/trustee, fetch related user info (by role_id and related_user_id)
      const relatedUserMap: Record<string, { name: string | null; email: string | null } | null> = {};
      for (const ur of userRoles) {
        const role = rolesData?.find((r: Role) => r.id === ur.role_id);
        if (ur.related_user_id && role && (role.name === "nominee" || role.name === "trustee")) {
          // Fetch user info for related_user_id
          const { data: relatedUser } = await supabase
            .from("users")
            .select("name, email")
            .eq("id", ur.related_user_id)
            .single();
          // Use a composite key to support multiple nominee/trustee roles
          relatedUserMap[`${ur.role_id}_${ur.related_user_id}`] = relatedUser ? { name: relatedUser.name, email: relatedUser.email } : null;
        }
      }
      setRoleRelatedUsers(relatedUserMap);
      setLoading(false);
    };
    fetchUserRoles();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Roles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {roles.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No roles assigned.</div>
        ) : (
          roles.map((role) => {
            // Find the userRoles entry for this role
            const userRole = Object.entries(roleRelatedUsers).find(
              ([key, _]) => key.startsWith(role.id + "_")
            );
            const related = userRole ? userRole[1] : null;
            return (
              <Card key={role.id} className="p-6 flex flex-col items-start shadow-md hover:shadow-lg transition-shadow">
                <div className="text-lg font-semibold mb-2">{role.name}</div>
                <div className="text-gray-600 mb-2">{role.description || "No description"}</div>
                {(role.name === "nominee" || role.name === "trustee") && related && (
                  <div className="text-sm text-blue-700 mt-2">
                    For user: {related.name || related.email || "Unknown"}
                  </div>
                )}
                <Button className="mt-4" variant="outline" onClick={() => alert(`Switching to role: ${role.name}`)}>
                  Change to this role
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
