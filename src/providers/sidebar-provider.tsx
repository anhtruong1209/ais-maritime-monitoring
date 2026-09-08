"use client";

import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "ais-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer (not an effect): runs once per component instance, so
  // it reads the real value on the client's first render instead of
  // flashing expanded-then-collapsed. Guarded for the SSR pass, where
  // `window`/localStorage don't exist.
  const [collapsed, setCollapsed] = useState(readInitialCollapsed);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — collapse still works for this session via state alone.
      }
      return next;
    });
  }

  return <SidebarContext.Provider value={{ collapsed, toggle }}>{children}</SidebarContext.Provider>;
}

/** Toggle the main app nav sidebar open/closed from anywhere in the shell. */
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
