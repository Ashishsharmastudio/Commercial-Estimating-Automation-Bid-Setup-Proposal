import React from "react";
import { OSProvider } from "@/context/OSContext";
import { NavbarRBAC } from "@/components/NavbarRBAC";
import { AppSidebar } from "@/components/AppSidebar";
import "./globals.css";

export const metadata = {
  title: "Atlantic Flooring | Autonomous Estimating & Bid Qualification OS",
  description: "Stage 1-7 Autonomous Bid Intake, Spec AI Qualification, Multi-GC Deduplication, and Native QuickBooks/ClickUp OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <OSProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <NavbarRBAC />
              <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">{children}</main>
            </div>
          </div>
        </OSProvider>
      </body>
    </html>
  );
}
