// TODO: Re-implement proper User/Admin role separation with working login

import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "You've Been Served | Bohn & Associates",
  description:
    "Process serving tracking system for Bohn & Associates field and admin teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <ToastProvider>
          <AuthProvider>
            <Nav />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}