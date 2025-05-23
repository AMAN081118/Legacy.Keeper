"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrentRole = {
  id: string;
  name: string;
  description?: string;
  relatedUser?: { name: string | null; email: string | null } | null;
  accessCategories?: string[];
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

  // Optionally persist in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("currentRole");
    if (stored) {
      try {
        setCurrentRoleState(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (currentRole) {
      sessionStorage.setItem("currentRole", JSON.stringify(currentRole));
    } else {
      sessionStorage.removeItem("currentRole");
    }
  }, [currentRole]);

  const setCurrentRole = (role: CurrentRole | null) => {
    setCurrentRoleState(role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}
