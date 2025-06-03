"use client"

import { memo, useMemo } from "react"
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
import { logoutUser } from "@/app/actions/auth-actions"

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

// Memoized sidebar link component
const SidebarLink = memo(({ link, pathname, isAllowed }: {
  link: any;
  pathname: string;
  isAllowed: boolean;
}) => {
  if (link.title === "Logout" && isAllowed) {
    return (
      <form action={logoutUser} className="w-full">
        <button
          type="submit"
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium w-full text-left text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </button>
      </form>
    );
  }

  if (isAllowed) {
    return (
      <Link
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
  }

  return (
    <span
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
});

SidebarLink.displayName = "SidebarLink";

export const Sidebar = memo(() => {
  const pathname = usePathname();
  const { currentRole } = useRole();

  // Memoize grouped links to prevent recalculation
  const groupedLinks = useMemo(() => {
    return sidebarLinks.reduce(
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
  }, []);

  // Get the groups in order
  const groups = useMemo(() => ["Finance", "Family", "Financial Planning"], []);

  // Memoize link access checking
  const isLinkAllowed = useMemo(() => {
    return (link: any) => {
      // Always allow Dashboard and Logout
      if (link.title === "Dashboard" || link.title === "Logout") {
        return true;
      }

      // If no role or user role, allow everything
      if (!currentRole || currentRole.name === "user") {
        return true;
      }

      // For nominee role
      if (currentRole.name === "nominee") {
        // If no access categories defined, deny access
        if (!currentRole.accessCategories || currentRole.accessCategories.length === 0) {
          return false;
        }

        // Check if the link's group is in access categories
        if (link.group && currentRole.accessCategories.includes(link.group)) {
          return true;
        }

        // Check if the link's title is in access categories
        if (currentRole.accessCategories.includes(link.title)) {
          return true;
        }

        return false;
      }

      // Default deny for unknown roles
      return false;
    };
  }, [currentRole]);

  // Memoized render function
  const renderSidebarLink = useMemo(() => {
    return (link: any, idx: number) => {
      const allowed = isLinkAllowed(link);
      return (
        <SidebarLink
          key={link.href || idx}
          link={link}
          pathname={pathname}
          isAllowed={allowed}
        />
      );
    };
  }, [isLinkAllowed, pathname]);

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
});

Sidebar.displayName = "Sidebar";
