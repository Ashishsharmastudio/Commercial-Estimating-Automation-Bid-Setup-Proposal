"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOS } from "@/context/OSContext";
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  MapPin,
  Users,
  TrendingUp,
  Mail,
  ArrowRight,
  ShieldCheck,
  Inbox,
  FileSpreadsheet,
  Calculator,
  Send,
  Handshake,
  Trophy,
  Archive,
  ChevronRight,
  Layers,
  Ruler,
  Clock,
} from "lucide-react";

// Karla's 7 Steps Workflow Definition from the Meeting Transcript
const WORKFLOW_STEPS = [
  {
    step: "01",
    stageKey: "NEW_BID_INVITE",
    title: "Bid Triage",
    karlaTitle: "Is It Qualified?",
    subtitle: "Filter 09 64 66 Wood vs Resilient",
    icon: Inbox,
    href: "/triage",
    activeColor: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
    isPrimary: true,
  },
  {
    step: "02",
    stageKey: "QUALIFIED",
    title: "Takeoff Prep",
    karlaTitle: "Scopes Confirmed",
    subtitle: "OneDrive 5-Folders & ClickUp",
    icon: CheckCircle2,
    href: "/triage?tab=qualified",
    activeColor: "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40",
    isPrimary: false,
  },
  {
    step: "03",
    stageKey: "IN_TAKEOFF",
    title: "Drawings Takeoff",
    karlaTitle: "5-8 Hrs Spec Reading",
    subtitle: "Gym SF & Transitions LF",
    icon: FileSpreadsheet,
    href: "#",
    activeColor: "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
    isPrimary: false,
  },
  {
    step: "04",
    stageKey: "FOR_PRICING",
    title: "Vendor Pricing",
    karlaTitle: "Mill Quotes & QBO",
    subtitle: "Robbins/Connor & QuickBooks",
    icon: Calculator,
    href: "#",
    activeColor: "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
    isPrimary: false,
  },
  {
    step: "05",
    stageKey: "ESTIMATE_SENT",
    title: "Bids Sent",
    karlaTitle: "Follow-Up Countdown",
    subtitle: "Dispatched to General Contractors",
    icon: Send,
    href: "#",
    activeColor: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
    isPrimary: false,
  },
  {
    step: "06",
    stageKey: "CLOSING_NEGOTIATION",
    title: "Closing & VE",
    karlaTitle: "Apparent Low Bidder",
    subtitle: "Value Engineering & Alternates",
    icon: Handshake,
    href: "#",
    activeColor: "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40",
    isPrimary: false,
  },
  {
    step: "07",
    stageKey: "WON_AWARDED",
    title: "Won & Awarded",
    karlaTitle: "PM Job Handoff",
    subtitle: "Scheduled for Summer Installation",
    icon: Trophy,
    href: "#",
    activeColor: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
    isPrimary: false,
  },
];

