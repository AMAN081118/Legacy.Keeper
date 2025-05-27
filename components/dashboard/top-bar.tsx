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
    name: string | null
    email: string | null
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

        // Try a simpler approach - get role IDs and related user information
        const { data: simpleRoles, error: simpleError } = await supabase
          .from('user_roles')
          .select(`
            *,
            roles:role_id(name),
            related_users:related_user_id(name, email)
          `)
          .eq('user_id', user.id)
        
        // Process the simple roles directly with related user information
        if (simpleRoles && simpleRoles.length > 0) {
          // Transform the data into UserRole objects
          const processedRoles: UserRole[] = []

          for (const item of simpleRoles) {
            // Extract role name
            let roleName = 'unknown'
            if (item.roles) {
              const rolesObj = item.roles as Record<string, any>
              if ('name' in rolesObj) {
                roleName = String(rolesObj.name || 'unknown')
              }
            }

            // Extract related user information
            let relatedUser = null
            if (item.related_user_id) {
              if (item.related_users) {
                const relatedUserObj = item.related_users as Record<string, any>
                relatedUser = {
                  name: 'name' in relatedUserObj ? relatedUserObj.name : null,
                  email: 'email' in relatedUserObj ? relatedUserObj.email : null
                }
              } else {
                // If related_users is null but we have a related_user_id, fetch the user directly
                try {
                  // Make a direct query to get the user information
                  const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name, email')
                    .eq('id', item.related_user_id)
                    .single()

                  if (!userError && userData) {
                    relatedUser = {
                      name: userData.name,
                      email: userData.email
                    }
                  }
                } catch (err) {
                  // Just leave relatedUser as null on error
                }
              }
            }

            // Add the role to our list
            processedRoles.push({
              name: roleName,
              relatedUser: relatedUser
            })
          }

          // Add default user role if not present
          if (!processedRoles.some(r => r.name === 'user')) {
            processedRoles.unshift({ name: 'user', relatedUser: null })
          }

          setUserRoles(processedRoles)
          setIsLoadingRoles(false)
          return
        }

        // If the simple approach didn't work, try the complex one
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            id,
            role_id,
            related_user_id,
            roles:role_id(id, name),
            related_users:related_user_id(id, name, email)
          `)
          .eq('user_id', user.id)

        if (error) {
          setUserRoles([{ name: 'user', relatedUser: null }])
          return
        }

        // We'll just use the data we have directly

        // If no roles found in the database, set the default user role
        if (!data || data.length === 0) {
          setUserRoles([
            { name: 'user', relatedUser: null }
          ])
          setIsLoadingRoles(false)
          return
        }

        // Transform the data into UserRole objects
        const roles: UserRole[] = []

        for (const item of data) {
          // Handle different possible structures of the roles data
          let roleName = 'unknown'
          if (item.roles) {
            if (typeof item.roles === 'string') {
              roleName = item.roles
            } else if (typeof item.roles === 'object') {
              // It could be an array or an object
              if (Array.isArray(item.roles) && item.roles.length > 0) {
                const firstRole = item.roles[0]
                if (firstRole && typeof firstRole === 'object') {
                  const roleObj = firstRole as Record<string, any>
                  if ('name' in roleObj) {
                    roleName = String(roleObj.name || 'unknown')
                  }
                }
              } else if (item.roles && typeof item.roles === 'object') {
                const rolesObj = item.roles as Record<string, any>
                if ('name' in rolesObj) {
                  roleName = String(rolesObj.name || 'unknown')
                }
              }
            }
          }

          // Handle related user information
          let relatedUser = null
          if (item.related_user_id) {
            if (item.related_users) {
              if (Array.isArray(item.related_users) && item.related_users.length > 0) {
                const firstUser = item.related_users[0]
                if (firstUser && typeof firstUser === 'object') {
                  relatedUser = {
                    name: 'name' in firstUser ? firstUser.name : null,
                    email: 'email' in firstUser ? firstUser.email : null
                  }
                }
              } else if (typeof item.related_users === 'object') {
                const relatedUserObj = item.related_users as Record<string, any>
                relatedUser = {
                  name: 'name' in relatedUserObj ? relatedUserObj.name : null,
                  email: 'email' in relatedUserObj ? relatedUserObj.email : null
                }
              }
            } else {
              // If related_users is null but we have a related_user_id, fetch the user directly
              try {
                // Make a direct query to get the user information
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('name, email')
                  .eq('id', item.related_user_id)
                  .single()

                if (!userError && userData) {
                  relatedUser = {
                    name: userData.name,
                    email: userData.email
                  }
                }
              } catch (err) {
                // Just leave relatedUser as null on error
              }
            }
          }

          const role: UserRole = {
            name: roleName,
            relatedUser: relatedUser
          }

          roles.push(role)
        }

        // First remove any existing 'user' role to avoid duplicates
        const filteredRoles = roles.filter(role => role.name !== 'user')

        // Then add the 'user' role at the beginning
        filteredRoles.unshift({ name: 'user', relatedUser: null })

        // Update the roles array
        setUserRoles(filteredRoles)
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

  const handleRoleChange = async (role: UserRole) => {
    console.log('[Debug] Starting role change to:', role);
    
    const newRole: CurrentRole = {
      id: role.name + (role.relatedUser?.email ? `_${role.relatedUser.email}` : ""),
      name: role.name,
      relatedUser: role.relatedUser || null
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
          // First get the related user's ID from their email
          const { data: relatedUserData, error: relatedUserError } = await supabase
            .from('users')
            .select('id')
            .eq('email', role.relatedUser.email)
            .single();
            
          console.log('[Debug] Related user data:', relatedUserData);
          console.log('[Debug] Related user error:', relatedUserError);
            
          if (relatedUserError || !relatedUserData) {
            console.error('[Debug] Error fetching related user data:', relatedUserError);
            newRole.accessCategories = [];
          } else {
            console.log('[Debug] Related user ID:', relatedUserData.id);
            
            // Query nominees table where:
            // - email is the current user's email (nominee's email)
            // - user_id is the related user's ID (the user who added the nominee)
            const { data: nomineeData, error } = await supabase
              .from("nominees")
              .select("access_categories")
              .eq("email", nomineeEmail)
              .eq("user_id", relatedUserData.id)
              .maybeSingle();
            
            console.log('[Debug] Nominee query params:', {
              email: nomineeEmail,
              user_id: relatedUserData.id
            });
            console.log('[Debug] Nominee data:', nomineeData);
            console.log('[Debug] Nominee error:', error);
            
            if (error) {
              console.error('[Debug] Error fetching nominee data:', error);
              newRole.accessCategories = [];
            } else {
              newRole.accessCategories = nomineeData?.access_categories || [];
            }
          }
        }
        
        console.log('[Debug] Set access categories:', newRole.accessCategories);
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="font-bold text-lg text-gray-800 select-none">Legacy Keeper</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <NotificationDropdown />
        {/* Roles Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-1.5">
              {/* Pill for role */}
              <span className="bg-green-100 text-green-700 rounded-full px-3 py-0.5 text-xs font-semibold mr-2">
                {getRoleLabel()}
              </span>
              {/* Related user name if present */}
              {getRelatedUserName() && (
                <span className="font-medium text-sm text-gray-800 mr-2">{getRelatedUserName()}</span>
              )}
              <ChevronDown className="h-4 w-4 text-gray-500" />
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
                      className={`px-2 py-2 rounded-sm cursor-pointer flex items-center ${isActive ? 'bg-accent font-semibold' : 'hover:bg-accent'} `}
                      onClick={() => handleRoleChange(role)}
                    >
                      <div className="font-medium capitalize flex items-center">
                        {role.name === 'user' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                        {role.name === 'nominee' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        )}
                        {role.name === 'trustee' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        {role.name}
                      </div>
                      {role.relatedUser && role.relatedUser.name && (
                        <div className="text-xs text-muted-foreground mt-1 ml-5 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                          <span>
                            {role.name === 'nominee' ? 'Nominee for' :
                              role.name === 'trustee' ? 'Trustee for' :
                                'Related to'}: <span className="font-medium">{role.relatedUser.name || role.relatedUser.email}</span>
                          </span>
                        </div>
                      )}
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
