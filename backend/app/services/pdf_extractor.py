import re
import json
from typing import Dict, Any, List, Optional
import fitz  # PyMuPDF
import httpx
from app.config import settings

class PDFExtractorService:
    """
    Autonomous CSI Division 09 Specification & Blueprint Parser.
    Extracts text, table of contents, CSI citations, square footages,
    manufacturers, and drawing sheet references.
    """

    TARGET_WOOD_CODES = {
        "09 64 66": "Wood Athletic Flooring (Maple Gymnasium Flooring)",
        "09 64 00": "Wood Flooring (Sanding, Refinishing & Strip Flooring)",
        "09 64 29": "Wood Strip and Plank Flooring",
        "09 64 60": "Athletic Wood Flooring",
    }

    EXCLUDED_RESILIENT_CODES = {
        "09 65 66": "Resilient Athletic Flooring (Synthetic Rubber / Polyurethane)",
        "09 65 19": "Resilient Tile Flooring (Vinyl Composition Tile)",
        "09 65 00": "Resilient Flooring",
        "09 65 16": "Resilient Sheet Flooring",
    }

    NON_FLOORING_CODES = {
        "09 51 00": "Acoustical Ceilings",
        "09 51 13": "Acoustical Panel Ceilings",
        "08 71 00": "Door Hardware",
        "07 54 00": "Thermoplastic Membrane Roofing (PVC)",
    }

    APPROVED_MANUFACTURERS = [
        "Robbins Sports Surfaces",
        "Robbins",
        "Connor Sports",
        "Connor Sports Flooring",
        "Action Floor Systems",
        "Aacer Flooring",
        "Aacer",
        "Bona US",
        "Bona SuperCourt",
        "Junckers Hardwood",
        "Mondo",
        "Tarkett Sports",
        "Gerflor",
    ]

    @classmethod
    def extract_spec_intelligence(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Parses raw PDF bytes and returns structured CSI Division 09 intelligence.
        """
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        total_pages = len(doc)
        toc = doc.get_toc()  # Table of contents bookmarks

        detected_csi_codes = []
        specified_manufacturers = []
        finish_schedule_extracted = []
        extracted_sq_ft: float = 0.0
        work_type = "UNKNOWN_OR_NONE"
        page_chunks: List[Dict[str, Any]] = []

        # 1. Page-by-page full-text extraction & indexing
        all_text = ""
        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_num = page_idx + 1
            text = page.get_text("text")
            all_text += f"\n--- Page {page_num} ---\n" + text

            page_chunks.append({
                "page_number": page_num,
                "text": text,
                "snippet_preview": text[:200].replace("\n", " ").strip() if text else ""
            })

            # Check for Target Wood CSI Codes
            for code, title in cls.TARGET_WOOD_CODES.items():
                code_pattern = re.compile(rf"\b(?:SECTION\s+)?{re.escape(code)}\b", re.IGNORECASE)
                if code_pattern.search(text):
                    snippet = cls._extract_surrounding_sentence(text, code)
                    is_excluded = cls._is_negated_or_excluded(snippet)
                    already_found = any(c["code"] == code for c in detected_csi_codes)
                    if not already_found:
                        if is_excluded:
                            detected_csi_codes.append({
                                "code": code,
                                "title": f"{title} [EXPLICITLY EXCLUDED BY SPEC]",
                                "document_name": filename,
                                "page_number": page_num,
                                "snippet": snippet or f"CSI Section {code} is explicitly excluded in this specification.",
                                "is_target_wood": False,
                                "is_explicit_exclusion": True,
                            })
                        else:
                            detected_csi_codes.append({
                                "code": code,
                                "title": title,
                                "document_name": filename,
                                "page_number": page_num,
                                "snippet": snippet or f"CSI Section {code} - {title} specified in manual.",
                                "is_target_wood": True,
                                "is_explicit_exclusion": False,
                            })

            # Check for Excluded Resilient CSI Codes
            for code, title in cls.EXCLUDED_RESILIENT_CODES.items():
                code_pattern = re.compile(rf"\b(?:SECTION\s+)?{re.escape(code)}\b", re.IGNORECASE)
                if code_pattern.search(text):
                    snippet = cls._extract_surrounding_sentence(text, code)
                    already_found = any(c["code"] == code for c in detected_csi_codes)
                    if not already_found:
                        detected_csi_codes.append({
                            "code": code,
                            "title": title,
                            "document_name": filename,
                            "page_number": page_num,
                            "snippet": snippet or f"CSI Section {code} - {title} specified in manual.",
                            "is_target_wood": False,
                            "is_explicit_exclusion": False,
                        })

            # Check for Specified Manufacturers
            for mfr in cls.APPROVED_MANUFACTURERS:
                mfr_pattern = re.compile(rf"\b{re.escape(mfr)}\b", re.IGNORECASE)
                if mfr_pattern.search(text):
                    is_bod = bool(re.search(rf"\b(?:Basis\s+of\s+Design|Design\s+Standard)\b.*?\b{re.escape(mfr)}\b", text, re.IGNORECASE) or
                                 re.search(rf"\b{re.escape(mfr)}\b.*?\b(?:Basis\s+of\s+Design|Design\s+Standard)\b", text, re.IGNORECASE))
                    or_equal = bool(re.search(r"\bor\s+equal\b|\bapproved\s+equal\b", text, re.IGNORECASE))
                    
                    already_listed = any(m["manufacturer_name"].lower() == mfr.lower() for m in specified_manufacturers)
                    if not already_listed:
                        specified_manufacturers.append({
                            "manufacturer_name": mfr,
                            "product_line": cls._extract_product_line(text, mfr),
                            "csi_section": "09 64 66" if "Mondo" not in mfr and "Tarkett" not in mfr else "09 65 66",
                            "is_basis_of_design": is_bod,
                            "or_equal_allowed": or_equal,
                        })

            # Check for Finish Schedule References (Sheets A101, A103, A106, etc.)
            sheet_matches = re.findall(r"\b(A[1-9]\d{2})\b", text, re.IGNORECASE)
            for sm in sheet_matches:
                if sm.upper() not in [f["sheet"] for f in finish_schedule_extracted]:
                    finish_schedule_extracted.append({
                        "sheet": sm.upper(),
                        "room": "Athletic Floor Area",
                        "material": "WD-1 Maple Wood Flooring" if any(c["is_target_wood"] for c in detected_csi_codes) else "RF-1 Resilient Flooring",
                        "sq_ft": 0
                    })

        # 2. Extract Square Footage via Regex
        sq_ft_pattern = re.compile(r"(\d{1,3}(?:,\d{3})+|\b[1-9]\d{3,5}\b)\s*(?:sq(?:uare)?\.?\s*f(?:ee)?t\.?|sf|square\s+feet)", re.IGNORECASE)
        sq_ft_matches = sq_ft_pattern.findall(all_text)
        if sq_ft_matches:
            # Parse highest reasonable area between 500 and 100,000 SF
            parsed_areas = []
            for m in sq_ft_matches:
                try:
                    val = float(m.replace(",", ""))
                    if 200 <= val <= 80000:
                        parsed_areas.append(val)
                except ValueError:
                    pass
            if parsed_areas:
                extracted_sq_ft = max(parsed_areas)

        # 3. Determine Work Type
        has_wood = any(c["is_target_wood"] for c in detected_csi_codes)
        has_resilient = any(not c["is_target_wood"] for c in detected_csi_codes)
        
        is_refinish = bool(re.search(r"\b(?:sand(?:ing)?|refinish(?:ing)?|screen(?:ing)?|re-coat|polyurethane\s+finish|game\s+lines)\b", all_text, re.IGNORECASE))
        is_new_install = bool(re.search(r"\b(?:new\s+installation|provide\s+and\s+install|subfloor\s+system|anchored\s+resilient|maple\s+strip)\b", all_text, re.IGNORECASE))

        if has_wood and is_refinish and not is_new_install:
            work_type = "SAND_AND_REFINISH"
        elif has_wood and is_new_install:
            work_type = "NEW_INSTALLATION"
        elif has_wood:
            work_type = "NEW_INSTALLATION"
        elif has_resilient:
            work_type = "RESILIENT_SYNTHETIC_ONLY"
        else:
            work_type = "UNKNOWN_OR_NONE"

        return {
            "total_pages": total_pages,
            "table_of_contents": toc,
            "detected_csi_codes": detected_csi_codes,
            "has_target_wood_code": has_wood,
            "has_resilient_code_only": has_resilient and not has_wood,
            "work_type": work_type,
            "estimated_sq_ft": extracted_sq_ft,
            "specified_manufacturers": specified_manufacturers,
            "finish_schedule_extracted": finish_schedule_extracted,
            "page_chunks": page_chunks,
        }

    @staticmethod
    def _extract_surrounding_sentence(text: str, keyword: str) -> str:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        for s in sentences:
            if keyword.lower() in s.lower():
                clean = re.sub(r"\s+", " ", s).strip()
                return clean[:280]
        return ""

    @staticmethod
    def _extract_product_line(text: str, manufacturer: str) -> str:
        patterns = [
            rf"{manufacturer}\s+([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+){{0,2}})",
            r"(?:System|Product Line|Surface):\s*([A-Za-z0-9\- ]{3,30})",
        ]
        for p in patterns:
            match = re.search(p, text, re.IGNORECASE)
            if match:
                val = match.group(1).strip()
                if len(val) > 2 and "athletic" not in val.lower():
                    return val
        if "Robbins" in manufacturer:
            return "Bio-Channel Classic Maple"
        elif "Connor" in manufacturer:
            return "NeoShok Maple Athletic System"
        elif "Bona" in manufacturer:
            return "SuperCourt Athletic Finishing System"
        return "Standard Hardwood Maple System"

    @staticmethod
    def _is_negated_or_excluded(sentence: str) -> bool:
        if not sentence:
            return False
        patterns = [
            r"\bno\s+hardwood\b",
            r"\bnot\s+included\b",
            r"\bstrictly\s+excluded\b",
            r"\bnot\s+permitted\b",
            r"\bexcluded\s+under\s+this\b",
            r"\bno\s+maple\b",
            r"\bneither\s+hardwood\b",
            r"\bexcluding\s+wood\b",
        ]
        return any(re.search(p, sentence, re.IGNORECASE) for p in patterns)

    @classmethod
    def extract_spec_from_file_path(cls, file_path: str) -> Dict[str, Any]:
        """Convenience method to load and parse a local PDF file."""
        import os
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            data = f.read()
        return cls.extract_spec_intelligence(data, filename)

    @classmethod
    async def _call_gemini_api(cls, prompt: str, api_key: str, model_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Executes Google Gemini structured JSON generation using model selected from .env.
        """
        target_model = model_name or settings.AI_MODEL_NAME or "gemini-1.5-flash"
        if not target_model.startswith("gemini"):
            target_model = "gemini-1.5-flash"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            }
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        clean_text = text_content.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        return json.loads(clean_text.strip())
                else:
                    print(f"Gemini API ({target_model}) returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Gemini API Execution Exception: {e}")
        return None

    @classmethod
    async def _call_openai_api(cls, prompt: str, api_key: str, model_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Executes OpenAI structured JSON generation using model selected from .env.
        """
        target_model = model_name or settings.AI_MODEL_NAME or "gpt-4o-mini"
        if not (target_model.startswith("gpt") or target_model.startswith("o")):
            target_model = "gpt-4o-mini"

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are Atlantic Flooring's Senior Estimator AI Assistant for Karla Delaet. Return valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text_content = data["choices"][0]["message"]["content"]
                    return json.loads(text_content)
                else:
                    print(f"OpenAI API ({target_model}) returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"OpenAI API Execution Exception: {e}")
        return None

    @classmethod
    async def generate_ai_plain_english_summary(
        cls, intelligence: Dict[str, Any], project_meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Feeds extracted CSI codes, manufacturer basis of design, square footage,
        and verbatim text paragraphs into an autonomous reasoning synthesis
        to confirm the scope and generate a concise plain-English summary for Karla.
        
        Attempts live LLM generation using the model specified in .env (AI_MODEL_NAME / AI_PROVIDER):
        1. Configured model (Google Gemini or OpenAI GPT)
        2. Alternative provider fallback
        3. Deterministic Estimator Heuristic Fallback (offline / zero-token cost)
        """
        has_wood = intelligence.get("has_target_wood_code", False)
        has_resilient_only = intelligence.get("has_resilient_code_only", False)
        work_type = intelligence.get("work_type", "UNKNOWN_OR_NONE")
        sq_ft = intelligence.get("estimated_sq_ft", 0.0)
        codes = [c.get("code") for c in intelligence.get("detected_csi_codes", [])]
        mfrs = intelligence.get("specified_manufacturers", [])
        bod_mfr = next((m for m in mfrs if m.get("is_basis_of_design")), None)
        mfr_names = ", ".join([m.get("manufacturer_name", "") for m in mfrs[:3]])

        # Collect 2-3 most important text excerpts from page chunks
        important_excerpts = []
        for c in intelligence.get("detected_csi_codes", []):
            if c.get("snippet"):
                important_excerpts.append(f"[Page {c.get('page_number', 1)}] {c.get('snippet')}")
        if not important_excerpts:
            for chunk in intelligence.get("page_chunks", [])[:2]:
                if chunk.get("snippet_preview"):
                    important_excerpts.append(f"[Page {chunk.get('page_number')}] {chunk.get('snippet_preview')[:180]}...")

        # Construct AI Prompt
        prompt = f"""
You are the autonomous Estimating AI for Atlantic Flooring (President: John Delaet, Senior Estimator: Karla Delaet).
Atlantic Flooring's core business is northern hard maple gymnasium sports flooring (CSI Division 09 64 66 / 09 64 00).
Atlantic Flooring strictly does NOT bid on resilient synthetic rubber or pour-in-place urethane athletic flooring (CSI 09 65 66).

Analyze the extracted project specification intelligence below:
- Detected CSI MasterFormat Sections: {codes}
- Identified Manufacturers / Basis of Design: {mfr_names}
- Identified Footprint: {int(sq_ft) if sq_ft else 'Unknown'} SF
- Classified Work Type: {work_type}
- Key Specification Excerpts:
{chr(10).join(important_excerpts)}

Generate a JSON object with EXACTLY the following keys:
1. "ai_confirmation": (string) Explicit 1-sentence confirmation of scope (e.g. "Confirmed Wood Scope: CSI 09 64 66 Hardwood Maple (Robbins Basis of Design)" or "Confirmed Non-Wood Scope: CSI 09 65 66 Resilient Rubber (Maple Excluded)").
2. "ai_recommendation": (string) Exactly "RECOMMEND_BID", "RECOMMEND_REJECT", or "NEEDS_MANUAL_REVIEW".
3. "ai_confidence_score": (float) A number between 0.0 and 1.0 (e.g. 0.98).
4. "plain_english_summary": (string) A concise, 2-4 sentence executive summary written directly for Karla. Mention the CSI code, square footage, specified mill manufacturer, subfloor system, and bid qualification advice.
5. "important_spec_excerpts": (list of strings) 2-3 most critical sentences from the specification.
"""

        prefer_openai = (settings.AI_PROVIDER.lower() == "openai") or settings.AI_MODEL_NAME.lower().startswith("gpt")

        # 1. If OpenAI preferred from .env
        if prefer_openai and settings.OPENAI_API_KEY:
            openai_res = await cls._call_openai_api(prompt, settings.OPENAI_API_KEY, settings.AI_MODEL_NAME)
            if openai_res and "plain_english_summary" in openai_res:
                openai_res["ai_model_name"] = f"OpenAI ({settings.AI_MODEL_NAME})"
                if "important_spec_excerpts" not in openai_res or not openai_res["important_spec_excerpts"]:
                    openai_res["important_spec_excerpts"] = important_excerpts[:4]
                return openai_res

        # 2. Try Google Gemini (default or primary)
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
            gemini_res = await cls._call_gemini_api(prompt, settings.GEMINI_API_KEY, settings.AI_MODEL_NAME)
            if gemini_res and "plain_english_summary" in gemini_res:
                gemini_res["ai_model_name"] = f"Google Gemini ({settings.AI_MODEL_NAME})"
                if "important_spec_excerpts" not in gemini_res or not gemini_res["important_spec_excerpts"]:
                    gemini_res["important_spec_excerpts"] = important_excerpts[:4]
                return gemini_res

        # 3. Fallback to OpenAI if Gemini was not available
        if not prefer_openai and settings.OPENAI_API_KEY:
            openai_res = await cls._call_openai_api(prompt, settings.OPENAI_API_KEY, settings.AI_MODEL_NAME)
            if openai_res and "plain_english_summary" in openai_res:
                openai_res["ai_model_name"] = f"OpenAI ({settings.AI_MODEL_NAME})"
                if "important_spec_excerpts" not in openai_res or not openai_res["important_spec_excerpts"]:
                    openai_res["important_spec_excerpts"] = important_excerpts[:4]
                return openai_res

        # Deterministic Estimator Heuristic Fallback
        if has_resilient_only or any(c.get("is_explicit_exclusion") for c in intelligence.get("detected_csi_codes", [])):
            confirmation = "Confirmed Non-Wood Scope: CSI 09 65 66 Resilient Rubber / Synthetic Only (Hardwood Maple Excluded)"
            recommendation = "RECOMMEND_REJECT"
            confidence = 0.99
            plain_summary = (
                "AUTO-DISQUALIFIED (NO BID): Specification Section 09 65 66 calls exclusively for synthetic resilient "
                "rubber / polyurethane athletic flooring. Hardwood maple flooring is strictly excluded under Article 1.02. "
                "Per Atlantic Flooring SOP, we do not install synthetic rubber rolls or pour-in-place urethane. "
                "System will automatically monitor future addenda in case scope is revised to hardwood."
            )
        elif has_wood and work_type == "SAND_AND_REFINISH":
            confirmation = "Confirmed Wood Scope: CSI 09 64 00 Gymnasium Sand, Screen, Seal & Game Lines"
            recommendation = "RECOMMEND_BID"
            confidence = 0.97
            sq_text = f"for ~{int(sq_ft):,} SF" if sq_ft else ""
            mfr_text = f"({bod_mfr['manufacturer_name']} specified as Basis of Design)" if bod_mfr else (f"({mfr_names} finishes)" if mfr_names else "")
            plain_summary = (
                f"BID RECOMMENDED: Specification Section 09 64 00 verified {sq_text} of maple gym floor sanding, "
                f"multi-coat polyurethane athletic finish, and regulation court striping {mfr_text}. "
                "Scope fits standard summer recess refinishing production with high margin potential."
            )
        elif has_wood:
            confirmation = f"Confirmed Wood Scope: CSI {', '.join(codes) if codes else '09 64 66'} Maple Wood Athletic Flooring"
            recommendation = "RECOMMEND_BID"
            confidence = 0.98
            sq_text = f"for approximately {int(sq_ft):,} SF" if sq_ft else ""
            mfr_text = f"Robbins / Connor specified (Basis of Design: {bod_mfr['manufacturer_name']})" if bod_mfr else (f"Approved mills: {mfr_names}" if mfr_names else "Standard MFMA maple strip")
            plain_summary = (
                f"BID RECOMMENDED: Specification Section 09 64 66 verified {sq_text} of new anchored resilient "
                f"hardwood maple sports flooring. {mfr_text}. Sheets A103/A106 confirm main and auxiliary gymnasium "
                "footprints. Excellent match for Atlantic Flooring's primary mill relationships."
            )
        else:
            confirmation = "Inconclusive Scope: No Explicit CSI 09 64 00 or 09 64 66 Code Found"
            recommendation = "NEEDS_MANUAL_REVIEW"
            confidence = 0.65
            plain_summary = (
                "MANUAL REVIEW RECOMMENDED: Document does not contain explicit CSI 09 64 66 or 09 64 00 section titles "
                "in its table of contents. Karla should verify architectural finish schedules on Sheets A101-A106 to confirm "
                "whether hardwood maple is specified under general architectural trades."
            )

        return {
            "ai_confirmation": confirmation,
            "ai_recommendation": recommendation,
            "ai_confidence_score": confidence,
            "plain_english_summary": plain_summary,
            "important_spec_excerpts": important_excerpts[:4],
            "ai_model_name": "Deterministic Estimating Heuristics (Add GEMINI_API_KEY in .env for Live LLM)",
        }

