"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOS, ProjectRecord } from "@/context/OSContext";
import {
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Users,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  FolderSync,
  ExternalLink,
  ShieldCheck,
  Check,
  ArrowRight,
  Layers,
  FileCheck2,
  SplitSquareVertical,
  BookOpen,
  Eye,
  Download,
  Building2,
  Calendar,
  Ruler,
  Clock,
  Compass,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  X,
  Send,
  SlidersHorizontal,
} from "lucide-react";

type FilterTab = "all" | "qualified" | "exceptions" | "addenda" | "watchlist";

export default function KarlaTriageQueuePage() {
  const {
    projects,
    canApproveTriageOrPricing,
    currentUser,
    submitKarlaDecision,
    approveProjectWithDrawer,
    rejectProjectWithChip,
    resolveProjectException,
    simulateAddendumWoodSwap,
    provisionClickUpOneDrive,
    resetStage1Bids,
  } = useOS();

  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Active filter tab
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Approval Drawer state
  const [drawerProject, setDrawerProject] = useState<ProjectRecord | null>(null);
  const [assignedEstimator, setAssignedEstimator] = useState<string>("Karla Delaet");
  const [selectedSlot, setSelectedSlot] = useState<string>("Summer 2027");
  const [drawerNotes, setDrawerNotes] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Rejection Modal state
  const [rejectProject, setRejectProject] = useState<ProjectRecord | null>(null);
  const [selectedChip, setSelectedChip] = useState<string>("Non-Wood Scope");
  const [rejectNotes, setRejectNotes] = useState<string>("");
  const [saveAsRule, setSaveAsRule] = useState<boolean>(true);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Quick-fix inline state
  const [quickFixDueDate, setQuickFixDueDate] = useState<Record<string, string>>({});
  const [quickFixSqFt, setQuickFixSqFt] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Expanded details & inspect toggles
  const [expandedInspectId, setExpandedInspectId] = useState<string | null>(null);
  const [expandedGcMap, setExpandedGcMap] = useState<Record<string, boolean>>({});
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Filter project collections
  const qualifiedProjects = projects.filter(
    (p) =>
      p.stage !== "NO_BID_REJECTED" &&
      p.has_target_wood_code &&
      !p.has_missing_vital_facts &&
      p.distance_check_status !== "OUT_OF_TERRITORY_DISQUALIFIED"
  );

  const exceptionProjects = projects.filter(
    (p) =>
      p.has_missing_vital_facts ||
      (p.missing_vital_fields && p.missing_vital_fields.length > 0)
  );

  const addendaProjects = projects.filter((p) => p.has_unread_addendum);

  const watchlistProjects = projects.filter(
    (p) =>
      p.stage === "NO_BID_REJECTED" ||
      p.has_resilient_code_only ||
      p.distance_check_status === "OUT_OF_TERRITORY_DISQUALIFIED"
  );

  const activeTriageProjects = projects.filter(
    (p) => p.stage === "NEW_BID_INVITE" || p.has_unread_addendum
  );

  // Determine which list to render based on activeTab
  let displayedProjects: ProjectRecord[] = [];
  if (activeTab === "all") displayedProjects = activeTriageProjects;
  else if (activeTab === "qualified") displayedProjects = qualifiedProjects;
  else if (activeTab === "exceptions") displayedProjects = exceptionProjects;
  else if (activeTab === "addenda") displayedProjects = addendaProjects;
  else if (activeTab === "watchlist") displayedProjects = watchlistProjects;

  // Handlers
  const openApprovalDrawer = (project: ProjectRecord) => {
    setDrawerProject(project);
    setAssignedEstimator(project.assigned_estimator || "Karla Delaet");
    setSelectedSlot(project.estimated_project_slot || "Summer 2027");
    setDrawerNotes("");
  };

  const handleConfirmApproval = async () => {
    if (!drawerProject) return;
    try {
      setIsApproving(true);
      await approveProjectWithDrawer(drawerProject._id, {
        assigned_estimator: assignedEstimator,
        estimated_project_slot: selectedSlot,
        notes: drawerNotes,
      });
      setDrawerProject(null);
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const openRejectionModal = (project: ProjectRecord) => {
    setRejectProject(project);
    if (project.distance_check_status === "OUT_OF_TERRITORY_DISQUALIFIED") {
      setSelectedChip("Out of Territory");
    } else if (project.has_resilient_code_only) {
      setSelectedChip("Non-Wood Scope");
    } else {
      setSelectedChip("Summer Fully Booked");
    }
    setRejectNotes("");
    setSaveAsRule(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectProject) return;
    try {
      setIsRejecting(true);
      await rejectProjectWithChip(rejectProject._id, {
        rejection_chip: selectedChip,
        notes: rejectNotes,
        save_as_ai_rule: saveAsRule,
      });
      setRejectProject(null);
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleQuickFixResolve = async (project: ProjectRecord) => {
    try {
      setResolvingId(project._id);
      const dueDate = quickFixDueDate[project._id] || project.bid_due_date;
      const sqFt = quickFixSqFt[project._id] ? parseFloat(quickFixSqFt[project._id]) : project.estimated_sq_ft;
      await resolveProjectException(project._id, {
        bid_due_date: dueDate && dueDate !== "TBD" ? dueDate : "2026-12-18",
        estimated_sq_ft: sqFt > 0 ? sqFt : 9500,
      });
    } catch (err) {
      console.error("Resolve error:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSimulateAddendum = async (projectId: string) => {
    try {
      setSimulatingId(projectId);
      await simulateAddendumWoodSwap(projectId);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingId(null);
    }
  };

  const toggleGcExpand = (id: string) => {
    setExpandedGcMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Stage 1 Executive Desk Header */}
      <div className="bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/40 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Stage 1: Bid Qualification &amp; Triage Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Karla&apos;s Bid Qualification Desk
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
              Autonomous Layer 2 Smart AI pre-filters gym specifications, enforces Division 09 64 66 hardwood specialty, verifies distance logistics, and consolidates competing GCs into a unified master dossier.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 p-4 rounded-xl text-xs space-y-2 text-right">
            <div>
              <span className="text-slate-700 dark:text-slate-400 block font-bold">Sole Approving Authority:</span>
              <span className="text-slate-950 dark:text-white font-bold text-sm">{currentUser.full_name}</span>
              <span className="text-slate-600 dark:text-slate-400 block text-[11px] font-semibold">({currentUser.role.replace("_", " ")})</span>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              {canApproveTriageOrPricing ? (
                <span className="inline-flex items-center text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Karla Gatekeeper Active
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-400 font-bold bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Read-Only Authority
                </span>
              )}
              <button
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    await resetStage1Bids();
                  } finally {
                    setIsResetting(false);
                  }
                }}
                disabled={isResetting}
                className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                title="Re-populate Stage 1 with fresh spec-linked dossiers"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isResetting ? "animate-spin" : ""}`} />
                <span>{isResetting ? "Re-arming..." : "Re-arm Bids"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Layer Architectural Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 shadow-sm"
          }`}
        >
          <span>All Active Bids</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold"
            }`}
          >
            {activeTriageProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("qualified")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "qualified"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 shadow-sm"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Qualified (Hardwood Maple)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "qualified" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold"
            }`}
          >
            {qualifiedProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("exceptions")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "exceptions"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 shadow-sm"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Exceptions / Missing Info</span>
          {exceptionProjects.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
              {exceptionProjects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("addenda")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "addenda"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30"
              : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 shadow-sm"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Addendum Alerts</span>
          {addendaProjects.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
              {addendaProjects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "watchlist"
              ? "bg-rose-700 text-white shadow-lg shadow-rose-700/30"
              : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 shadow-sm"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Disqualified / Watchlist</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "watchlist" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold"
            }`}
          >
            {watchlistProjects.length}
          </span>
        </button>
      </div>

      {/* Main Feed */}
      {displayedProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Queue Clear in this Category</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium max-w-md mx-auto">
            No active bids match the selected filter. Ingest incoming bids from Karla&apos;s Outlook folder or upload PDFs via the Document Inspector.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={async () => {
                setIsResetting(true);
                try {
                  await resetStage1Bids();
                } finally {
                  setIsResetting(false);
                }
              }}
              disabled={isResetting}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-lg shadow-emerald-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Re-arming..." : "Arm Stage 1 with Fresh Spec Bids"}</span>
            </button>
            <Link
              href="/intake"
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg transition"
            >
              <span>Go to Email Intake Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedProjects.map((p) => {
            const isBidRec = p.ai_recommendation === "RECOMMEND_BID";
            const isAddendumAlert = p.has_unread_addendum;
            const hasMissingFacts = p.has_missing_vital_facts || (p.missing_vital_fields && p.missing_vital_fields.length > 0);
            const isSimulating = simulatingId === p._id;
            const isResolving = resolvingId === p._id;

            // Distance tier styling
            let distBadgeColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
            if (p.distance_check_status === "HIGH_OVERHEAD" || p.distance_check_status === "REGIONAL_HIGH_OVERHEAD") {
              distBadgeColor = "bg-amber-500/15 border-amber-500/30 text-amber-300";
            } else if (p.distance_check_status === "OUT_OF_TERRITORY_DISQUALIFIED") {
              distBadgeColor = "bg-rose-500/15 border-rose-500/30 text-rose-300";
            } else if (p.distance_check_status === "COLLEGIATE_ARENA_EXEMPTION") {
              distBadgeColor = "bg-indigo-500/15 border-indigo-500/30 text-indigo-300";
            }

            return (
              <div
                key={p._id}
                className={`bg-white dark:bg-slate-900/90 rounded-2xl border overflow-hidden shadow-sm dark:shadow-2xl transition-all ${
                  isAddendumAlert
                    ? "border-amber-500/80 shadow-amber-500/10 ring-1 ring-amber-500/50"
                    : hasMissingFacts
                    ? "border-amber-500/60 shadow-amber-500/5"
                    : isBidRec
                    ? "border-emerald-500/60 shadow-emerald-500/5"
                    : "border-rose-500/50 shadow-rose-500/5"
                }`}
              >
                {/* AI Verdict & Gatekeeper Status Bar */}
                <div
                  className={`px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold ${
                    isAddendumAlert
                      ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-black animate-pulse-subtle"
                      : hasMissingFacts
                      ? "bg-gradient-to-r from-amber-800 to-slate-900 text-amber-100"
                      : isBidRec
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white"
                      : "bg-gradient-to-r from-rose-800 to-slate-900 text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm tracking-wide">
                      {isAddendumAlert
                        ? "ADDENDUM WATCHDOG ALERT — SCOPE SWAPPED TO HARDWOOD MAPLE (09 64 66)"
                        : hasMissingFacts
                        ? `DATA GATEKEEPER EXCEPTION: Missing ${p.missing_vital_fields?.join(", ") || "Vital Fields"}`
                        : `AI VERDICT: ${p.ai_recommendation.replace("_", " ")} (${Math.round(
                            p.ai_confidence_score * 100
                          )}% Confidence)`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 opacity-90 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: <strong>{p.bid_due_date || "TBD"}</strong></span>
                    </span>
                    <span>•</span>
                    <span>Target Slot: <strong>{p.estimated_project_slot}</strong></span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left 2 Cols: Details, Badges, Citations, Deduplication */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Project Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/projects/${p._id}`}
                            className="text-xl font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                          >
                            {p.project_name}
                          </Link>
                          {p.stage === "QUALIFIED" && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Stage 2 Ready
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {p.project_address}
                          </span>
                          <span>•</span>
                          <span>Architect: <strong className="text-slate-900 dark:text-slate-200">{p.architect_firm_name || "N/A"}</strong></span>
                        </div>
                      </div>

                      {/* Distance-vs-Footprint & Scope Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dynamic Distance Badge */}
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center space-x-1 ${distBadgeColor}`}
                          title={p.distance_check_notes}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>
                            {p.distance_check_badge ||
                              `${p.distance_miles.toFixed(0)} mi (${p.drive_time_hours.toFixed(1)} hrs)`}
                          </span>
                        </span>

                        {/* Footprint Pill */}
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center space-x-1">
                          <Ruler className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {p.estimated_sq_ft > 0 ? `${p.estimated_sq_ft.toLocaleString()} SF` : "SF TBD"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Multi-GC Job Deduplication Dossier */}
                    <div className="bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 p-3.5 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              Multi-GC Deduplicated Dossier ({p.gc_invites.length} Bidding General Contractors)
                            </span>
                            <span className="text-slate-600 dark:text-slate-600 dark:text-slate-400 text-[11px] font-semibold block">
                              Unified single takeoff estimate to eliminate redundant bidding.
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleGcExpand(p._id)}
                          className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white flex items-center space-x-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700/50 transition"
                        >
                          <span>{expandedGcMap[p._id] ? "Collapse GCs" : "View Competing GCs"}</span>
                          {expandedGcMap[p._id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedGcMap[p._id] && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.gc_invites.map((gc: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 text-[11px]">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                <span>{gc.gc_company_name}</span>
                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-semibold">
                                  {gc.source_platform}
                                </span>
                              </div>
                              <div className="text-slate-400 mt-1">
                                {gc.gc_contact_name ? `Contact: ${gc.gc_contact_name}` : "Portal Invite"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* The Data Gatekeeper Inline Quick-Fix Form (if missing vital facts) */}
                    {hasMissingFacts && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 p-4 rounded-xl text-xs space-y-3">
                        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>The Data Gatekeeper: Missing Information Detected</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                          Quick-fix missing project parameters directly to unblock business rules and verify distance-to-footprint qualification:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold font-bold">
                              Bid Due Date (Missing / TBD)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 2026-12-18 or Dec 18, 2026"
                              value={quickFixDueDate[p._id] ?? p.bid_due_date ?? ""}
                              onChange={(e) =>
                                setQuickFixDueDate({ ...quickFixDueDate, [p._id]: e.target.value })
                              }
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold font-bold">
                              Gymnasium Footprint (Est. Sq Ft)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 9500"
                              value={quickFixSqFt[p._id] ?? (p.estimated_sq_ft > 0 ? p.estimated_sq_ft : "")}
                              onChange={(e) =>
                                setQuickFixSqFt({ ...quickFixSqFt, [p._id]: e.target.value })
                              }
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleQuickFixResolve(p)}
                            disabled={isResolving}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1.5 shadow"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{isResolving ? "Verifying Rules..." : "Verify & Resolve Gatekeeper"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Plain-English AI Intelligence Summary */}
                    <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-300 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                            Specification Intelligence Analysis
                          </span>
                          <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{p.ai_model_name || "Google Gemini 1.5 Flash"}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setExpandedInspectId(expandedInspectId === p._id ? null : p._id)}
                            className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-300 dark:border-indigo-700/60 px-2.5 py-1 rounded-lg transition shadow-sm"
                          >
                            <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{expandedInspectId === p._id ? "Hide Spec View" : "Inspect Side-by-Side"}</span>
                          </button>
                          <Link
                            href="/inspector"
                            className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Full Inspector</span>
                          </Link>
                        </div>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{p.ai_reasoning_summary}</p>

                      {/* Collapsible Side-by-Side Spec Inspector */}
                      {expandedInspectId === p._id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-[#080c14] p-4 rounded-xl border border-slate-300 dark:border-slate-700/60">
                          {/* Left: Document Excerpts */}
                          <div className="space-y-2 border-r border-slate-800/80 pr-3">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-300">
                              <span className="flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Indexed Specification Clauses</span>
                              </span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-300 space-y-2 max-h-56 overflow-y-auto">
                              {p.detected_csi_codes.map((c: any, idx: number) => (
                                <div key={idx} className="pb-1.5 border-b border-slate-800/60 last:border-none">
                                  <span className={`font-bold ${c.is_target_wood ? "text-emerald-400" : "text-rose-400"}`}>
                                    SECTION {c.code} [Page {c.page_number}]
                                  </span>
                                  <p className="mt-0.5 text-slate-400 leading-normal">{c.snippet}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Extracted Scope & Confirmation */}
                          <div className="space-y-2 pl-1">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 block font-bold">
                              Automated Scope Extraction &amp; Mills
                            </span>
                            <div className="p-3 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-2 text-slate-800 dark:text-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Target Hardwood:</span>
                                <span className={`font-bold ${p.has_target_wood_code ? "text-emerald-400" : "text-rose-400"}`}>
                                  {p.has_target_wood_code ? "CONFIRMED (09 64 66)" : "EXCLUDED (NON-WOOD)"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Gym Footprint:</span>
                                <span className="font-bold text-amber-300">
                                  {p.estimated_sq_ft > 0 ? `${p.estimated_sq_ft.toLocaleString()} SF` : "Pending Takeoff"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Specified Mills:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[160px]">
                                  {p.specified_manufacturers?.map((m: any) => m.manufacturer_name).join(", ") || "Robbins / Connor Maple"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Distance-vs-Scale:</span>
                                <span className="font-bold text-indigo-300">{p.distance_check_badge}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CSI Citations List */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400 block">
                        Verified CSI Division 09 Citations &amp; Scope
                      </span>
                      {p.detected_csi_codes.map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs ${
                            c.is_target_wood
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200"
                              : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-950 dark:text-white text-xs">
                              CSI {c.code} — {c.title}
                            </span>
                            <span className="text-[10px] opacity-75">
                              {c.document_name} • Page {c.page_number}
                            </span>
                          </div>
                          <p className="mt-1 italic text-slate-600 dark:text-slate-300">&ldquo;{c.snippet}&rdquo;</p>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Demo Action: Addendum Wood Swap Simulation */}
                    {p.has_resilient_code_only && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 block">
                            Addendum Watchdog Simulation: Wood Scope Swap
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Tests Karla&apos;s edge case: if architect releases Addendum #2 changing synthetic 09 65 66 to 09 64 66 Maple, watchdog immediately re-qualifies it.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSimulateAddendum(p._id)}
                          disabled={isSimulating}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg transition shrink-0 flex items-center space-x-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                          <span>Simulate Addendum #2</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Stage 1 Gatekeeper Action Box */}
                  <div className="bg-slate-50/80 dark:bg-slate-950/90 p-5 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="border-b border-slate-300 dark:border-slate-800 pb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-400 block">
                          Stage 1 Gatekeeper Authority
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          Claim or Decline Decision
                        </h4>
                      </div>

                      {/* Layer 4 Automation Blueprint Preview */}
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                        <span className="font-bold text-indigo-400 block flex items-center space-x-1">
                          <FolderSync className="w-3.5 h-3.5 mr-1" />
                          <span>Automated Layer 4 Provisioning:</span>
                        </span>
                        <div className="space-y-1 text-slate-600 dark:text-slate-400">
                          <p className="flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ClickUp Estimating Task ({p.assigned_estimator || "Karla"})</span>
                          </p>
                          <p className="flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>OneDrive Hierarchy ({p.onedrive_subfolders?.length || 5} folders)</span>
                          </p>
                          <p className="flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Permanent Audit Ledger Logging</span>
                          </p>
                        </div>
                      </div>

                      {/* Provisioned status badges if already approved */}
                      {p.clickup_task_url && (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 rounded-lg text-[11px] space-y-1">
                          <span className="text-emerald-900 dark:text-emerald-300 font-extrabold block">✓ ClickUp Task Active:</span>
                          <a
                            href={p.clickup_task_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center space-x-1 truncate"
                          >
                            <span>{p.clickup_task_id}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {p.onedrive_project_folder_url && (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 rounded-lg text-[11px] space-y-1">
                          <span className="text-emerald-900 dark:text-emerald-300 font-extrabold block">✓ OneDrive Provisioned:</span>
                          <a
                            href={p.onedrive_project_folder_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center space-x-1 truncate"
                          >
                            <span>Open Cloud Directory</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800">
                      <button
                        disabled={!canApproveTriageOrPricing}
                        onClick={() => openApprovalDrawer(p)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE / CLAIM PROJECT</span>
                      </button>

                      <button
                        disabled={!canApproveTriageOrPricing}
                        onClick={() => openRejectionModal(p)}
                        className="w-full bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/80 hover:border-rose-300 dark:hover:border-rose-500/50 border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>DECLINE / NO-BID</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Interactive Approval Drawer */}
      {drawerProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Approve &amp; Claim Project</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Launch Layer 4 Business Software Automation</span>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerProject(null)}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vital Facts Checklist */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-300 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Vital Facts Verification
                </span>
                <div className="space-y-2 text-slate-800 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project:</span>
                    <span className="font-bold text-slate-950 dark:text-white text-right truncate max-w-[220px]">
                      {drawerProject.project_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address / Distance:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {drawerProject.distance_miles.toFixed(0)} mi ({drawerProject.drive_time_hours.toFixed(1)} hrs)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gym Footprint:</span>
                    <span className="font-bold text-amber-300">
                      {drawerProject.estimated_sq_ft.toLocaleString()} SF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CSI Classification:</span>
                    <span className="font-bold text-emerald-400">09 64 66 (Wood Athletic Flooring)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Competing GCs:</span>
                    <span className="font-semibold text-indigo-300">
                      {drawerProject.gc_invites.length} GCs Consolidated
                    </span>
                  </div>
                </div>
              </div>

              {/* Assign Estimator & Installation Slot */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold.5 font-bold">
                    Assign Lead Estimator
                  </label>
                  <select
                    value={assignedEstimator}
                    onChange={(e) => setAssignedEstimator(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
                  >
                    <option value="Karla Delaet">Karla Delaet (Senior Estimator &amp; Sole Gatekeeper)</option>
                    <option value="John Delaet">John Delaet (Owner &amp; Senior Estimator)</option>
                    <option value="Takeoff Assistant">Takeoff Assistant / Junior Estimator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold.5 font-bold">
                    Target Installation Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
                  >
                    <option value="Summer 2027">Summer 2027 (Peak School Gymnasium Season)</option>
                    <option value="Summer 2026">Summer 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold.5 font-bold">
                    Estimating Notes / Takeoff Scope Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Verify moisture mitigation on sheet A103; request manufacturer pricing from Connor Sports..."
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
                  />
                </div>
              </div>

              {/* Layer 4 Automation Execution Checklist */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-300 dark:border-slate-800 text-xs space-y-2">
                <span className="font-bold text-indigo-400 block flex items-center space-x-1.5">
                  <FolderSync className="w-3.5 h-3.5" />
                  <span>Automated Setup upon Confirmation:</span>
                </span>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                  <p className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Create ClickUp Bid Task with custom fields &amp; countdown timer</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Provision OneDrive hierarchy: 5 subfolders (Specs, Plans, Addenda, Takeoff, Quotes)</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Record immutable audit ledger entry in project timeline</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Transition status to <strong>QUALIFIED</strong> (Stage 2 Takeoff Desk)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-slate-800 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setDrawerProject(null)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmApproval}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning ClickUp &amp; OneDrive...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM &amp; LAUNCH AUTOMATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Reason Rejection Modal */}
      {rejectProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Decline Bid / No-Bid</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Archive to Disqualified Watchlist</span>
                </div>
              </div>
              <button
                onClick={() => setRejectProject(null)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project Summary */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-slate-400">Project: </span>
              <strong className="text-slate-950 dark:text-white">{rejectProject.project_name}</strong>
            </div>

            {/* Quick Reason Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block font-bold">
                Select Primary Decline Reason
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Out of Territory",
                  "Non-Wood Scope",
                  "Summer Fully Booked",
                  "Poor GC Terms",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSelectedChip(chip)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition text-left border ${
                      selectedChip === chip
                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm font-black"
                        : "bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-800 dark:text-slate-800 dark:text-slate-300 block font-bold mb-1 font-bold.5 font-bold">
                Additional Decline Notes
              </label>
              <textarea
                rows={3}
                placeholder="Optional explanation for audit log and AI training..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
              />
            </div>

            {/* AI Rule Checkbox */}
            <label className="flex items-center space-x-2.5 text-xs text-slate-800 dark:text-slate-300 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={saveAsRule}
                onChange={(e) => setSaveAsRule(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Save this rejection reason into AI Qualifier memory rules</span>
            </label>

            {/* Watchdog Note */}
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 p-3 rounded-lg text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start space-x-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Addendum Watchdog Active:</strong> This project will remain monitored. If an architect addendum changes the scope to hardwood maple or reschedules the bid date, it will immediately surge back into Karla&apos;s queue.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setRejectProject(null)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleConfirmRejection}
                className="w-2/3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2"
              >
                {isRejecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>CONFIRM NO-BID ARCHIVE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}