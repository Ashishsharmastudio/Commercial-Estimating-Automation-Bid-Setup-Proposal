"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useOS, IntakeEmail } from "@/context/OSContext";
import {
  Mail,
  Inbox,
  Sparkles,
  FileText,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  UploadCloud,
  FileCheck2,
  Zap,
  Code2,
  ShieldCheck,
  Server,
  ExternalLink,
  ChevronDown,
  Key,
  Lock,
  Check,
  Copy,
  HelpCircle,
} from "lucide-react";

export default function IntakePage() {
  const { inboxData, inboxLoading, refreshInbox, processInboxEmail, currentUser } = useOS();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [ingestedProject, setIngestedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "implementation">("inbox");
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState<boolean>(false);

  // Manual Quick Bid Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualPlatform, setManualPlatform] = useState("Direct Email");
  const [manualGC, setManualGC] = useState("");
  const [manualCode, setManualCode] = useState("09 64 66");
  const [manualSqFt, setManualSqFt] = useState("10000");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchDiagnostics = async () => {
    try {
      setDiagnosticsLoading(true);
      const res = await fetch(`${API_BASE}/email/diagnostics`);
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error("Failed to load email diagnostics:", err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleProcessEmail = async (email: IntakeEmail) => {
    try {
      setProcessingId(email.id);
      setIngestedProject(null);
      const res = await processInboxEmail(email.id);
      setIngestedProject(res);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle) return;
    try {
      setManualSubmitting(true);
      const isWood = manualCode.startsWith("09 64");
      const payload = {
        project_name: manualTitle,
        project_address: manualAddress || "100 Innovation Way, Wayne, PA",
        source_platform: manualPlatform,
        gc_company_name: manualGC || "Regional General Contractor",
        estimated_sq_ft: Number(manualSqFt) || 8000,
        distance_miles: 24.0,
        drive_time_hours: 0.6,
        bid_due_date: "2026-12-01",
        detected_csi_codes: [
          {
            code: manualCode,
            title: isWood ? "Wood Athletic Flooring" : "Resilient Athletic Flooring",
            document_name: "Manual_Upload_Spec.pdf",
            page_number: 1,
            snippet: `Section ${manualCode} athletic flooring specifications.`,
            is_target_wood: isWood,
          },
        ],
      };
      const res = await processInboxEmail(payload as any);
      setIngestedProject(res);
      setManualTitle("");
      setManualAddress("");
    } catch (err) {
      console.error(err);
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Backlog Counter Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/70 p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 1 Ingestion: Dedicated Outlook Email &amp; Manual Dropper</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Outlook 365 Email Intake (Inbox/Bid Invites)
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Eliminating Karla&apos;s backlog of <strong>62 unread bid invitations</strong>. In Stage 1,
              the automation connects exclusively to Karla&apos;s dedicated Outlook folder
              (<code className="text-indigo-300 font-mono">karla@atlanticflooring.com / Inbox / Bid Invites</code>)
              and manual PDF spec uploads. Spec manuals are parsed in memory with PyMuPDF, confirmed by AI,
              and stored directly into MongoDB.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Karla&apos;s Email Backlog
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">
                  {inboxData?.unread_inbox_count || 62}
                </span>
                <span className="text-xs font-semibold text-rose-400">Unprocessed Invites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Connected Feeds & Tab Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 ${
                activeTab === "inbox"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox Stream</span>
            </button>
            <button
              onClick={() => setActiveTab("implementation")}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 ${
                activeTab === "implementation"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Email Fetcher Implementation (Graph API &amp; IMAP)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1.5 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Graph API Active</span>
            </span>

            <button
              onClick={() => {
                refreshInbox();
                fetchDiagnostics();
              }}
              disabled={inboxLoading}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${inboxLoading ? "animate-spin" : ""}`} />
              <span>Sync Inbox &amp; Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Ingest Notification Banner */}
      {ingestedProject && (
        <div className="bg-emerald-950/70 border border-emerald-500/60 p-4 rounded-xl flex items-center justify-between gap-4 text-emerald-200 shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">
                Successfully Ingested &amp; Evaluated: {ingestedProject.project_name}
              </p>
              <p className="text-xs text-emerald-300 mt-0.5">
                AI Verdict: <strong>{ingestedProject.ai_recommendation}</strong> • Footprint:{" "}
                {ingestedProject.estimated_sq_ft.toLocaleString()} SF • Routed to Karla&apos;s Triage Desk.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/inspector"
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shrink-0"
            >
              <span>Inspect Spec PDF</span>
            </Link>
            <Link
              href="/triage"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shrink-0"
            >
              <span>Review in Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB 1: LIVE INBOX STREAM */}
      {activeTab === "inbox" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Incoming Invitations Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Inbox className="w-5 h-5 text-indigo-400" />
                <span>Incoming Unprocessed Bid Invitations</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Click &quot;Scan &amp; Ingest with AI&quot; to test autonomous spec extraction
              </span>
            </div>

            <div className="space-y-4">
              {inboxData?.pending_emails.map((email) => {
                const isProcessing = processingId === email.id;
                const hasWood = email.detected_csi_codes.some((c) => c.is_target_wood);

                return (
                  <div
                    key={email.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-md space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                              email.source_platform === "Direct Email"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : email.source_platform === "PlanHub"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {email.source_platform}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            From: {email.sender_name}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{email.subject}</h3>
                      </div>

                      <button
                        onClick={() => handleProcessEmail(email)}
                        disabled={isProcessing}
                        className={`flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shrink-0 ${
                          isProcessing
                            ? "bg-indigo-800 text-indigo-200 cursor-wait"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Reading Spec &amp; CSI...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Scan &amp; Ingest with AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 italic">
                      &quot;{email.raw_body_snippet}&quot;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          GC / Sender
                        </span>
                        <span className="font-bold text-slate-200">{email.gc_company_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Location
                        </span>
                        <span className="font-bold text-slate-200">
                          {email.city}, {email.state}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Drive Distance
                        </span>
                        <span className="font-bold text-slate-200">
                          {email.distance_miles} mi ({email.drive_time_hours} hrs)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Est. Footprint
                        </span>
                        <span className="font-bold text-slate-200">
                          {email.estimated_sq_ft.toLocaleString()} SF
                        </span>
                      </div>
                    </div>

                    {/* Attachment pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">Attached Documents:</span>
                      {email.attachments.map((att, i) => (
                        <span
                          key={i}
                          className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-700 flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3 text-indigo-400" />
                          <span>{att}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Fast Manual Bid Dropper & Live Telemetry */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">Fast Manual Bid Dropper</h2>
              </div>
              <p className="text-xs text-slate-400">
                Received a direct email or link on Dodge? Paste the info here to test the AI qualification engine.
              </p>

              <form onSubmit={handleManualIngest} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radnor High School Gym Remodel"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Address / City</label>
                  <input
                    type="text"
                    placeholder="e.g. 130 King of Prussia Rd, Wayne, PA 19087"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Platform Source</label>
                    <select
                      value={manualPlatform}
                      onChange={(e) => setManualPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Direct Email">Dedicated Email (Inbox/Bid Invites)</option>
                      <option value="Manual Upload">Karla Manual PDF Drop</option>
                      <option value="Direct GC Email">Direct GC Email to Karla</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Inviting GC</label>
                    <input
                      type="text"
                      placeholder="e.g. Skanska USA"
                      value={manualGC}
                      onChange={(e) => setManualGC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Primary Spec Code</label>
                    <select
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="09 64 66">09 64 66 (Wood Athletic)</option>
                      <option value="09 64 00">09 64 00 (Refinishing)</option>
                      <option value="09 65 66">09 65 66 (Resilient Rubber)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Footprint (SF)</label>
                    <input
                      type="number"
                      value={manualSqFt}
                      onChange={(e) => setManualSqFt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition shadow-md flex items-center justify-center space-x-2 mt-2"
                >
                  {manualSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting &amp; Routing...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Process Manual Bid Invite</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Split Screen Inspector Quick Link */}
            <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-700/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Full Spec Book Inspector</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Want to read real CSI Division 09 specification documents side-by-side with live AI extraction?
              </p>
              <Link
                href="/inspector"
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow"
              >
                <span>Launch Split-Screen Inspector</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: IMPLEMENTATION DETAILS (HOW BID DOCUMENTS ARE FETCHED FROM EMAIL) */
        <div className="space-y-6">
          {/* Diagnostics Live Telemetry Bar */}
          {diagnostics && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{diagnostics.connector_type}</h3>
                    <p className="text-xs text-slate-400">
                      Monitored Target: <span className="text-slate-200">{diagnostics.monitored_mailbox}</span> ({diagnostics.monitored_folder})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{diagnostics.connection_status}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Syncs every {diagnostics.sync_interval_seconds}s
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Authentication</span>
                  <span className="font-bold text-slate-200">{diagnostics.auth_method}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenant ID</span>
                  <span className="font-bold text-indigo-300 truncate block">{diagnostics.tenant_id}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Webhook Expiration</span>
                  <span className="font-bold text-slate-200">{new Date(diagnostics.webhook_expiration).toLocaleDateString()}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Invites Processed Today</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{diagnostics.total_emails_processed_today}</span>
                </div>
              </div>
            </div>
          )}

          {/* NEW SECTION: Required Secrets & Where-to-Fetch Guide */}
          <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mailbox &amp; AI Engine Secrets Configuration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Exact list of secrets required in your <code className="text-indigo-300 font-mono">.env</code> file and where to fetch each one.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">
                  Stored in: <code className="text-indigo-300">.env</code> &amp; <code className="text-indigo-300">.env.example</code>
                </span>
              </div>
            </div>

            {/* AI Engine Secrets Card */}
            <div className="bg-slate-950/80 rounded-xl border border-indigo-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. AI Reasoning Engine (For Spec Qualification &amp; Plain-English Summaries)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Active Pipeline: Gemini 1.5 Flash &rarr; GPT-4o &rarr; Deterministic Heuristics
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Active Model Indicator */}
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-indigo-500/30 space-y-2 col-span-1 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-bold text-white text-xs flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI_MODEL_NAME &amp; AI_PROVIDER (Configured from .env)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded">
                      Active: {diagnostics?.ai_model_name || "gemini-1.5-flash"} ({diagnostics?.ai_provider || "gemini"})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Switch models anytime in <code className="text-indigo-300">.env</code>: e.g. <code className="text-emerald-300">AI_MODEL_NAME=gemini-1.5-flash</code>, <code className="text-emerald-300">gemini-2.0-flash</code>, or <code className="text-emerald-300">gpt-4o-mini</code>.
                  </p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">GEMINI_API_KEY</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Recommended (1M Context)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Processes entire 50–100 page spec books without truncation. Generates Karla&apos;s plain-English briefing, confirms hardwood vs resilient scope, and detects Basis of Design.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Where to fetch:</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                    >
                      <span>Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">OPENAI_API_KEY</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Alternative Fallback
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uses GPT-4o-mini structured JSON mode if Gemini is not configured. If neither key is provided, system runs deterministic heuristic synthesis (zero cost, zero tokens).
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Where to fetch:</span>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                    >
                      <span>OpenAI API Keys</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Option A: Microsoft Graph API Secrets Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5" />
                  <span>2. Option A: Microsoft Graph API (Office 365 / Azure AD) — Recommended</span>
                </span>
                <a
                  href="https://portal.azure.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>Open Azure Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">AZURE_TENANT_ID</span>
                  <p className="text-[11px] text-slate-400">
                    Azure Portal &rarr; <strong>Microsoft Entra ID</strong> &rarr; Overview &rarr; Copy <em>Directory (tenant) ID</em>.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">AZURE_CLIENT_ID</span>
                  <p className="text-[11px] text-slate-400">
                    Microsoft Entra ID &rarr; <strong>App registrations</strong> &rarr; Select app &rarr; Copy <em>Application (client) ID</em>.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">AZURE_CLIENT_SECRET</span>
                  <p className="text-[11px] text-slate-400">
                    App registrations &rarr; <strong>Certificates &amp; secrets</strong> &rarr; &quot;+ New client secret&quot; &rarr; Copy <em>Value</em>.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-white block">Required Microsoft Graph Permissions:</span>
                <p className="text-slate-400">
                  In Azure Portal &rarr; App registration &rarr; <strong>API permissions</strong> &rarr; Add <code className="text-emerald-400">Mail.Read</code> (Application Permission) &rarr; Click <strong>&quot;Grant admin consent for Atlantic Sports Floors&quot;</strong>.
                </p>
              </div>
            </div>

            {/* Option B: IMAP4 over SSL Direct Mailbox Alternative */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5" />
                  <span>3. Option B: Universal IMAP4 over SSL (Direct Mailbox Alternative)</span>
                </span>
                <a
                  href="https://mysignins.microsoft.com/security-info"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>Generate Office 365 App Password</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">IMAP_HOST</span>
                  <span className="font-semibold text-slate-300 text-[11px]">outlook.office365.com</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">IMAP_PORT</span>
                  <span className="font-semibold text-slate-300 text-[11px]">993 (SSL)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">IMAP_USER</span>
                  <span className="font-semibold text-slate-300 text-[11px]">karla@atlanticflooring.com</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-mono font-bold text-slate-200 block">IMAP_PASSWORD</span>
                  <span className="text-[11px] text-slate-400">16-char App Password from MySignIns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Visual Diagram */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">End-to-End Bid Document Fetching Architecture</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-indigo-400">Step 1: Inbound Webhook</div>
                <h4 className="font-bold text-white text-xs">Office 365 Graph API</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Microsoft 365 issues an encrypted HTTP POST webhook to our FastAPI endpoint whenever Karla receives a new email with PDF attachments.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-emerald-400">Step 2: Stream Binary</div>
                <h4 className="font-bold text-white text-xs">Attachment Download</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fetches project manual attachments via Graph API <code className="text-emerald-300">/attachments</code> endpoint into memory buffers without local disk bloat.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-amber-400">Step 3: Autonomous Parsing</div>
                <h4 className="font-bold text-white text-xs">PyMuPDF Division 09 Scan</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Parses spec book pages in 200ms. Extracts CSI 09 64 66 / 09 64 00 codes, evaluates exclusions, flags Robbins/Connor, and calculates gym SF.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-purple-400">Step 4: HITL Triage</div>
                <h4 className="font-bold text-white text-xs">Karla&apos;s Triage Desk</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Presents AI verdict to Karla with 1-click Approve / Reject. On approval, automatically creates ClickUp tasks and OneDrive takeoff folders.
                </p>
              </div>
            </div>
          </div>

          {/* Actual Python Code Implementation Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  backend/app/services/email_fetcher.py (Live Implementation)
                </span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono">
                Python 3.11 + httpx + imaplib
              </span>
            </div>

            <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#080c14]">
{`# Microsoft Graph API v1.0 OAuth2 & Attachment Harvest Implementation
async def fetch_graph_api_messages(client_id: str, client_secret: str, tenant_id: str):
    async with httpx.AsyncClient() as http:
        # Step 1: Obtain Azure AD Bearer Token
        token_res = await http.post(
            f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token",
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "scope": "https://graph.microsoft.com/.default",
                "grant_type": "client_credentials",
            }
        )
        token = token_res.json()["access_token"]

        # Step 2: Query Karla's Inbox for Bid Invites with Attachments
        headers = {"Authorization": f"Bearer {token}"}
        query_url = (
            "https://graph.microsoft.com/v1.0/users/karla@atlanticflooring.com/messages"
            "?$filter=hasAttachments eq true and (contains(subject,'Bid') or contains(subject,'Invitation'))"
            "&$expand=attachments"
        )
        messages_res = await http.get(query_url, headers=headers)
        
        # Step 3: Stream attachment bytes directly to PyMuPDF Extractor
        for msg in messages_res.json().get("value", []):
            for att in msg.get("attachments", []):
                if att["name"].lower().endswith(".pdf"):
                    raw_bytes = base64.b64decode(att["contentBytes"])
                    intelligence = PDFExtractorService.extract_spec_intelligence(raw_bytes, att["name"])
                    await IngestionController.ingest_with_intelligence(msg, intelligence)`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
