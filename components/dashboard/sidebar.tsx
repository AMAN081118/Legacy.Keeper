"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  FileText,
  Shield,
  FileArchive,
  Users,
  Smartphone,
  ScrollText,
  MessageSquare,
  LogOut,
  Briefcase,
  Bell,
  UserCheck,
  UserPlus,
} from "lucide-react"
import { useRole } from "@/components/dashboard/role-context"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: null,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
    group: "Finance",
  },
  {
    title: "Debts and Loans",
    href: "/dashboard/debts-loans",
    icon: CreditCard,
    group: "Finance",
  },
  {
    title: "Deposits and Investments",
    href: "/dashboard/deposits-investments",
    icon: CreditCard,
    group: "Finance",
  },
  {
    title: "Documents Store",
    href: "/dashboard/documents",
    icon: FileText,
    group: "Finance",
  },
  {
    title: "Insurance",
    href: "/dashboard/insurance",
    icon: Shield,
    group: "Family",
  },
  {
    title: "Health Records",
    href: "/dashboard/health-records",
    icon: FileArchive,
    group: "Family",
  },
  {
    title: "Family Vaults",
    href: "/dashboard/family-vaults",
    icon: Users,
    group: "Family",
  },
  {
    title: "Digital Accounts and Subscriptions",
    href: "/dashboard/digital-accounts",
    icon: Smartphone,
    group: "Family",
  },
  {
    title: "Trustees",
    href: "/dashboard/trustees",
    icon: UserCheck,
    group: "Family",
  },
  {
    title: "Nominees",
    href: "/dashboard/nominees",
    icon: UserPlus,
    group: "Family",
  },
  {
    title: "Will and Successions",
    href: "/dashboard/will",
    icon: ScrollText,
    group: "Financial Planning",
  },
  {
    title: "Business Plans",
    href: "/dashboard/business-plans",
    icon: Briefcase,
    group: "Financial Planning",
  },
  {
    title: "Reminders",
    href: "/dashboard/reminders",
    icon: Bell,
    group: null,
  },
  {
    title: "Special Message",
    href: "/dashboard/special-message",
    icon: MessageSquare,
    group: null,
  },
  {
    title: "Logout",
    href: "/api/auth/logout",
    icon: LogOut,
    group: null,
  },
]

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole } = useRole();

  // Debug: print access categories and session user email to the terminal
  if (currentRole && currentRole.accessCategories) {
    // eslint-disable-next-line no-console
    console.log("[Sidebar] Current role access categories:", currentRole.accessCategories);
  }
  // Print current session user email
  if (typeof window !== "undefined") {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          // eslint-disable-next-line no-console
          console.log("[Sidebar] Current session user email:", data.user.email);
        }
      });
    });
  }

  // Helper: get allowed sections/pages from currentRole
  const allowedSections = currentRole?.accessCategories;

  // Group links by their group
  const groupedLinks = sidebarLinks.reduce(
    (acc, link) => {
      if (!link.group) {
        if (!acc.ungrouped) acc.ungrouped = [];
        acc.ungrouped.push(link);
      } else {
        if (!acc[link.group]) acc[link.group] = [];
        acc[link.group].push(link);
      }
      return acc;
    },
    {} as Record<string, typeof sidebarLinks>,
  );

  // Get the groups in order
  const groups = ["Finance", "Family", "Financial Planning"];

  // Helper: check if a link is allowed
  const isLinkAllowed = (link: any) => {
    console.log("[Debug] Checking access for link:", {
      title: link.title,
      group: link.group,
      currentRole: currentRole?.name,
      accessCategories: currentRole?.accessCategories
    });
    
    // Always allow Dashboard and Logout
    if (link.title === "Dashboard" || link.title === "Logout") {
      console.log("[Debug] Always allowed:", link.title);
      return true;
    }
    
    // If no role or user role, allow everything
    if (!currentRole || currentRole.name === "user") {
      console.log("[Debug] No role or user role - allowing access");
      return true;
    }
    
    // For nominee role
    if (currentRole.name === "nominee") {
      // If no access categories defined, deny access
      if (!currentRole.accessCategories || currentRole.accessCategories.length === 0) {
        console.log("[Debug] Nominee role but no access categories defined");
        return false;
      }
      
      // Check if the link's group is in access categories
      if (link.group && currentRole.accessCategories.includes(link.group)) {
        console.log("[Debug] Access granted through group:", link.group);
        return true;
      }
      
      // Check if the link's title is in access categories
      if (currentRole.accessCategories.includes(link.title)) {
        console.log("[Debug] Access granted through title:", link.title);
        return true;
      }
      
      console.log("[Debug] Access denied - no matching category found");
      return false;
    }
    
    // Default deny for unknown roles
    console.log("[Debug] Unknown role type - denying access");
    return false;
  };

  // Helper: render a sidebar link (enabled or disabled)
  const renderSidebarLink = (link: any, idx: number) => {
    const allowed = isLinkAllowed(link);
    if (allowed) {
      return (
        <Link
          key={link.href || idx}
          href={link.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium",
            pathname === link.href
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </Link>
      );
    } else {
      return (
        <span
          key={link.href || idx}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-not-allowed opacity-50 select-none",
            pathname === link.href ? "bg-gray-50" : ""
          )}
          tabIndex={-1}
          aria-disabled="true"
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </span>
      );
    }
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-white md:flex fixed inset-y-0 left-0 z-30">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center font-semibold">
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
          Trustee Hub
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <ul className="space-y-2">
          {groupedLinks.ungrouped?.slice(0, 1).map((link, idx) => renderSidebarLink(link, idx))}
        </ul>

        {groups.map((group) => (
          <div key={group} className="mt-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</h3>
            <ul className="space-y-1">
              {groupedLinks[group]?.map((link, idx) => renderSidebarLink(link, idx))}
            </ul>
          </div>
        ))}

        <div className="mt-6">
          <ul className="space-y-1">
            {groupedLinks.ungrouped?.slice(1).map((link, idx) => renderSidebarLink(link, idx))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}
