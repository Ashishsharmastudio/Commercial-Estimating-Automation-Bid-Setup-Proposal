"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOS } from "@/context/OSContext";
import {
  ExternalLink,
  Table,
  Columns,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Sparkles,
  MapPin,
  Users,
  Building,
  TrendingUp,
  FolderSync,
  Mail,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

const STAGES = [
  { key: "NEW_BID_INVITE", label: "1. New Bid Invite" },
  { key: "QUALIFIED", label: "2. Qualified (To Bid)" },
  { key: "IN_TAKEOFF", label: "3. In Takeoff" },
  { key: "FOR_PRICING", label: "4. For Pricing (Karla)" },
  { key: "ESTIMATE_SENT", label: "5. Estimate Sent" },
  { key: "CLOSING_NEGOTIATION", label: "6. Closing / Negotiation" },
  { key: "WON_AWARDED", label: "7. Won - Awarded" },
  { key: "NO_BID_REJECTED", label: "Rejected (Watching Addenda)" },
];

export default function MasterPipelinePage() {
  const { projects, inboxData, loading } = useOS();
  const [viewMode, setViewMode] = useState<"TABLE" | "KANBAN">("TABLE");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProjects = projects.filter((p) => {
    const matchesStage = stageFilter === "ALL" || p.stage === stageFilter;
    const matchesSearch =
      !searchQuery ||
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gc_invites.some((g: any) =>
        g.gc_company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStage && matchesSearch;
  });

  const totalPipelineValue = projects
    .filter((p) => p.stage !== "NO_BID_REJECTED")
    .reduce((acc, p) => acc + (p.proposal_amount || 0), 0);

  const triageCount = projects.filter((p) => p.stage === "NEW_BID_INVITE").length;
  const multiGCCount = projects.reduce((acc, p) => acc + p.gc_invites.length, 0);

  if (loading) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-semibold">
          Synchronizing Atlantic Estimating OS &amp; MongoDB Dossiers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Executive KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link
          href="/triage"
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-emerald-500/50 transition group block relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Awaiting Karla Triage
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 group-hover:text-emerald-400 transition">
            {triageCount} Bids
          </div>
          <p className="text-xs text-emerald-400/90 mt-1 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Pre-Screened CSI 09 64 66</span>
          </p>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/intake"
          className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-indigo-500/50 transition group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Outlook Backlog Intake
            </span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 group-hover:text-indigo-400 transition">
            {inboxData?.unread_inbox_count || 62} Invites
          </div>
          <p className="text-xs text-indigo-400/90 mt-1">
            Dedicated Email (Inbox/Bid Invites)
          </p>
        </Link>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Pipeline Value
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across Qualified &amp; Sent Estimates
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Multi-GC Deduplication
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 mt-2">
            {multiGCCount} → {projects.length}
          </div>
          <p className="text-xs text-purple-400/90 mt-1">
            Zero Duplicate Takeoff Work
          </p>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project, address, GC name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Stage Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Stages ({projects.length})</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("TABLE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              viewMode === "TABLE"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Master Database Grid</span>
          </button>
          <button
            onClick={() => setViewMode("KANBAN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              viewMode === "KANBAN"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>7-Stage Board</span>
          </button>
        </div>
      </div>

      {/* MASTER DATABASE TABLE VIEW */}
      {viewMode === "TABLE" ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Project Name &amp; Location</th>
                  <th className="py-3.5 px-4 font-bold">Stage</th>
                  <th className="py-3.5 px-4 font-bold">AI Verdict &amp; CSI Code</th>
                  <th className="py-3.5 px-4 font-bold">Footprint &amp; Distance</th>
                  <th className="py-3.5 px-4 font-bold">Bidding GCs (Consolidated)</th>
                  <th className="py-3.5 px-4 font-bold">ClickUp &amp; OneDrive</th>
                  <th className="py-3.5 px-4 font-bold">Proposal Amount</th>
                  <th className="py-3.5 px-4 font-bold">Due Date</th>
                  <th className="py-3.5 px-4 font-bold text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProjects.map((p) => {
                  const isBidRec = p.ai_recommendation === "RECOMMEND_BID";
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Address */}
                      <td className="py-4 px-4 font-semibold text-white">
                        <Link
                          href={`/projects/${p._id}`}
                          className="hover:text-indigo-400 transition text-sm font-bold block"
                        >
                          {p.project_name}
                        </Link>
                        <div className="text-slate-400 text-xs flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{p.project_address}</span>
                        </div>
                        {p.has_unread_addendum && (
                          <span className="inline-flex items-center space-x-1 mt-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                            <span>UNREAD ADDENDUM ALERT</span>
                          </span>
                        )}
                      </td>

                      {/* Stage Badge */}
                      <td className="py-4 px-4">
                        <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap">
                          {p.stage.replace("_", " ")}
                        </span>
                      </td>

                      {/* AI Verdict & CSI Code */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            isBidRec
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {p.ai_recommendation.replace("_", " ")}
                        </span>
                        <div className="mt-1 text-slate-400 text-[11px]">
                          {p.detected_csi_codes.map((c: any) => c.code).join(", ") || "None"} •{" "}
                          <span className="text-slate-300 font-medium">{p.work_type.replace("_", " ")}</span>
                        </div>
                      </td>

                      {/* Sq Ft & Drive */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">
                          {p.estimated_sq_ft.toLocaleString()} SF
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {p.distance_miles} mi ({p.drive_time_hours} hrs)
                        </div>
                      </td>

                      {/* Bidding GCs */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-200">
                          {p.gc_invites.map((g: any) => g.gc_company_name).join(", ")}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                          {p.gc_invites.length} GC(s) consolidated
                        </div>
                      </td>

                      {/* ClickUp & OneDrive status */}
                      <td className="py-4 px-4">
                        {p.clickup_task_id ? (
                          <div className="space-y-1">
                            <a
                              href={p.clickup_task_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-[11px] font-bold text-purple-400 hover:text-purple-300"
                            >
                              <span>{p.clickup_task_id}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <div className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>OneDrive Linked</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Pending Karla Approval</span>
                        )}
                      </td>

                      {/* Proposal Amount */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-emerald-400 text-sm">
                          {p.proposal_amount ? `$${p.proposal_amount.toLocaleString()}` : "—"}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {p.quickbooks_estimate_number || "Not Synced"}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-200">{p.bid_due_date}</div>
                        <div className="text-slate-500 text-[10px]">{p.estimated_project_slot}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/projects/${p._id}`}
                          className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 7-STAGE KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((st) => {
            const colProjects = filteredProjects.filter((p) => p.stage === st.key);
            return (
              <div
                key={st.key}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col space-y-3 min-h-[350px]"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-xs uppercase tracking-wide text-slate-300">
                    {st.label}
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-extrabold">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colProjects.map((p) => (
                    <Link
                      key={p._id}
                      href={`/projects/${p._id}`}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500 transition block space-y-2.5 shadow-md"
                    >
                      <div className="font-bold text-sm text-white hover:text-indigo-300 transition">
                        {p.project_name}
                      </div>

                      <div className="text-xs text-slate-400">
                        {p.estimated_sq_ft.toLocaleString()} SF • {p.drive_time_hours} hr drive
                      </div>

                      {p.clickup_task_id && (
                        <div className="text-[10px] font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30 inline-block">
                          ClickUp: {p.clickup_task_id}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                        <span className="font-bold text-emerald-400">
                          {p.proposal_amount ? `$${p.proposal_amount.toLocaleString()}` : "Triage Pending"}
                        </span>
                        <span className="text-slate-500 text-[11px]">Due {p.bid_due_date}</span>
                      </div>
                    </Link>
                  ))}

                  {colProjects.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs font-semibold">
                      No Projects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}