export default function MasterPipelinePage() {
  const { projects, inboxData, loading } = useOS();
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const triageCount = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;
  const qualifiedCount = projects.filter((p) => p.stage === "QUALIFIED").length;
  const watchlistCount = projects.filter((p) => p.stage === "NO_BID_REJECTED").length;
  const multiGCCount = projects.reduce((acc, p) => acc + p.gc_invites.length, 0);

  const totalPipelineValue = projects
    .filter((p) => p.stage !== "NO_BID_REJECTED")
    .reduce((acc, p) => acc + (p.proposal_amount || 0), 0);

  const filteredProjects = projects.filter((p) => {
    const matchesStage = selectedStage === "ALL" || p.stage === selectedStage;
    const matchesSearch =
      !searchQuery ||
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.gc_invites.some((g: any) =>
        g.gc_company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStage && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Synchronizing Atlantic Estimating OS &amp; MongoDB Dossiers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Quick Authority Badge */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-6 sm:p-7 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commercial Gym Division (PA, NY, NJ)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Commercial Estimating Pipeline
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
              Autonomous Layer 2 Qualification filters non-wood resilient specs, validates travel radius, and deduplicates multi-GC bid invites into unified project dossiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/triage"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2"
            >
              <Inbox className="w-4 h-4" />
              <span>Open Stage 1 Triage Desk ({triageCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Karla's 7-Step Commercial Workflow Procedure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Estimating Workflow Procedure (Karla&apos;s 7 Steps)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Click any step to filter the project dossiers below or navigate to the stage workspace.
            </p>
          </div>

          {selectedStage !== "ALL" && (
            <button
              onClick={() => setSelectedStage("ALL")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear Filter (Show All Steps)
            </button>
          )}
        </div>

        {/* Responsive Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {WORKFLOW_STEPS.map((ws) => {
            const Icon = ws.icon;
            const count = projects.filter((p) => p.stage === ws.stageKey).length;
            const isSelected = selectedStage === ws.stageKey;

            return (
              <div
                key={ws.step}
                onClick={() => {
                  if (ws.isPrimary) {
                    window.location.href = ws.href;
                  } else {
                    setSelectedStage(isSelected ? "ALL" : ws.stageKey);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                  isSelected
                    ? "ring-2 ring-indigo-600 border-indigo-600 bg-indigo-100/70 dark:bg-indigo-950/50 shadow-md"
                    : "bg-white dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300 uppercase">
                    STEP {ws.step}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      count > 0
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-black border border-emerald-300 dark:border-emerald-500/40"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-extrabold border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-1">
                  <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-black text-slate-950 dark:text-white truncate">
                    {ws.title}
                  </span>
                </div>

                <p className="text-[11px] font-black text-slate-900 dark:text-slate-200 leading-tight">
                  {ws.karlaTitle}
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate mt-0.5">
                  {ws.subtitle}
                </p>

                {ws.isPrimary && (
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                    Open &rarr;
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Compact Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Awaiting Triage */}
        <Link
          href="/triage"
          className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:border-emerald-500/50 transition group flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Awaiting Karla Triage
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition mt-0.5">
              {triageCount} Bids Waiting
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 Qualification Desk</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
        </Link>

        {/* KPI 2: Pipeline Value */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Active Pipeline Value
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${totalPipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Qualified Hardwood Maple Scope
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Multi-GC Consolidation */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Multi-GC Deduplication
            </span>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-300 mt-0.5">
              {multiGCCount} &rarr; {projects.length} Dossiers
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Zero Duplicate Takeoff Overhead
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Decluttered Active Bids Hub */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-100/90 dark:bg-slate-950/40">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by school name, city, address, or GC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedStage("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStage === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setSelectedStage("NEW_BID_INVITE")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStage === "NEW_BID_INVITE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              Step 1: Triage ({triageCount})
            </button>
            <button
              onClick={() => setSelectedStage("QUALIFIED")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStage === "QUALIFIED"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              Step 2: Qualified ({qualifiedCount})
            </button>
            <button
              onClick={() => setSelectedStage("NO_BID_REJECTED")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStage === "NO_BID_REJECTED"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              Watchlist ({watchlistCount})
            </button>
          </div>
        </div>

        {/* Clean Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-300 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Project Name &amp; Territory</th>
                <th className="py-3 px-4 font-bold">Current Step</th>
                <th className="py-3 px-4 font-bold">CSI Scope &amp; Specification</th>
                <th className="py-3 px-4 font-bold">Gym Footprint &amp; Travel</th>
                <th className="py-3 px-4 font-bold">AI Qualification</th>
                <th className="py-3 px-4 font-bold">Consolidated GCs</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProjects.map((p) => {
                const isBidRec = p.ai_recommendation === "RECOMMEND_BID";
                const isStep1 = p.stage === "NEW_BID_INVITE";
                const isStep2 = p.stage === "QUALIFIED";

                return (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Project Name & Location */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <Link
                        href={`/projects/${p._id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold block transition"
                      >
                        {p.project_name}
                      </Link>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[280px]">{p.project_address}</span>
                      </div>
                      {p.has_unread_addendum && (
                        <span className="inline-flex items-center space-x-1 mt-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded text-[10px] font-bold animate-pulse">
                          <span>UNREAD ADDENDUM ALERT</span>
                        </span>
                      )}
                    </td>

                    {/* Current Step Pill */}
                    <td className="py-3.5 px-4">
                      {isStep1 ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-black px-2.5 py-1 rounded-lg text-[11px] font-extrabold">
                          <Inbox className="w-3 h-3 mr-1" />
                          <span>Step 1: Triage Desk</span>
                        </span>
                      ) : isStep2 ? (
                        <span className="inline-flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-black px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Step 2: Qualified</span>
                        </span>
                      ) : p.stage === "NO_BID_REJECTED" ? (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-400/40 font-black px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <Archive className="w-3 h-3 mr-1" />
                          <span>Watchlist</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-lg text-[11px] font-semibold">
                          {p.stage.replace("_", " ")}
                        </span>
                      )}
                    </td>

                    {/* Scope & CSI */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {p.detected_csi_codes.map((c: any) => c.code).join(", ") || "09 64 66"}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                        {p.has_target_wood_code ? "MFMA Hardwood Maple" : "Resilient / Synthetic"}
                      </div>
                    </td>

                    {/* Footprint & Distance */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {p.estimated_sq_ft.toLocaleString()} SF
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                        {p.distance_miles.toFixed(0)} mi ({p.drive_time_hours.toFixed(1)} hrs)
                      </div>
                    </td>

                    {/* AI Qualification Verdict */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isBidRec
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-black"
                            : "bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-400/40 font-black"
                        }`}
                      >
                        {p.ai_recommendation.replace("_", " ")}
                      </span>
                    </td>

                    {/* Consolidated GCs */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-950 dark:text-slate-100 font-bold truncate max-w-[160px]">
                        {p.gc_invites.map((g: any) => g.gc_company_name).join(", ")}
                      </div>
                      <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold">
                        {p.gc_invites.length} GC(s) consolidated
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isStep1 ? (
                        <Link
                          href="/triage"
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          <span>Triage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/projects/${p._id}`}
                          className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-300 dark:border-slate-700"
                        >
                          <span>Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-semibold">No project dossiers match your filter.</p>
                    <button
                      onClick={() => {
                        setSelectedStage("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
