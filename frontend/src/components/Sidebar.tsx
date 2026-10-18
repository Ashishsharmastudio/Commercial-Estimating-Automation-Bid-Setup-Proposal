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
  FileCheck2,
  Mail,
  Presentation,
  Sliders,
  ShieldCheck,
  SplitSquareVertical,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { projects, inboxData, currentUser } = useOS();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Karla's Phase Counts
  const phase1Count = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;
  const phase2Count = projects.filter((p) => p.stage === "QUALIFIED").length;
  const phase3Count = projects.filter((p) => p.stage === "IN_TAKEOFF").length;
  const phase4Count = projects.filter((p) => p.stage === "FOR_PRICING").length;
  const phase5Count = projects.filter((p) => p.stage === "ESTIMATE_SENT").length;
  const phase6Count = projects.filter((p) => p.stage === "CLOSING_NEGOTIATION").length;
  const phase7Count = projects.filter((p) => p.stage === "WON_AWARDED").length;
  const archiveCount = projects.filter((p) => p.stage === "NO_BID_REJECTED").length;

  const phases = [
    {
      id: "phase-1",
      number: "1",
      name: "New Bid Invites",
      karlaLabel: "Is It Qualified? Triage Desk",
      count: phase1Count,
      href: "/triage",
      icon: Inbox,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      activeBorder: "border-emerald-500",
      bgHover: "hover:bg-emerald-950/30",
      isLocked: false,
      statusLabel: "ACTIVE (STAGE 1)",
    },
    {
      id: "phase-2",
      number: "2",
      name: "Qualified To Bid",
      karlaLabel: "Scopes & Wood Confirmed",
      count: phase2Count,
      href: "/#",
      icon: CheckCircle2,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 2)",
    },
    {
      id: "phase-3",
      number: "3",
      name: "In Takeoff",
      karlaLabel: "Specs & Drawings Reading (5-8 Hrs)",
      count: phase3Count,
      href: "/#",
      icon: FileSpreadsheet,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 3)",
    },
    {
      id: "phase-4",
      number: "4",
      name: "For Pricing",
      karlaLabel: "Mill Quotes & Karla Pricing Desk",
      count: phase4Count,
      href: "/#",
      icon: Calculator,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 4)",
    },
    {
      id: "phase-5",
      number: "5",
      name: "Estimates Sent",
      karlaLabel: "Follow-Up Clock Running",
      count: phase5Count,
      href: "/#",
      icon: Send,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 5)",
    },
    {
      id: "phase-6",
      number: "6",
      name: "Negotiation & VE",
      karlaLabel: "Apparent Low Bidder",
      count: phase6Count,
      href: "/#",
      icon: Handshake,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 6)",
    },
    {
      id: "phase-7",
      number: "7",
      name: "Won & Awarded",
      karlaLabel: "PM Job Handoff",
      count: phase7Count,
      href: "/#",
      icon: Trophy,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED (PHASE 7)",
    },
    {
      id: "archive",
      number: "—",
      name: "No Bid / Watching",
      karlaLabel: "Disqualified & Addenda Watch",
      count: archiveCount,
      href: "/#",
      icon: Archive,
      badgeColor: "bg-slate-700 text-slate-400 border-slate-600",
      activeBorder: "border-slate-700",
      bgHover: "hover:bg-transparent",
      isLocked: true,
      statusLabel: "LOCKED",
    },
  ];

  const primaryWorkspaces = [
    {
      name: "Spec Inspector (Split)",
      description: "Side-by-side Document vs AI Analysis",
      href: "/inspector",
      icon: SplitSquareVertical,
      badge: "LIVE AI",
      badgeColor: "bg-indigo-500/30 text-indigo-200 border-indigo-400/40",
    },
    {
      name: "Karla's Triage Desk",
      description: "Sole Gatekeeper Approvals",
      href: "/triage",
      icon: FileCheck2,
      badge: phase1Count > 0 ? `${phase1Count} NEW` : undefined,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      name: "Outlook & Portal Sync",
      description: "Graph API / IMAP Harvester",
      href: "/intake",
      icon: Mail,
      badge: inboxData ? `${inboxData.unread_inbox_count}` : "62",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      name: "Pipeline Master Grid",
      description: "All 7 Estimating Stages",
      href: "/",
      icon: Layers,
    },
    {
      name: "Executive Architecture",
      description: "Full Operating Blueprint (For John)",
      href: "/proposal",
      icon: Presentation,
      badge: "JOHN",
      badgeColor: "bg-purple-500/30 text-purple-200 border-purple-400/40",
    },
    {
      name: "AI Rules & Geofence",
      description: "PA/NY/NJ 3-Hr Rules & Feedback",
      href: "/settings",
      icon: Sliders,
    },
  ];

  return (
    <aside
      className={`relative z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 flex flex-col shrink-0 ${
        collapsed ? "w-20" : "w-72"
      } min-h-screen`}
    >
      {/* Top Brand / Header */}
      <div className="h-18 px-4 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">ATLANTIC</span>
                <span className="text-[9px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.2 rounded">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Karla&apos;s Estimating Engine
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Scrollable Nav Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section: Operational Workspaces */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
              <span>Workspaces</span>
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
          )}
          <div className="space-y-1">
            {primaryWorkspaces.map((ws) => {
              const Icon = ws.icon;
              const isActive = pathname === ws.href;
              return (
                <Link
                  key={ws.href}
                  href={ws.href}
                  title={collapsed ? ws.name : undefined}
                  className={`group flex items-center rounded-xl transition-all ${
                    collapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
                  } ${
                    isActive
                      ? "bg-slate-800/90 text-white shadow-md border border-indigo-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isActive
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        : "bg-slate-800/60 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                          {ws.name}
                        </span>
                        {ws.badge && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${ws.badgeColor}`}
                          >
                            {ws.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-medium">
                        {ws.description}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section: Estimating Phases in Karla's Language */}
        <div>
          {!collapsed ? (
            <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
              <span>Estimating Phases</span>
              <span className="text-[9px] text-amber-400 font-semibold">Karla SOP</span>
            </div>
          ) : (
            <div className="h-px bg-slate-800 my-2" />
          )}

          <div className="space-y-1">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isStage1 = !phase.isLocked;
              const isCurrent = pathname === "/triage" || pathname === "/inspector";

              if (isStage1) {
                return (
                  <Link
                    key={phase.id}
                    href={phase.href}
                    title={collapsed ? `${phase.name} (Active Phase 1)` : undefined}
                    className={`group flex items-center rounded-xl transition-all ${
                      collapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
                    } bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 shadow-md`}
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-400/60 flex items-center justify-center text-[10px] font-extrabold text-emerald-300 shrink-0">
                      1
                    </div>

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white group-hover:text-emerald-300 truncate">
                            {phase.name}
                          </span>
                          <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full animate-pulse">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/90 truncate font-semibold">
                          {phase.karlaLabel}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              }

              // Deactivated / Locked Stages (2-7 & Archive)
              return (
                <div
                  key={phase.id}
                  title="Locked for Phase 1. As Karla agreed in the meeting, we are implementing stage by stage. Stage 1 is currently active."
                  className={`group flex items-center rounded-xl transition-all ${
                    collapsed ? "justify-center p-3" : "px-3 py-2 space-x-3"
                  } opacity-35 cursor-not-allowed select-none hover:bg-transparent`}
                >
                  <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 truncate">
                          {phase.name}
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                          STAGE ROLLOUT
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate italic">
                        {phase.karlaLabel}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Telemetry Pulse */}
        {!collapsed && (
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Live Connectors</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">MS Graph API</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Listening</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">PyMuPDF Engine</span>
                <span className="text-indigo-400 font-semibold">Active (0.2s)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">ClickUp &amp; OneDrive</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Authority Badge at Bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
              <p className="text-[10px] text-amber-400 truncate font-semibold">
                Sole Triage Gatekeeper
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
