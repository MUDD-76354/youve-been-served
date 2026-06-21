"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { type ReactNode } from "react";

/**
 * TODO: Re-enable proper authentication once the site is stable.
 * Swap AuthProvider stub for the full implementation in AuthProvider.full.tsx.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}