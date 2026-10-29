"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Presentation,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  FolderSync,
  Mail,
  Zap,
  Layers,
  ExternalLink,
} from "lucide-react";

export default function ExecutiveProposalPage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="space-y-10 pb-16">
      {/* Executive Header */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-300 dark:border-indigo-500/30 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Presentation className="w-3.5 h-3.5" />
            <span>Executive Architecture Briefing • For John (Owner) &amp; Karla</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Atlantic Flooring Autonomous Estimating &amp; Bid Qualification OS
          </h1>

          <p className="text-slate-700 dark:text-slate-300 text-base font-medium leading-relaxed">
            A practical, plain-English overview of how Atlantic Flooring eliminates administrative bottlenecks,
            clears Karla&apos;s <strong>62 unread bid invitations</strong>, prevents wasted takeoffs on synthetic
            floors, and automatically sets up ClickUp tasks and OneDrive project files.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/triage"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg transition flex items-center space-x-2"
            >
              <span>See Live Karla Triage Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/intake"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 transition flex items-center space-x-2"
            >
              <span>View Outlook 62-Invite Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* The 3 Core Business Problems Solved */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-md space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">The 62-Invite Email Backlog</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            With the estimating consulting firm no longer assisting, Karla is inundated with 62+ unread bid
            invitations in her Outlook email and public portals. Most bids do not even contain Atlantic&apos;s
            scope of work.
          </p>
          <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI monitors inbox 24/7 &amp; extracts Division 09</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-md space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">5 to 8 Hours per Takeoff</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Reading blueprints, specification manuals, and finish schedules takes 5 to 8 hours per project. If a
            job is 200 sq ft and 4 hours away, bidding it loses money due to shipping and travel overhead.
          </p>
          <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Instant disqualification of bad logistics &amp; synthetic scopes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-md space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FolderSync className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Disjointed File Filing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Once a bid is approved, creating the ClickUp task, tracking due dates, and organizing OneDrive
            folders (/Specs, /Plans, /Addenda) is tedious manual work that eats up hours of executive time.
          </p>
          <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1-Click automated ClickUp task &amp; OneDrive folder creation</span>
          </div>
        </div>
      </div>

      {/* Interactive 3-Stage Workflow Architecture Diagram (Replicating Meeting Diagram) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-5">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
              Architectural Process Map
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              The 3-Box Estimating Flow from the Discovery Meeting
            </h2>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeStep === 1 ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Box 1: Intake
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeStep === 2 ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Box 2: AI Read &amp; Flag
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeStep === 3 ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Box 3: Decision &amp; ClickUp/OneDrive
            </button>
          </div>
        </div>

        {/* Visual Flow Representation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1 Card */}
          <div
            className={`p-6 rounded-xl border transition-all ${
              activeStep === 1
                ? "bg-gradient-to-b from-indigo-50/80 dark:from-indigo-950/60 to-white dark:to-slate-900 border-indigo-500 shadow-xl"
                : "bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 opacity-70"
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm text-indigo-400 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xs">
                1
              </span>
              <span>BID INVITATIONS COME IN</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Automated Email &amp; Portal Intake</h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong>Email Intake:</strong> Collects bid invites and specification attachments from
                  Karla&apos;s Outlook email.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong>Phase 1 Scope:</strong> Dedicated Outlook Folder (<code className="text-indigo-300 font-mono text-[11px]">Inbox/Bid Invites</code>) &amp; manual PDF drag-and-drop uploader (public portals reserved for future phases).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>
                  <strong>Document Archival:</strong> Saves invitation text, specification PDFs, drawings, and GC
                  contact details.
                </span>
              </li>
            </ul>
          </div>

          {/* Step 2 Card */}
          <div
            className={`p-6 rounded-xl border transition-all ${
              activeStep === 2
                ? "bg-gradient-to-b from-indigo-50/80 dark:from-indigo-950/60 to-white dark:to-slate-900 border-indigo-500 shadow-xl"
                : "bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 opacity-70"
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-400 mb-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xs">
                2
              </span>
              <span>AI READS AND FLAGS THE BID</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">CSI Code &amp; Logistics Evaluation</h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Target Code Verification:</strong> Scans Division 09 for Hardwood Maple (
                  <code className="text-emerald-400 font-bold">09 64 66</code> /{" "}
                  <code className="text-emerald-400 font-bold">09 64 00</code>).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>Instant Disqualification:</strong> If specification contains ONLY synthetic resilient floor (
                  <code className="text-rose-400 font-bold">09 65 66</code>), automatically flags for REJECTION.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Logistics Filter:</strong> Flags 200 sq ft jobs &gt;3 hours away where shipping exceeds profit.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Addendum Watcher:</strong> If an addendum swaps synthetic resilient to wood, automatically
                  resurrects the project back into Karla&apos;s queue!
                </span>
              </li>
            </ul>
          </div>

          {/* Step 3 Card */}
          <div
            className={`p-6 rounded-xl border transition-all ${
              activeStep === 3
                ? "bg-gradient-to-b from-indigo-50/80 dark:from-indigo-950/60 to-white dark:to-slate-900 border-indigo-500 shadow-xl"
                : "bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 opacity-70"
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs">
                3
              </span>
              <span>HUMAN DECISION &amp; AUTO-SETUP</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Karla Decides • 100% Automated Setup</h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>Human-in-the-Loop:</strong> Karla or John clicks Approve or Reject.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>If Rejected:</strong> AI asks why and learns for next time (Tyler&apos;s &quot;19-year-old AI gets
                  smarter&quot; concept).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>If Approved (Auto-Setup):</strong>
                  <ul className="pl-3 mt-1 space-y-1 text-slate-400">
                    <li>1. Creates ClickUp task assigned to Karla with bid due date.</li>
                    <li>2. Creates OneDrive project folder with /Specs, /Plans, /Addenda.</li>
                    <li>3. Links ClickUp task directly to OneDrive files.</li>
                  </ul>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Concrete Business Value for John (Owner) */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Expected Return on Investment &amp; Time Savings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">90%</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Reduction in Triage Time</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              62 emails evaluated in 2 minutes instead of 15 hours of manual PDF reading.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">5-8 Hrs</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Saved per Project Takeoff</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Architectural sheets (A103/A106) and finish schedules pre-indexed before estimating begins.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">Zero</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Duplicate Estimating Work</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              When 3 different GCs invite Atlantic to bid on the same gym, the system automatically consolidates
              them into 1 dossier.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-purple-400">100%</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">Karla Gatekeeping Control</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              No bid leaves the office without Karla&apos;s or John&apos;s direct sign-off. AI acts purely as a tire-kicker and
              research assistant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
