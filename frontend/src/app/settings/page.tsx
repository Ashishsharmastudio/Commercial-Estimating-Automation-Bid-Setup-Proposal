"use client";

import React, { useEffect, useState } from "react";
import { useOS } from "@/context/OSContext";
import {
  Settings,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Save,
  MapPin,
  Sparkles,
  Sliders,
  Trash2,
  Building,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SettingsAndAIRulesPage() {
  const { currentUser } = useOS();
  const [settings, setSettings] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setRules(data.feedback_rules);
      });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentUser.email,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedBanner(true);
        setTimeout(() => setSavedBanner(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-semibold">Loading Parameters &amp; AI Rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/70 p-6 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-700/60 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Qualification Engine Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Geo-Radius, CSI Thresholds &amp; AI Memory
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
              Define the automated rules Atlantic uses to evaluate bids: maximum travel radius, minimum room
              size, target CSI Division 09 codes, and the active learned rule bank taught by Karla.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Configured Authority:</span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">{currentUser.full_name}</span>
            <span className="text-emerald-700 dark:text-emerald-400 block font-semibold text-[11px]">Active Memory: {rules.length} Rules</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Company Logistics & CSI Filter */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl space-y-6">
          <div className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <span>Logistics &amp; CSI Code Filters</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Determines when the AI recommends a bid or flags it for rejection.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">HQ Base Operating Address</label>
              <input
                type="text"
                value={settings.hq_address}
                onChange={(e) => setSettings({ ...settings, hq_address: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Max Service Radius (Miles)</label>
                <input
                  type="number"
                  value={settings.max_service_radius_miles}
                  onChange={(e) =>
                    setSettings({ ...settings, max_service_radius_miles: Number(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Max Drive Time (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.max_drive_time_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, max_drive_time_hours: Number(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Min Sq Ft for Long Distance (&gt;3 Hours)
              </label>
              <input
                type="number"
                value={settings.min_sq_ft_for_long_distance}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    min_sq_ft_for_long_distance: Number(e.target.value),
                  })
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Karla&apos;s rule: If a room is under this area and drive &gt;3 hrs, AI recommends REJECT.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Wood Flooring CSI Codes (Comma Separated)
              </label>
              <input
                type="text"
                value={settings.target_csi_codes.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    target_csi_codes: e.target.value.split(",").map((s: string) => s.trim()),
                  })
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                09 64 00 (Wood Flooring), 09 64 66 (Wood Athletic Flooring / Maple Gym)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Excluded CSI Codes (Instant Disqualification)
              </label>
              <input
                type="text"
                value={settings.excluded_csi_codes.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    excluded_csi_codes: e.target.value.split(",").map((s: string) => s.trim()),
                  })
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                09 65 66 (Resilient Athletic / Synthetic PVC / Rubber)
              </span>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving to Database..." : "Save Parameters"}</span>
              </button>

              {savedBanner && (
                <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to MongoDB!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Memory & Learned Rules */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl space-y-6">
          <div className="border-b border-slate-300 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Karla&apos;s Learned AI Rules ({rules.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tyler&apos;s &quot;19-year-old AI gets smarter&quot; concept. Every rejection reason Karla submits is
              remembered and used in future bid evaluations.
            </p>
          </div>

          <div className="space-y-3">
            {rules.map((r: any) => (
              <div
                key={r._id}
                className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-400 uppercase text-[10px] tracking-wide">
                    [{r.rule_category.replace("_", " ")}]
                  </span>
                  <span className="text-slate-500 text-[10px]">Taught by {r.created_by}</span>
                </div>

                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  &ldquo;{r.natural_language_rule}&rdquo;
                </p>

                <div className="text-[11px] text-slate-500">
                  Origin Project: <strong className="text-slate-700 dark:text-slate-400">{r.source_project_name}</strong>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active learned feedback rules yet. Reject a project with notes in Karla&apos;s Triage Desk to train the AI!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}