"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useOS } from "@/context/OSContext";
import {
  Calculator,
  Send,
  ShieldAlert,
  FileSpreadsheet,
  Award,
  Zap,
  CheckCircle2,
  Plus,
  Copy,
  ExternalLink,
  FolderSync,
  Building,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Layers,
  Check,
} from "lucide-react";

export default function ProjectDetailWorkspace({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const {
    projects,
    currentUser,
    canApproveTriageOrPricing,
    updateProjectFields,
    generateCourtesyROM,
    dispatchRFQs,
    applyVendorQuote,
    saveEstimateAndSyncQBO,
    transitionStage,
    provisionClickUpOneDrive,
  } = useOS();

  const [activeTab, setActiveTab] = useState<
    "ESTIMATE" | "RFQ" | "FIELDS" | "CLOSING" | "ACTIVITY"
  >("ESTIMATE");

  const [isProvisioning, setIsProvisioning] = useState(false);

  const project = projects.find((p) => p._id === resolvedParams.id);

  if (!project) {
    return (
      <div className="p-20 text-center space-y-4">
        <p className="text-slate-400 text-base">Project not found in MongoDB.</p>
        <Link href="/" className="text-indigo-400 hover:underline text-xs font-bold">
          ← Back to Pipeline Master Grid
        </Link>
      </div>
    );
  }

  const latestEstimate =
    project.estimate_versions.length > 0
      ? project.estimate_versions[project.estimate_versions.length - 1]
      : null;

  const handleProvisionClickUpOneDrive = async () => {
    try {
      setIsProvisioning(true);
      await provisionClickUpOneDrive(project._id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Project Header & Stage Bar */}
      <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow">
                {project.stage.replace("_", " ")}
              </span>
              <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                {project.work_type.replace("_", " ")} • {project.estimated_sq_ft.toLocaleString()} SF
              </span>
              {project.quickbooks_estimate_number && (
                <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                  QB: {project.quickbooks_estimate_number}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {project.project_address}
              </span>
              <span>•</span>
              <span>
                Architect: <strong className="text-slate-200">{project.architect_firm_name || "N/A"}</strong>
              </span>
              <span>•</span>
              <span>
                Bid Due: <strong className="text-slate-200">{project.bid_due_date}</strong> ({project.estimated_project_slot})
              </span>
            </div>
          </div>

          {/* Quick Stage Transitions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => transitionStage(project._id, { target_stage: "IN_TAKEOFF" })}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              → Stage 3: Takeoff
            </button>
            <button
              onClick={() => transitionStage(project._id, { target_stage: "FOR_PRICING" })}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              → Stage 4: For Pricing
            </button>
            <button
              onClick={() => transitionStage(project._id, { target_stage: "ESTIMATE_SENT" })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition"
            >
              → Stage 5: Estimate Sent
            </button>
            <button
              onClick={() => transitionStage(project._id, { target_stage: "CLOSING_NEGOTIATION" })}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-lg transition"
            >
              → Stage 6: Negotiation
            </button>
          </div>
        </div>

        {/* Box 3: Automated ClickUp Task & OneDrive Integration Banner */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <FolderSync className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">ClickUp Bid Task:</span>
              {project.clickup_task_id ? (
                <a
                  href={project.clickup_task_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-950/60 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-md font-bold flex items-center space-x-1 hover:border-purple-400"
                >
                  <span>{project.clickup_task_id}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-500 italic">Not yet provisioned</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">OneDrive Folder:</span>
              {project.onedrive_project_folder_url ? (
                <a
                  href={project.onedrive_project_folder_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-bold flex items-center space-x-1 hover:border-emerald-400"
                >
                  <span>/Documents/Estimating_2026/</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-500 italic">Not yet provisioned</span>
              )}
            </div>
          </div>

          {!project.clickup_task_id && (
            <button
              onClick={handleProvisionClickUpOneDrive}
              disabled={isProvisioning}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow flex items-center space-x-1.5"
            >
              <FolderSync className={`w-3.5 h-3.5 ${isProvisioning ? "animate-spin" : ""}`} />
              <span>{isProvisioning ? "Provisioning..." : "Auto-Provision ClickUp & OneDrive"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("ESTIMATE")}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === "ESTIMATE"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          1. Takeoff &amp; Native QuickBooks Estimate
        </button>

        <button
          onClick={() => setActiveTab("RFQ")}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === "RFQ"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          2. Multi-Dealer RFQs ({project.vendor_rfq_quotes.length})
        </button>

        <button
          onClick={() => setActiveTab("FIELDS")}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === "FIELDS"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          3. SOP Custom Fields (Stages 1–7)
        </button>

        <button
          onClick={() => setActiveTab("CLOSING")}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === "CLOSING"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          4. Follow-Up &amp; Award Proof
        </button>

        <button
          onClick={() => setActiveTab("ACTIVITY")}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === "ACTIVITY"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          5. Audit Log ({project.activity_logs.length})
        </button>
      </div>

      {/* TAB 1: NATIVE QUICKBOOKS ESTIMATE & PRICING BUILDER */}
      {activeTab === "ESTIMATE" && (
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white">
                QuickBooks Estimate 3790 &amp; Margin Calculator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automates estimate generation from takeoff areas. 1-Click courtesy bid ROM, margin
                adjustments, and direct QuickBooks synchronization.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => generateCourtesyROM(project._id)}
                className="inline-flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Courtesy ROM</span>
              </button>

              {latestEstimate && (
                <button
                  disabled={!canApproveTriageOrPricing}
                  onClick={() =>
                    saveEstimateAndSyncQBO(project._id, {
                      line_items: latestEstimate.line_items,
                      exclusions_text: latestEstimate.exclusions_text,
                      clarifications_text: latestEstimate.clarifications_text,
                      sync_to_qbo: true,
                    })
                  }
                  className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Sync to QuickBooks Online</span>
                </button>
              )}
            </div>
          </div>

          {!latestEstimate ? (
            <div className="p-12 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <p className="text-sm text-slate-400">No Estimate Version generated yet.</p>
              <button
                onClick={() => generateCourtesyROM(project._id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Generate Estimate Structure
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                <span>
                  Active Version: <strong className="text-white">v{latestEstimate.version_number}</strong> (
                  {latestEstimate.status})
                </span>
                <span>
                  QuickBooks Number:{" "}
                  <strong className="text-emerald-400">
                    {project.quickbooks_estimate_number || "Ready to Sync"}
                  </strong>
                </span>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Quantity</th>
                      <th className="py-3 px-3">Unit Cost ($)</th>
                      <th className="py-3 px-3">Margin (%)</th>
                      <th className="py-3 px-3">Total Cost</th>
                      <th className="py-3 px-3">Proposal Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {latestEstimate.line_items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-950/50">
                        <td className="py-3 px-3 font-bold text-slate-300">{item.category}</td>
                        <td className="py-3 px-3 font-semibold text-white">{item.description}</td>
                        <td className="py-3 px-3 text-slate-300">
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-slate-300">${item.unit_cost.toFixed(2)}</td>
                        <td className="py-3 px-3 font-bold text-indigo-400">{item.margin_percent}%</td>
                        <td className="py-3 px-3 text-slate-300">${item.total_cost.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          ${item.total_price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Estimate Totals Summary Card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Subtotal Cost</span>
                  <span className="text-base font-bold text-white">
                    ${latestEstimate.subtotal_cost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Gross Margin</span>
                  <span className="text-base font-bold text-indigo-400">
                    ${latestEstimate.overhead_and_margin_total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Freight</span>
                  <span className="text-base font-bold text-slate-300">
                    ${latestEstimate.freight_total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Final Proposal Amount</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    ${latestEstimate.final_proposal_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MULTI-MANUFACTURER RFQS */}
      {activeTab === "RFQ" && (
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white">
                Multi-Manufacturer Dealer RFQs &amp; Architect Leverage
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically quotes Robbins Sports Surfaces, Connor Sports, Action, and Aacer.
                Identifies basis-of-design premiums when Kimmel Bogrette Architecture specifies Robbins.
              </p>
            </div>

            <button
              onClick={() => dispatchRFQs(project._id)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow"
            >
              + Dispatch Multi-Manufacturer RFQ Package
            </button>
          </div>

          <div className="space-y-4">
            {project.vendor_rfq_quotes.map((rfq: any) => (
              <div
                key={rfq.id}
                className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{rfq.manufacturer_or_dealer}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      Status: {rfq.rfq_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    System: <strong className="text-slate-200">{rfq.product_system}</strong> • Delivery:{" "}
                    {rfq.delivery_window}
                  </p>
                  {rfq.architect_price_alert && (
                    <p className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30">
                      {rfq.architect_price_alert}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Quoted Price</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ${rfq.quoted_unit_price ? `${rfq.quoted_unit_price.toFixed(2)}/SF` : "Pending"}
                    </span>
                  </div>

                  <button
                    disabled={!canApproveTriageOrPricing || !rfq.quoted_unit_price}
                    onClick={() =>
                      applyVendorQuote(
                        project._id,
                        rfq.id,
                        rfq.quoted_unit_price,
                        rfq.quoted_freight
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    Apply to Estimate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM FIELDS */}
      {activeTab === "FIELDS" && (
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
            Commercial Custom Fields (SOP Stages 1–7)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-400 block mb-1">Sales Tax Status</label>
              <input
                type="text"
                defaultValue={project.sales_tax_status}
                onBlur={(e) => updateProjectFields(project._id, { sales_tax_status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Bid Type</label>
              <input
                type="text"
                defaultValue={project.bid_type}
                onBlur={(e) => updateProjectFields(project._id, { bid_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Labor Type</label>
              <input
                type="text"
                defaultValue={project.labor_type}
                onBlur={(e) => updateProjectFields(project._id, { labor_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Bond Required</label>
              <input
                type="text"
                defaultValue={project.bond_required}
                onBlur={(e) => updateProjectFields(project._id, { bond_required: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Insurance Required</label>
              <input
                type="text"
                defaultValue={project.insurance_required}
                onBlur={(e) => updateProjectFields(project._id, { insurance_required: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-400 block mb-1">Estimated Slot</label>
              <input
                type="text"
                defaultValue={project.estimated_project_slot}
                onBlur={(e) => updateProjectFields(project._id, { estimated_project_slot: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOSING & AWARD */}
      {activeTab === "CLOSING" && (
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
            Stage 5–7 Follow-Up &amp; Award Gatekeeper
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Awarded General Contractor</label>
                <input
                  type="text"
                  defaultValue={project.awarded_gc_name}
                  onBlur={(e) => updateProjectFields(project._id, { awarded_gc_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1">Bid Standing Notes</label>
                <input
                  type="text"
                  defaultValue={project.bid_standing_notes}
                  onBlur={(e) => updateProjectFields(project._id, { bid_standing_notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="bg-emerald-950/40 p-5 rounded-xl border border-emerald-500/30 space-y-3">
              <span className="font-extrabold text-emerald-300 text-sm block">
                Stage 7: Official WON - AWARDED Gatekeeper
              </span>
              <p className="text-slate-300">
                SOP Rule: Verbal award is NOT enough. Select written proof document received to unlock PM handoff.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["LOI", "NTP", "SIGNED_CONTRACT", "PO", "AWARD_EMAIL"].map((proof) => (
                  <button
                    key={proof}
                    disabled={!canApproveTriageOrPricing}
                    onClick={() =>
                      transitionStage(project._id, {
                        target_stage: "WON_AWARDED",
                        award_proof_type: proof,
                        contract_value: project.proposal_amount,
                        project_start_date: "2027-06-15",
                      })
                    }
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    Upload {proof} &amp; Mark WON
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === "ACTIVITY" && (
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
            Complete Project Audit Trail
          </h2>
          <div className="space-y-3">
            {project.activity_logs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-4"
              >
                <div>
                  <span className="font-bold text-white">{log.actor_name}</span>{" "}
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {log.actor_role}
                  </span>{" "}
                  <span className="text-indigo-400 font-bold ml-1">[{log.action_type}]</span>
                  <p className="text-slate-300 mt-1">{log.comment_text}</p>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}