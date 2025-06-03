"use client";

import type React from "react";
import { Suspense, useEffect } from "react";
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket";
import { TopBar } from "@/components/dashboard/top-bar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RoleProvider } from "@/components/dashboard/role-context";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for main content
function MainContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize storage and fix user profile if needed
    const initializeUser = async () => {
      try {
        // Fix user profile if missing (for existing users)
        await fetch("/api/auth/fix-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        // Initialize storage
        await ensureBucketExists("user_documents");
      } catch (error) {
        // Silently handle initialization errors
        console.warn("User initialization warning:", error);
      }
    };

    // Run in background without blocking UI
    initializeUser();
  }, []);

  return (
    <RoleProvider>
      <div className="flex min-h-screen flex-col">
        <div className="fixed top-0 left-0 right-0 z-40">
          <TopBar />
        </div>
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-y-auto bg-gray-50 p-6 h-[calc(100vh-4rem)]">
            <Suspense fallback={<MainContentSkeleton />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
