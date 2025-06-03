"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client"

export type CurrentRole = {
  id: string;
  name: string;
  description?: string;
  relatedUser?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  accessCategories?: string[];
  user?: {
    email: string | null;
    name: string | null;
  };
};

type RoleContextType = {
  currentRole: CurrentRole | null;
  setCurrentRole: (role: CurrentRole | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<CurrentRole | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // On mount or when user changes, validate or reset role
  useEffect(() => {
    async function validateOrResetRole() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email || null;
      setCurrentUserEmail(userEmail);
      const storedRole = sessionStorage.getItem("currentRole");
      const storedRoleUser = sessionStorage.getItem("currentRoleUser");
      if (userEmail && storedRole && storedRoleUser === userEmail) {
        // Use the stored role for this user
        try {
          setCurrentRoleState(JSON.parse(storedRole));
        } catch {
          setCurrentRoleState({ id: "user", name: "user" });
          sessionStorage.setItem("currentRole", JSON.stringify({ id: "user", name: "user" }));
          sessionStorage.setItem("currentRoleUser", userEmail);
        }
      } else {
        // New user or no stored role, default to user
        setCurrentRoleState({ id: "user", name: "user" });
        if (userEmail) {
          sessionStorage.setItem("currentRole", JSON.stringify({ id: "user", name: "user" }));
          sessionStorage.setItem("currentRoleUser", userEmail);
        } else {
          sessionStorage.removeItem("currentRole");
          sessionStorage.removeItem("currentRoleUser");
        }
      }
    }
    validateOrResetRole();
  }, []);

  useEffect(() => {
    if (currentRole && currentUserEmail) {
      sessionStorage.setItem("currentRole", JSON.stringify(currentRole));
      sessionStorage.setItem("currentRoleUser", currentUserEmail);
    }
  }, [currentRole, currentUserEmail]);

  const setCurrentRole = (role: CurrentRole | null) => {
    setCurrentRoleState(role);
    if (role && currentUserEmail) {
      sessionStorage.setItem("currentRole", JSON.stringify(role));
      sessionStorage.setItem("currentRoleUser", currentUserEmail);
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}
