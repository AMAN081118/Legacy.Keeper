"use client";

import type React from "react";

import { useEffect } from "react";
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket";
import { TopBar } from "@/components/dashboard/top-bar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RoleProvider } from "@/components/dashboard/role-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize storage when the dashboard loads
    const initStorage = async () => {
      try {
        const success = await ensureBucketExists("user_documents");
        if (!success) {
          console.warn(
            "Could not ensure storage bucket exists - some features may not work correctly"
          );
        }
      } catch (error) {
        console.error("Error initializing storage:", error);
      }
    };

    initStorage();
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
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
