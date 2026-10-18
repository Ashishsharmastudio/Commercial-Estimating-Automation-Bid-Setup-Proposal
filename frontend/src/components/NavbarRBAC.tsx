"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOS } from "@/context/OSContext";
import {
  ShieldCheck,
  Bell,
  Layers,
  Settings,
  Mail,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Presentation,
  Compass,
  Sparkles,
} from "lucide-react";

export const NavbarRBAC: React.FC = () => {
  const pathname = usePathname();
  const { users, currentUser, switchUserRole, projects, inboxData, errorBanner, clearError } = useOS();

  const triageCount = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;
  const addendumCount = projects.filter((p) => p.has_unread_addendum).length;
  const unreadEmailCount = inboxData?.unread_inbox_count || 62;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  ATLANTIC
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  ESTIMATING OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Gymnasium Hardwood & Athletic Flooring
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                pathname === "/"
                  ? "bg-slate-800/90 text-emerald-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pipeline Master</span>
            </Link>

            <Link
              href="/inspector"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                pathname === "/inspector"
                  ? "bg-slate-800/90 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Spec Inspector</span>
              <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1 py-0.2 rounded font-bold">
                Split
              </span>
            </Link>

            <Link
              href="/triage"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                pathname === "/triage"
                  ? "bg-slate-800/90 text-emerald-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Karla&apos;s Triage Desk</span>
              {triageCount > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {triageCount}
                </span>
              )}
              {addendumCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center animate-pulse">
                  <Bell className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
                  {addendumCount} Addenda
                </span>
              )}
            </Link>

            <Link
              href="/intake"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                pathname === "/intake"
                  ? "bg-slate-800/90 text-indigo-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Outlook & Portal Intake</span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {unreadEmailCount} Unread
              </span>
            </Link>

            <Link
              href="/proposal"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                pathname === "/proposal"
                  ? "bg-gradient-to-r from-indigo-900/60 to-purple-900/60 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/40"
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-indigo-400" />
              <span>Executive Architecture</span>
              <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1 py-0.2 rounded font-bold">
                For John
              </span>
            </Link>

            <Link
              href="/settings"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                pathname === "/settings"
                  ? "bg-slate-800/90 text-emerald-400 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>AI Rules & Geo</span>
            </Link>
          </nav>
        </div>

        {/* User Persona Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
                Active Authority
              </span>
              <select
                value={currentUser.email}
                onChange={(e) => switchUserRole(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer pr-1"
              >
                {users.map((u) => (
                  <option key={u.email} value={u.email} className="bg-slate-900 text-slate-200">
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
        <div className="bg-rose-950/90 border-t border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
            <button
              onClick={clearError}
              className="ml-auto bg-rose-800 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-xs font-bold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
};