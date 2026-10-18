"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "OWNER" | "SENIOR_ESTIMATOR" | "ESTIMATOR" | "AI_WORKER";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  title: string;
}

export interface ProjectRecord {
  _id: string;
  project_name: string;
  project_address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  drive_time_hours: number;
  bid_due_date: string;
  estimated_project_slot: string;
  stage: string;
  ai_recommendation: string;
  ai_confidence_score: number;
  ai_reasoning_summary: string;
  ai_model_name?: string;
  ai_risk_flags: string[];
  detected_csi_codes: any[];
  has_target_wood_code: boolean;
  has_resilient_code_only: boolean;
  work_type: string;
  flooring_scope_tags: string[];
  estimated_sq_ft: number;
  karla_decision?: string | null;
  karla_decision_notes?: string | null;
  rejection_chip?: string | null;
  assigned_estimator?: string;
  has_unread_addendum: boolean;
  latest_addendum_summary?: string | null;
  has_missing_vital_facts?: boolean;
  missing_vital_fields?: string[];
  distance_check_badge?: string;
  distance_check_status?: string;
  distance_check_notes?: string;
  onedrive_subfolders?: string[];
  architect_firm_name?: string | null;
  specified_manufacturers: any[];
  finish_schedule_extracted: any[];
  win_probability_tier: string;
  is_prescreened_gc_invite: boolean;
  platform_tags: string[];
  sales_tax_status: string;
  bid_type: string;
  pla_status: string;
  buy_america_status: string;
  bond_required: string;
  insurance_required: string;
  labor_type: string;
  competing_flooring_bidders: string[];
  project_drawings_link: string;
  takeoff_folder_link: string;
  takeoff_summary_comment: string;
  quickbooks_estimate_number: string;
  proposal_amount: number;
  clickup_task_id?: string | null;
  clickup_task_url?: string | null;
  clickup_status?: string | null;
  clickup_synced_at?: string | null;
  onedrive_project_folder_url?: string | null;
  onedrive_folder_status?: string | null;
  onedrive_provisioned_at?: string | null;
  next_followup_date?: string | null;
  awarded_gc_name: string;
  bid_standing_notes: string;
  contract_value: number;
  project_start_date: string;
  award_proof_type: string;
  pm_handoff_confirmed: boolean;
  gc_invites: any[];
  documents: any[];
  takeoff_items: any[];
  vendor_rfq_quotes: any[];
  estimate_versions: any[];
  activity_logs: any[];
}

export interface IntakeEmail {
  id: string;
  sender: string;
  sender_name: string;
  subject: string;
  source_platform: string;
  gc_company_name: string;
  gc_contact_name: string;
  gc_contact_email: string;
  project_name: string;
  project_address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  drive_time_hours: number;
  bid_due_date: string;
  estimated_project_slot: string;
  estimated_sq_ft: number;
  architect_firm_name: string;
  attachments: string[];
  detected_csi_codes: any[];
  specified_manufacturers: any[];
  raw_body_snippet: string;
}

export interface IntakeInboxData {
  unread_inbox_count: number;
  active_sync_sources: string[];
  pending_emails: IntakeEmail[];
}

