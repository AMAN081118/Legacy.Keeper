"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "./notification-dropdown"
import { logoutUser } from "@/app/actions/auth-actions"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserCircle, User, Lock, CreditCard, Home, LogOut } from "lucide-react"
import { useRole, CurrentRole } from "@/components/dashboard/role-context"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
interface TopBarProps {
  onMobileMenuClick?: () => void
  user?: {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  }
}

interface UserRole {
  name: string
  relatedUser?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null
  accessCategories?: string[]
}

export function TopBar({ onMobileMenuClick = () => {}, user }: TopBarProps) {
  // Default user object if none is provided
  const safeUser = user || { name: null, email: null, avatarUrl: null }
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const { currentRole, setCurrentRole } = useRole();

  const userInitials = safeUser.name
    ? safeUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : safeUser.email
      ? safeUser.email[0].toUpperCase()
      : "U"

  useEffect(() => {
    const fetchUserRoles = async () => {
      setIsLoadingRoles(true)
      try {
        const supabase = createClient()

        // Get the current user
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError) {
          setUserRoles([{ name: 'user', relatedUser: null }])
          return
        }

        if (!authData.user) {
          setUserRoles([{ name: 'user', relatedUser: null }])
          return
        }

        const user = authData.user

        const { data: allRoles, error: rolesError } = await supabase
          .from('roles')
          .select('*')

        const { data: directRoles, error: directError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)

        console.log(directRoles)

        // Now let's try a direct query to get role names
        const { data: roleNames, error: roleNamesError } = await supabase
          .from('user_roles')
          .select('roles!inner(name)')
          .eq('user_id', user.id)

        // Try a different approach with a raw SQL query via RPC
        try {
          const { data: rpcRoles, error: rpcError } = await supabase.rpc('get_user_roles', {
            user_id_param: user.id
          })
        } catch (rpcErr) {
        }

        // Get user roles with a more reliable approach
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role_id, related_user_id')
          .eq('user_id', user.id)

        console.log('[Debug] User roles data:', userRoleData)
        console.log('[Debug] User roles error:', userRoleError)

        if (userRoleError || !userRoleData) {
          console.log('[Debug] No user roles found, setting default user role')
          setUserRoles([{ name: 'user', relatedUser: null }])
          setIsLoadingRoles(false)
          return
        }

        // Process each role
        const processedRoles: UserRole[] = []

        for (const roleItem of userRoleData) {
          // Get role name
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', roleItem.role_id)
            .single()

          if (roleError || !roleData) {
            console.log('[Debug] Error fetching role:', roleError)
            continue
          }

          const roleName = roleData.name

          // Get related user if exists
          let relatedUser = null
          if (roleItem.related_user_id) {
            const { data: relatedUserData, error: relatedUserError } = await supabase
              .from('users')
              .select('id, name, email')
              .eq('id', roleItem.related_user_id)
              .single()

            console.log('[Debug] Related user data for role', roleName, ':', relatedUserData)
            console.log('[Debug] Related user error:', relatedUserError)

            if (!relatedUserError && relatedUserData) {
              relatedUser = {
                id: relatedUserData.id,
                name: relatedUserData.name,
                email: relatedUserData.email
              }
            }
          }

          processedRoles.push({
            name: roleName,
            relatedUser: relatedUser
          })
        }

        // Add default user role if not present
        if (!processedRoles.some(r => r.name === 'user')) {
          processedRoles.unshift({ name: 'user', relatedUser: null })
        }

        console.log('[Debug] Final processed roles:', processedRoles)
        setUserRoles(processedRoles)
        setIsLoadingRoles(false)
      } catch (error) {
        setUserRoles([
          { name: 'user', relatedUser: null }
        ])
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchUserRoles()

    // Run this effect only once when the component mounts
    // Don't depend on safeUser.email since it might be null
  }, [])

  // Helper to get role label and related user
  const getRoleLabel = () => {
    if (!currentRole) return "Role";
    if (currentRole.name === "user") return "User";
    if (currentRole.name === "nominee") return "Nominee For";
    if (currentRole.name === "trustee") return "Trustee For";
    return currentRole.name.charAt(0).toUpperCase() + currentRole.name.slice(1);
  };
  const getRelatedUserName = () => {
    if (!currentRole || !currentRole.relatedUser) return null;
    return currentRole.relatedUser.name || currentRole.relatedUser.email || null;
  };

  // Debug current role
  console.log('[Debug] Current role in topbar:', currentRole);
  console.log('[Debug] Current role related user:', currentRole?.relatedUser);

  const handleRoleChange = async (role: UserRole) => {
    console.log('[Debug] Starting role change to:', role);

    const newRole: CurrentRole = {
      id: role.name + (role.relatedUser?.email ? `_${role.relatedUser.email}` : ""),
      name: role.name,
      relatedUser: role.relatedUser ? {
        id: role.relatedUser.id,
        name: role.relatedUser.name,
        email: role.relatedUser.email
      } : undefined
    };

    // If changing to nominee, fetch access categories
    if (role.name === 'nominee' && role.relatedUser) {
      try {
        const supabase = createClient();
        console.log('[Debug] Related user email:', role.relatedUser.email);

        // Get the current user's email
        const { data: userData } = await supabase.auth.getUser();
        const nomineeEmail = userData.user?.email;
        console.log('[Debug] Current user email:', nomineeEmail);

        if (!nomineeEmail) {
          console.error('[Debug] No current user email found');
          newRole.accessCategories = [];
        } else {
          // Get nominee's access categories
          const { data: nomineeData } = await supabase
            .from("nominees")
            .select("access_categories")
            .eq("email", nomineeEmail)
            .eq("user_id", role.relatedUser?.id)
            .maybeSingle();
          console.log('[Debug] nomineeData:', nomineeData, 'for email:', nomineeEmail, 'user_id:', role.relatedUser?.id);
          newRole.accessCategories = nomineeData?.access_categories || [];
          // Add current user info to the role
          newRole.user = {
            email: nomineeEmail,
            name: userData.user?.user_metadata?.name || null
          };
        }
      } catch (error) {
        console.error('[Debug] Error in nominee access categories fetch:', error);
        newRole.accessCategories = [];
      }
    } else if (role.name === 'user') {
      // For user role, no access restrictions
      newRole.accessCategories = undefined;
      console.log('[Debug] User role - no access restrictions');
    }

    console.log('[Debug] Final role object:', newRole);

    // Update client-side state
    setCurrentRole(newRole);

    // Update cookie via API
    const response = await fetch("/api/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      console.error("[Debug] Failed to update role in session");
      return;
    }

    console.log('[Debug] Role updated successfully, reloading page...');
    // Force reload the page to update server-side context
    window.location.reload();
  };

  return (
    <div className="flex h-16 items-center px-4 border-b bg-white">
      <div className="flex items-center">
        <Image src="/image.png" alt="Logo" width={32} height={32} className="mr-2 h-8 w-8 object-contain" />
        <span className="font-bold text-lg text-gray-800 select-none">Legacy Keeper</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <NotificationDropdown />
        {/* Roles Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5">
              {/* For trustee role, show "Trustee For" and name */}
              {currentRole?.name === "trustee" && currentRole.relatedUser?.name ? (
                <>
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-0.5 text-xs font-semibold">
                    Trustee For
                  </span>
                  <span className="font-medium text-sm text-gray-800 ml-1">{currentRole.relatedUser.name}</span>
                </>
              ) : (
                <>
                  {/* Pill for other roles */}
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-0.5 text-xs font-semibold">
                    {getRoleLabel()}
                  </span>
                  {/* Related user name if present for other roles */}
                  {getRelatedUserName() && (
                    <span className="font-medium text-sm text-gray-800 ml-1">{getRelatedUserName()}</span>
                  )}
                </>
              )}
              <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Your Roles</span>
              {isLoadingRoles && <span className="text-xs text-muted-foreground">Loading...</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingRoles ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Loading roles...
              </div>
            ) : userRoles.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No roles found
              </div>
            ) : (
              <>
                {userRoles.map((role, index) => {
                  const isActive = currentRole &&
                    role.name === currentRole.name &&
                    ((role.relatedUser?.email && currentRole.relatedUser?.email && role.relatedUser.email === currentRole.relatedUser.email) ||
                     (!role.relatedUser && !currentRole.relatedUser));
                  return (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-sm cursor-pointer ${isActive ? 'bg-accent font-semibold' : 'hover:bg-accent'} `}
                      onClick={() => handleRoleChange(role)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {role.name === 'user' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                          {role.name === 'nominee' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          )}
                          {role.name === 'trustee' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium capitalize text-sm">
                              {role.name === 'user' ? 'User' :
                               role.name === 'nominee' ? 'Nominee For' :
                               role.name === 'trustee' ? 'Trustee For' :
                               role.name}
                            </span>
                            {/* Show inviter name for trustee role */}
                            {role.name === 'trustee' && role.relatedUser?.name && (
                              <span className="text-xs text-muted-foreground mt-0.5">{role.relatedUser.name}</span>
                            )}
                            {/* Show related user for nominee role as well */}
                            {role.name === 'nominee' && role.relatedUser?.name && (
                              <span className="text-xs text-muted-foreground mt-0.5">{role.relatedUser.name}</span>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="px-2 py-1 mt-2 text-xs text-center text-muted-foreground border-t">
                  {userRoles.length} role{userRoles.length !== 1 ? 's' : ''} found
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {safeUser.avatarUrl ? (
                  <AvatarImage src={safeUser.avatarUrl} alt={safeUser.name || safeUser.email || "User"} className="w-12 h-12 object-cover" />
                ) : safeUser.name ? (
                  <span className="text-xl font-bold text-gray-700">{safeUser.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-7 h-7 text-gray-400" />
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem asChild>
              <a href="/dashboard/profile" className="flex items-center font-semibold text-[#0a2642]">
                <User className="mr-2 h-5 w-5" />
                My Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/usage-history" className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Usage History
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/account" className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Account
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logoutUser} className="w-full">
                <button type="submit" className="flex items-center w-full text-left">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
