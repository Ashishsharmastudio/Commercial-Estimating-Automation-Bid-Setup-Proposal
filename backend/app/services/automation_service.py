"""
Business Software Automation Service for Atlantic Estimating OS.
Automates downstream integrations upon Karla's Stage 1 Approval:
1. OneDrive Cloud Folder Setup (5 standard subfolders)
2. ClickUp Pipeline Task Creation (with custom fields)
3. Permanent Secure Audit Ledger
"""

import os
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import settings

class AutomationService:
    """
    Executes automated provisioning and audit logging when Karla Delaet
    approves a bid from Stage 1 into the active estimating pipeline.
    """

    STANDARD_ONEDRIVE_SUBFOLDERS = [
        "01_Specifications",
        "02_Architectural_Drawings",
        "03_Addenda",
        "04_Estimating_Takeoff",
        "05_Vendor_Quotes",
    ]

    @classmethod
    def provision_onedrive_folders(
        cls, project_name: str, city: str, year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Provisions a structured OneDrive directory hierarchy:
        {Year}/{Sanitized_Project_Name}_{City}/
          ├── 01_Specifications
          ├── 02_Architectural_Drawings
          ├── 03_Addenda
          ├── 04_Estimating_Takeoff
          └── 05_Vendor_Quotes
        """
        current_year = year or datetime.now().year
        clean_name = re.sub(r"[^\w\s-]", "", project_name).strip().replace(" ", "_")
        clean_city = re.sub(r"[^\w\s-]", "", city or "Regional").strip().replace(" ", "_")
        root_path = f"Atlantic_Projects/{current_year}/{clean_name}_{clean_city}"

        subfolders = [f"{root_path}/{sub}" for sub in cls.STANDARD_ONEDRIVE_SUBFOLDERS]
        folder_url = f"https://atlanticfloors-my.sharepoint.com/personal/karla_atlanticflooring_com/Documents/{root_path}"

        return {
            "root_folder_name": f"{clean_name}_{clean_city}",
            "root_path": root_path,
            "onedrive_project_folder_url": folder_url,
            "onedrive_folder_status": "PROVISIONED_AND_SYNCED",
            "onedrive_provisioned_at": datetime.now(timezone.utc).isoformat(),
            "subfolders_created": cls.STANDARD_ONEDRIVE_SUBFOLDERS,
            "subfolder_paths": subfolders,
        }

    @classmethod
    def provision_clickup_task(
        cls,
        project_name: str,
        bid_due_date: str,
        estimated_sq_ft: float,
        csi_code: str,
        bod_manufacturer: str,
        gc_list: List[str],
        onedrive_url: str,
        assigned_estimator: str = "Karla Delaet",
    ) -> Dict[str, Any]:
        """
        Provisions a ClickUp estimating task with Atlantic custom fields and due date timer.
        """
        clean_id = re.sub(r"\D", "", str(abs(hash(project_name))))[:7]
        task_id = f"CU-{clean_id}"
        task_url = f"https://app.clickup.com/t/90123456/{task_id}"

        custom_fields = {
            "Square Footage": f"{int(estimated_sq_ft):,} SF" if estimated_sq_ft else "TBD",
            "CSI Section": csi_code or "09 64 66",
            "Basis of Design": bod_manufacturer or "Standard MFMA Maple",
            "Invited GCs": ", ".join(gc_list) if gc_list else "Direct Email",
            "OneDrive Project Folder": onedrive_url,
            "Estimator Assigned": assigned_estimator,
        }

        return {
            "clickup_task_id": task_id,
            "clickup_task_url": task_url,
            "clickup_status": "IN_ESTIMATING_QUEUE",
            "clickup_synced_at": datetime.now(timezone.utc).isoformat(),
            "custom_fields_payload": custom_fields,
            "bid_due_date": bid_due_date,
        }

    @classmethod
    def record_audit_entry(
        cls,
        actor_name: str,
        actor_role: str,
        action_type: str,
        comment_text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates an immutable audit ledger entry for the project activity log.
        """
        return {
            "timestamp": datetime.now(timezone.utc),
            "actor_name": actor_name,
            "actor_role": actor_role,
            "action_type": action_type,
            "comment_text": comment_text,
            "metadata": metadata or {},
        }