interface OSContextType {
  users: UserProfile[];
  currentUser: UserProfile;
  switchUserRole: (email: string) => void;
  canApproveTriageOrPricing: boolean;
  projects: ProjectRecord[];
  loading: boolean;
  inboxData: IntakeInboxData | null;
  inboxLoading: boolean;
  errorBanner: string | null;
  clearError: () => void;
  refreshProjects: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  processInboxEmail: (emailId: string) => Promise<ProjectRecord | null>;
  submitKarlaDecision: (
    projectId: string,
    decision: "APPROVED" | "REJECTED",
    notes: string,
    saveAsRule: boolean
  ) => Promise<void>;
  approveProjectWithDrawer: (
    projectId: string,
    payload: { assigned_estimator: string; estimated_project_slot: string; notes?: string }
  ) => Promise<void>;
  rejectProjectWithChip: (
    projectId: string,
    payload: { rejection_chip: string; notes?: string; save_as_ai_rule?: boolean }
  ) => Promise<void>;
  resolveProjectException: (
    projectId: string,
    payload: { bid_due_date?: string; estimated_sq_ft?: number; project_address?: string; city?: string }
  ) => Promise<void>;
  simulateAddendumWoodSwap: (projectId: string) => Promise<void>;
  provisionClickUpOneDrive: (projectId: string) => Promise<ProjectRecord | null>;
  updateProjectFields: (projectId: string, fields: Record<string, any>) => Promise<ProjectRecord | null>;
  generateCourtesyROM: (projectId: string) => Promise<ProjectRecord | null>;
  dispatchRFQs: (projectId: string) => Promise<ProjectRecord | null>;
  applyVendorQuote: (projectId: string, rfqId: string, price: number, freight: number) => Promise<ProjectRecord | null>;
  saveEstimateAndSyncQBO: (
    projectId: string,
    payload: Record<string, any>
  ) => Promise<ProjectRecord | null>;
  transitionStage: (projectId: string, payload: Record<string, any>) => Promise<ProjectRecord | null>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "default-karla",
    full_name: "Karla Delaet",
    email: "karla@atlanticflooring.com",
    role: "SENIOR_ESTIMATOR",
    title: "Senior Estimator & Sole Triage Gatekeeper",
  });
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inboxData, setInboxData] = useState<IntakeInboxData | null>(null);
  const [inboxLoading, setInboxLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const canApproveTriageOrPricing =
    currentUser.role === "SENIOR_ESTIMATOR" || currentUser.role === "OWNER";

  const clearError = () => setErrorBanner(null);

  const apiFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      setErrorBanner(null);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Email": currentUser.email,
        ...(options.headers as Record<string, string>),
      };
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: res.statusText }));
        const msg = errData.detail || "Operation failed";
        setErrorBanner(msg);
        throw new Error(msg);
      }
      return res.json();
    },
    [currentUser.email]
  );

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projData, usersData] = await Promise.all([
        apiFetch("/projects"),
        apiFetch("/auth/users"),
      ]);
      setProjects(projData);
      if (usersData && usersData.length > 0) {
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const refreshInbox = useCallback(async () => {
    try {
      setInboxLoading(true);
      const data = await apiFetch("/intake/inbox");
      setInboxData(data);
    } catch (err) {
      console.error("Failed to load intake inbox", err);
    } finally {
      setInboxLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    refreshProjects();
    refreshInbox();
  }, [refreshProjects, refreshInbox]);

  const switchUserRole = (email: string) => {
    const found = users.find((u) => u.email === email);
    if (found) {
      setCurrentUser(found);
      setErrorBanner(null);
    }
  };

  const processInboxEmail = async (emailId: string) => {
    const newProj = await apiFetch("/intake/process-email", {
      method: "POST",
      body: JSON.stringify({ email_id: emailId }),
    });
    await Promise.all([refreshProjects(), refreshInbox()]);
    return newProj;
  };

  const provisionClickUpOneDrive = async (projectId: string) => {
    const updated = await apiFetch(`/projects/${projectId}/provision-clickup-onedrive`, {
      method: "POST",
    });
    await refreshProjects();
    return updated;
  };

  const submitKarlaDecision = async (
    projectId: string,
    decision: "APPROVED" | "REJECTED",
    notes: string,
    saveAsRule: boolean
  ) => {
    await apiFetch(`/triage/${projectId}/decision`, {
      method: "POST",
      body: JSON.stringify({
        decision,
        notes,
        save_as_ai_rule: saveAsRule,
        rule_category: "SCOPE_AND_LOGISTICS",
      }),
    });
    await refreshProjects();
  };

  const approveProjectWithDrawer = async (
    projectId: string,
    payload: { assigned_estimator: string; estimated_project_slot: string; notes?: string }
  ) => {
    await apiFetch(`/projects/${projectId}/approve`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshProjects();
  };

  const rejectProjectWithChip = async (
    projectId: string,
    payload: { rejection_chip: string; notes?: string; save_as_ai_rule?: boolean }
  ) => {
    await apiFetch(`/projects/${projectId}/reject`, {
      method: "POST",
      body: JSON.stringify({
        rejection_chip: payload.rejection_chip,
        notes: payload.notes || "",
        save_as_ai_rule: payload.save_as_ai_rule !== false,
      }),
    });
    await refreshProjects();
  };

  const resolveProjectException = async (
    projectId: string,
    payload: { bid_due_date?: string; estimated_sq_ft?: number; project_address?: string; city?: string }
  ) => {
    await apiFetch(`/projects/${projectId}/resolve-exception`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshProjects();
  };

  const simulateAddendumWoodSwap = async (projectId: string) => {
    await apiFetch(`/projects/${projectId}/addendum`, {
      method: "POST",
      body: JSON.stringify({
        addendum_number: 2,
        introduces_wood_code_096466: true,
        file_name: "Addendum_02_Flooring_Change_To_Maple_096466.pdf",
        summary:
          "Architect issued Addendum #2 changing Main Gym from 09 65 66 Synthetic Resilient to 09 64 66 Maple Wood Athletic Flooring (9,200 SF).",
      }),
    });
    await refreshProjects();
  };

  const updateProjectFields = async (projectId: string, fields: Record<string, any>) => {
    const updated = await apiFetch(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    });
    await refreshProjects();
    return updated;
  };

  const generateCourtesyROM = async (projectId: string) => {
    const updated = await apiFetch(`/projects/${projectId}/courtesy-rom`, {
      method: "POST",
    });
    await refreshProjects();
    return updated;
  };

  const dispatchRFQs = async (projectId: string) => {
    const updated = await apiFetch(`/projects/${projectId}/rfqs/dispatch`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    await refreshProjects();
    return updated;
  };

  const applyVendorQuote = async (
    projectId: string,
    rfqId: string,
    price: number,
    freight: number
  ) => {
    const updated = await apiFetch(`/projects/${projectId}/rfqs/${rfqId}/apply`, {
      method: "POST",
      body: JSON.stringify({ quoted_unit_price: price, quoted_freight: freight }),
    });
    await refreshProjects();
    return updated;
  };

  const saveEstimateAndSyncQBO = async (projectId: string, payload: Record<string, any>) => {
    const updated = await apiFetch(`/projects/${projectId}/estimate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshProjects();
    return updated;
  };

  const transitionStage = async (projectId: string, payload: Record<string, any>) => {
    const updated = await apiFetch(`/projects/${projectId}/transition`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await refreshProjects();
    return updated;
  };

  return (
    <OSContext.Provider
      value={{
        users,
        currentUser,
        switchUserRole,
        canApproveTriageOrPricing,
        projects,
        loading,
        inboxData,
        inboxLoading,
        errorBanner,
        clearError,
        refreshProjects,
        refreshInbox,
        processInboxEmail,
        submitKarlaDecision,
        approveProjectWithDrawer,
        rejectProjectWithChip,
        resolveProjectException,
        simulateAddendumWoodSwap,
        provisionClickUpOneDrive,
        updateProjectFields,
        generateCourtesyROM,
        dispatchRFQs,
        applyVendorQuote,
        saveEstimateAndSyncQBO,
        transitionStage,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used inside OSProvider");
  return ctx;
};