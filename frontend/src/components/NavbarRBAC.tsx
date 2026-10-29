"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOS } from "@/context/OSContext";
import {
  ShieldCheck,
  Bell,
  Layers,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const NavbarRBAC: React.FC = () => {
  const pathname = usePathname();
  const { users, currentUser, switchUserRole, projects, errorBanner, clearError, theme, toggleTheme } = useOS();

  const addendumCount = projects.filter((p) => p.has_unread_addendum).length;
  const triageCount = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;

  // Derive readable breadcrumb from current path
  const getPageTitle = () => {
    if (pathname === "/") return "Commercial Pipeline Dashboard";
    if (pathname === "/triage") return "Stage 1: Bid Qualification Desk";
    if (pathname === "/inspector") return "CSI Spec & Drawing Inspector";
    if (pathname === "/intake") return "Inbound Intake & Portal Center";
    if (pathname === "/settings") return "Company Rules & Geo Logistics";
    if (pathname === "/proposal") return "Executive Architecture Blueprint";
    if (pathname.startsWith("/projects/")) return "Project Dossier Workspace";
    return "Estimating OS";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-300 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 dark:text-white">
                  ATLANTIC
                </span>
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 px-1.5 py-0.5 rounded">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold hidden sm:block leading-tight">
                Hardwood Gym &amp; Athletic Flooring
              </p>
            </div>
          </Link>

          {/* Minimalist Section Indicator (Breadcrumb) */}
          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-300 dark:border-slate-800 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-bold">Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
            <span className="font-extrabold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right Actions: Addenda Alert, Theme Switcher & User Persona */}
        <div className="flex items-center space-x-3">
          {/* Addenda Watchdog Alert Pill */}
          {addendumCount > 0 && (
            <Link
              href="/triage"
              className="bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 animate-pulse hover:bg-amber-200 transition shadow-sm"
              title="Addenda detected scope modification"
            >
              <Bell className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span>{addendumCount} Addenda Alert</span>
            </Link>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center justify-center transition shadow-sm hover:scale-105"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-700 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* User Persona Switcher */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block leading-tight">
                Authority
              </span>
              <select
                value={currentUser.email}
                onChange={(e) => switchUserRole(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-950 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
              >
                {users.map((u) => (
                  <option
                    key={u.email}
                    value={u.email}
                    className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-200 font-semibold"
                  >
                    {u.full_name} ({u.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Global RBAC / SOP Guard Error Banner */}
      {errorBanner && (
        <div className="bg-rose-50 dark:bg-rose-950/90 border-t border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
            <button
              onClick={clearError}
              className="ml-auto bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-xs font-bold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
