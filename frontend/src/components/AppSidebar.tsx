"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOS } from "@/context/OSContext";
import {
  Inbox,
  CheckCircle2,
  FileSpreadsheet,
  Calculator,
  Send,
  Handshake,
  Trophy,
  Archive,
  ChevronLeft,
  ChevronRight,
  Mail,
  Presentation,
  Sliders,
  SplitSquareVertical,
  Layers,
  Lock,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { projects, inboxData } = useOS();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Karla's Phase Project Counts
  const phase1Count = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;
  const phase2Count = projects.filter((p) => p.stage === "QUALIFIED").length;
  const phase3Count = projects.filter((p) => p.stage === "IN_TAKEOFF").length;
  const phase4Count = projects.filter((p) => p.stage === "FOR_PRICING").length;
  const phase5Count = projects.filter((p) => p.stage === "ESTIMATE_SENT").length;
  const phase6Count = projects.filter((p) => p.stage === "CLOSING_NEGOTIATION").length;
  const phase7Count = projects.filter((p) => p.stage === "WON_AWARDED").length;
  const watchlistCount = projects.filter((p) => p.stage === "NO_BID_REJECTED").length;

  const steps = [
    {
      id: "step-1",
      number: "1",
      name: "New Bid Invites",
      karlaLabel: "Is It Qualified? Triage Desk",
      count: phase1Count,
      href: "/triage",
      icon: Inbox,
      badgeColor: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 font-extrabold",
      activeBg: "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/50 text-emerald-950 dark:text-emerald-200",
      isLocked: false,
      statusLabel: "ACTIVE",
    },
    {
      id: "step-2",
      number: "2",
      name: "Qualified To Bid",
      karlaLabel: "Scopes & Wood Confirmed",
      count: phase2Count,
      href: "/triage?tab=qualified",
      icon: CheckCircle2,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white",
      isLocked: false,
      statusLabel: "STAGE 2",
    },
    {
      id: "step-3",
      number: "3",
      name: "In Takeoff",
      karlaLabel: "Specs & Drawings Reading (5-8 Hrs)",
      count: phase3Count,
      href: "#",
      icon: FileSpreadsheet,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "",
      isLocked: true,
      statusLabel: "STAGE 3",
    },
    {
      id: "step-4",
      number: "4",
      name: "For Pricing",
      karlaLabel: "Mill Quotes & QuickBooks Pricing Desk",
      count: phase4Count,
      href: "#",
      icon: Calculator,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "",
      isLocked: true,
      statusLabel: "STAGE 4",
    },
    {
      id: "step-5",
      number: "5",
      name: "Estimates Sent",
      karlaLabel: "Follow-Up Clock Running",
      count: phase5Count,
      href: "#",
      icon: Send,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "",
      isLocked: true,
      statusLabel: "STAGE 5",
    },
    {
      id: "step-6",
      number: "6",
      name: "Negotiation & VE",
      karlaLabel: "Apparent Low Bidder",
      count: phase6Count,
      href: "#",
      icon: Handshake,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "",
      isLocked: true,
      statusLabel: "STAGE 6",
    },
    {
      id: "step-7",
      number: "7",
      name: "Won & Awarded",
      karlaLabel: "PM Job Handoff (Summer)",
      count: phase7Count,
      href: "#",
      icon: Trophy,
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      activeBg: "",
      isLocked: true,
      statusLabel: "STAGE 7",
    },
    {
      id: "watchlist",
      number: "—",
      name: "Watchlist & Disqualified",
      karlaLabel: "Addenda Watchdog Active",
      count: watchlistCount,
      href: "/triage?tab=watchlist",
      icon: Archive,
      badgeColor: "bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-400/40 font-extrabold",
      activeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200",
      isLocked: false,
      statusLabel: "WATCHDOG",
    },
  ];

  const workspaceTools = [
    {
      name: "Spec Inspector",
      subtitle: "Split-Screen PDF vs AI",
      href: "/inspector",
      icon: SplitSquareVertical,
      badge: "AI",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30 font-extrabold",
    },
    {
      name: "Email & Portal Intake",
      subtitle: "Outlook & Portal Sync",
      href: "/intake",
      icon: Mail,
      badge: inboxData ? `${inboxData.unread_inbox_count}` : "62",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 font-extrabold",
    },
    {
      name: "Executive Architecture",
      subtitle: "Full Operating Blueprint",
      href: "/proposal",
      icon: Presentation,
      badge: "JOHN",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-400/30 font-extrabold",
    },
    {
      name: "AI Rules & Logistics",
      subtitle: "PA/NY/NJ Rules & Geofence",
      href: "/settings",
      icon: Sliders,
    },
  ];

  return (
    <aside
      className={`relative z-40 bg-white dark:bg-[#0a0e1a]/95 backdrop-blur-xl border-r border-slate-300 dark:border-slate-800/80 transition-all duration-300 flex flex-col shrink-0 ${
        collapsed ? "w-20" : "w-72"
      } min-h-screen shadow-sm dark:shadow-none`}
    >
      {/* Top Sidebar Header */}
      <div className="h-16 px-4 border-b border-slate-300 dark:border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="overflow-hidden">
              <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white block leading-tight">
                ATLANTIC OS
              </span>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate">
                Karla&apos;s Estimating Workflow
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Master Dashboard Link */}
        <div>
          <Link
            href="/"
            title={collapsed ? "Pipeline Dashboard" : undefined}
            className={`flex items-center rounded-xl transition-all ${
              collapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
            } ${
              pathname === "/"
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-bold hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block">Pipeline Dashboard</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block truncate">
                  Master Overview &amp; KPIs
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Section: Karla's 7 Steps Workflow */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-black tracking-wider text-slate-700 dark:text-slate-400 uppercase flex items-center justify-between">
              <span>7-Step Workflow</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                Stage 1 Active
              </span>
            </div>
          )}

          <div className="space-y-1">
            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = pathname === st.href || (st.id === "step-1" && pathname === "/triage");

              return (
                <div key={st.id}>
                  {st.isLocked ? (
                    <div
                      title={collapsed ? `${st.name} (Upcoming Phase)` : undefined}
                      className={`flex items-center rounded-xl transition-all opacity-75 cursor-not-allowed ${
                        collapsed ? "justify-center p-2.5" : "px-3 py-2 space-x-3"
                      } text-slate-400 dark:text-slate-500`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-800 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                              {st.number}. {st.name}
                            </span>
                            <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0 ml-1" />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium block truncate leading-tight">
                            {st.karlaLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={st.href}
                      title={collapsed ? st.name : undefined}
                      className={`group flex items-center rounded-xl transition-all ${
                        collapsed ? "justify-center p-2.5" : "px-3 py-2 space-x-3"
                      } ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 font-bold shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40"
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">
                              {st.number}. {st.name}
                            </span>
                            {st.count > 0 && (
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border ${st.badgeColor}`}
                              >
                                {st.count}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block truncate leading-tight">
                            {st.karlaLabel}
                          </span>
                        </div>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Dedicated Workspace Tools */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-black tracking-wider text-slate-700 dark:text-slate-400 uppercase flex items-center justify-between">
              <span>Workspace Tools</span>
              <Sparkles className="w-3 h-3 text-indigo-500" />
            </div>
          )}

          <div className="space-y-1">
            {workspaceTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname === tool.href;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  title={collapsed ? tool.name : undefined}
                  className={`group flex items-center rounded-xl transition-all ${
                    collapsed ? "justify-center p-2.5" : "px-3 py-2 space-x-3"
                  } ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-bold hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40"
                        : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${tool.badgeColor}`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block truncate leading-tight">
                        {tool.subtitle}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
