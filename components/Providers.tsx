"use client";

import { ToastProvider } from "@/components/ToastProvider";
import { type ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}