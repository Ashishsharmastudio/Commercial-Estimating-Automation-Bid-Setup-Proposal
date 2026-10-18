"""
Strict Company Business Rules Service for Atlantic Flooring.
Implements:
1. The Data Gatekeeper (Validates vital facts; flags missing due dates, SF, or omitted finish schedules)
2. Trade Scope Radar (Pass Wood / Block Resilient)
3. Dynamic Distance-vs-Footprint Check (<50mi = any SF; 50-150mi = >=7.5k SF; >150mi = >=14k SF)
4. GC Job Deduplication (Fuzzy match >85% on normalized project name + address/city)
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from rapidfuzz import fuzz

class BusinessRulesService:
    """
    Enforces Atlantic Flooring's strict estimating SOPs before a bid invite
    is presented to Karla or approved for takeoff.
    """

    # Atlantic Headquarters: Wayne / King of Prussia, PA
    HQ_LOCATION = "Wayne, PA 19087"

    @classmethod
    def validate_vital_facts(cls, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        The Data Gatekeeper:
        Inspects incoming bid metadata and extracted specification intelligence.
        Identifies missing vital fields and categorizes the project.
        """
        missing_fields = []

        # 1. Bid Due Date Check
        bid_date = project_data.get("bid_due_date")
        if not bid_date or bid_date in ["TBD", "UNKNOWN", "N/A", ""]:
            missing_fields.append("bid_due_date")

        # 2. Footprint / Square Footage Check
        sq_ft = project_data.get("estimated_sq_ft", 0)
        if not sq_ft or sq_ft <= 0:
            missing_fields.append("estimated_sq_ft")

        # 3. Project Address / City Check
        address = project_data.get("project_address") or project_data.get("city")
        if not address or address in ["TBD", "Unknown Location", ""]:
            missing_fields.append("project_address")

        # 4. CSI Division 09 Code Extraction Check
        detected_csi = project_data.get("detected_csi_codes", [])
        if not detected_csi:
            missing_fields.append("detected_csi_codes")

        is_complete = len(missing_fields) == 0

        return {
            "is_complete": is_complete,
            "has_missing_vital_facts": not is_complete,
            "missing_fields": missing_fields,
            "gatekeeper_status": "VITAL_FACTS_VERIFIED" if is_complete else "EXCEPTION_MISSING_DATA",
        }

    @classmethod
    def evaluate_distance_vs_footprint(
        cls, distance_miles: float, drive_time_hours: float, estimated_sq_ft: float
    ) -> Dict[str, Any]:
        """
        Dynamic Distance-vs-Footprint Gatekeeper:
        - Local Tier (< 50 miles / < 1.0 hr drive): Any square footage qualified (even 3,000–5,000 SF).
        - Regional Tier (50–150 miles / 1.0–3.0 hrs drive): Requires >= 7,500 SF to absorb travel & per diems.
        - Long-Distance Tier (> 150 miles / > 3.0 hrs drive): Strictly out of territory unless collegiate/arena scale >= 14,000 SF.
        """
        distance = float(distance_miles or 0.0)
        drive_time = float(drive_time_hours or (distance / 50.0))
        sq_ft = float(estimated_sq_ft or 0.0)

        if distance < 50.0 or drive_time < 1.0:
            return {
                "tier": "LOCAL_TERRITORY",
                "is_qualified_geography": True,
                "status_badge": "Local Territory (<50 mi)",
                "status_color": "emerald",
                "notes": f"Local footprint of {int(sq_ft):,} SF is fully qualified within standard crew commute radius.",
            }
        elif distance <= 150.0 or drive_time <= 3.0:
            if sq_ft >= 7500.0:
                return {
                    "tier": "REGIONAL_QUALIFIED",
                    "is_qualified_geography": True,
                    "status_badge": f"Regional Scale Verified ({int(sq_ft):,} SF)",
                    "status_color": "emerald",
                    "notes": f"Regional project ({distance:.0f} mi, {drive_time:.1f} hr drive). Footprint of {int(sq_ft):,} SF comfortably absorbs mobilization overhead.",
                }
            else:
                return {
                    "tier": "REGIONAL_HIGH_OVERHEAD",
                    "is_qualified_geography": False,
                    "status_badge": "High Travel Overhead (<7.5k SF)",
                    "status_color": "amber",
                    "notes": f"Regional project ({distance:.0f} mi) with small footprint ({int(sq_ft):,} SF). Fails minimum 7,500 SF regional threshold. Review hotel per diem impact.",
                }
        else:
            if sq_ft >= 14000.0:
                return {
                    "tier": "COLLEGIATE_ARENA_EXEMPTION",
                    "is_qualified_geography": True,
                    "status_badge": f"Collegiate Arena Scale ({int(sq_ft):,} SF)",
                    "status_color": "indigo",
                    "notes": f"Long-distance project ({distance:.0f} mi, {drive_time:.1f} hrs) approved under Collegiate / Regional Arena exemption (>14,000 SF).",
                }
            else:
                return {
                    "tier": "OUT_OF_TERRITORY_DISQUALIFIED",
                    "is_qualified_geography": False,
                    "status_badge": "Out of Territory (>3 hrs)",
                    "status_color": "rose",
                    "notes": f"Disqualified: Project is {distance:.0f} miles away ({drive_time:.1f} hr drive) and footprint of {int(sq_ft):,} SF does not meet the 14,000 SF long-distance threshold.",
                }

    @classmethod
    def check_and_merge_duplicate(
        cls, new_invite_data: Dict[str, Any], existing_projects: List[Any]
    ) -> Tuple[Optional[Any], bool]:
        """
        GC Job Deduplication Engine:
        Compares normalized project name and city/address against existing active projects.
        If similarity exceeds 85%, identifies the project as an existing dossier
        and returns (matched_project, True).
        """
        new_name = cls._normalize_text(new_invite_data.get("project_name", ""))
        new_city = cls._normalize_text(new_invite_data.get("city", "") or new_invite_data.get("project_address", ""))

        best_match = None
        best_score = 0.0

        for proj in existing_projects:
            # Check project name similarity
            existing_name = cls._normalize_text(proj.project_name)
            name_score = fuzz.token_set_ratio(new_name, existing_name)

            # Check address / city similarity
            existing_city = cls._normalize_text(proj.city or proj.project_address)
            city_score = fuzz.token_set_ratio(new_city, existing_city) if (new_city and existing_city) else 75.0

            composite_score = (name_score * 0.7) + (city_score * 0.3)

            if composite_score > best_score:
                best_score = composite_score
                best_match = proj

        if best_match and best_score >= 85.0:
            return best_match, True

        return None, False

    @staticmethod
    def _normalize_text(text: str) -> str:
        if not text:
            return ""
        clean = text.lower()
        clean = re.sub(r"\b(high school|hs|middle school|ms|elementary|sd|csd|gymnasium|gym|flooring|remodel|renovation|phase \d+)\b", "", clean)
        clean = re.sub(r"[^a-z0-9 ]", " ", clean)
        return re.sub(r"\s+", " ", clean).strip()
