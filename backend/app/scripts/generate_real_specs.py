"""
Generates 3 authentic multi-page CSI Division 09 public works specification PDFs
for Atlantic Flooring's primary operating territory (PA, NY, NJ).
Saved to backend/app/static/specs/ for direct rendering in the Split-Screen Inspector.
"""

import os
import fitz  # PyMuPDF

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "specs")
os.makedirs(STATIC_DIR, exist_ok=True)

def create_pdf(filename: str, title: str, pages_content: list):
    doc = fitz.open()
    for page_num, text in enumerate(pages_content, 1):
        page = doc.new_page(width=612, height=792)  # Standard US Letter
        
        # Header rule & Project Title
        header_text = f"PROJECT MANUAL: {title.upper()} | PAGE {page_num}"
        page.insert_text((54, 36), header_text, fontsize=8, color=(0.4, 0.4, 0.4))
        page.draw_line((54, 44), (558, 44), color=(0.7, 0.7, 0.7), width=0.5)

        # Body Text
        rect = fitz.Rect(54, 58, 558, 730)
        page.insert_textbox(rect, text, fontsize=9.5, fontname="helv", color=(0.1, 0.1, 0.1), lineheight=1.25)
        
        # Footer
        footer_text = "CONFIDENTIAL & PROPRIETARY — DIVISION 09 FINISHES SPECIFICATION"
        page.insert_text((54, 755), footer_text, fontsize=8, color=(0.5, 0.5, 0.5))
        page.draw_line((54, 745), (558, 745), color=(0.7, 0.7, 0.7), width=0.5)

    filepath = os.path.join(STATIC_DIR, filename)
    doc.save(filepath)
    doc.close()
    print(f"Generated: {filepath} ({len(pages_content)} pages)")
    return filepath

def generate_all():
    # 1. Lower Merion High School - CSI 09 64 66 (Target Wood Athletic Maple Gym)
    p1_lower_merion = [
        # Page 1: Cover & Division 09 Table of Contents
        """LOWER MERION SCHOOL DISTRICT
MONTGOMERY COUNTY, PENNSYLVANIA
PROJECT: HIGH SCHOOL MAIN GYMNASIUM FLOORING REPLACEMENT
ARCHITECT: BartonPartners Architecture & Planning, Norristown, PA
PROJECT MANUAL - VOLUME II: TECHNICAL SPECIFICATIONS

DIVISION 09 - FINISHES: TABLE OF CONTENTS
Section 09 22 16 - Non-Structural Metal Framing .................................... Page 10
Section 09 29 00 - Gypsum Board ................................................... Page 25
Section 09 51 00 - Acoustical Ceilings ............................................ Page 48
Section 09 64 66 - WOOD ATHLETIC FLOORING (MAPLE GYMNASIUM SYSTEM) ................. Page 142
Section 09 65 19 - Resilient Tile Flooring (Storage / Corridors) .................. Page 180
Section 09 91 23 - Interior Painting & Court Striping ............................. Page 210

ARCHITECTURAL DRAWING INDEX:
Sheet A100 - Overall Campus Master Plan
Sheet A101 - Lower Level Floor Plan & Demolition Scope
Sheet A103 - Main Gymnasium Dimensioned Floor Plan (14,200 SF Scope Area)
Sheet A106 - Athletic Thresholds, Expansion Joint Details & Bleacher Blocking Schedule""",

        # Page 2: Section 09 64 66 - Part 1 General
        """SECTION 09 64 66 - WOOD ATHLETIC FLOORING

PART 1 - GENERAL
1.1 RELATED DOCUMENTS:
A. Drawings and general provisions of the Contract, including General and Supplementary Conditions and Division 01 Specification Sections, apply to this Section.
B. Drawing Sheet A103 (Main Gymnasium Floor Plan) indicates total net athletic floor area of 14,200 sq ft.
C. Drawing Sheet A106 provides perimeter expansion void and bleacher load distribution requirements.

1.2 SUMMARY:
A. Section Includes: High-performance anchored resilient hardwood maple sports flooring system for the High School Main Gymnasium.
B. Accessories include:
   1. Flexible ventilated vinyl cove base with pre-molded outside corners.
   2. Aluminum threshold transitions at gymnasium door openings.
   3. Floor expansion joints and brass floor plates for volleyball and badminton post sleeves.
   4. Moisture mitigation vapor barrier system over entire concrete slab substrate.

1.3 QUALITY ASSURANCE:
A. Manufacturer: System shall be manufactured by an active member mill of the Maple Flooring Manufacturers Association (MFMA).
B. Flooring Contractor: Minimum 10 consecutive years of experience installing MFMA gymnasium floors in the Commonwealth of Pennsylvania. Atlantic Flooring certified applicator.""",

        # Page 3: Section 09 64 66 - Part 2 Products
        """SECTION 09 64 66 - WOOD ATHLETIC FLOORING (CONTINUED)

PART 2 - PRODUCTS
2.1 BASIS OF DESIGN MANUFACTURER & SYSTEM:
A. Basis of Design Standard: Robbins Sports Surfaces.
   1. Product System: Robbins Bio-Channel Classic Maple Athletic System.
   2. Subfloor Construction: Continuous steel channel anchors with dual-durometer shock pads providing DIN/EN 14904 athletic compliance.
B. Approved Manufacturers and Acceptable Equals (subject to prior architect verification):
   1. Connor Sports Flooring - NeoShok Maple Athletic System.
   2. Action Floor Systems - Action Thrust I Anchored Resilient System.
   3. Aacer Flooring - AacerChannel VLP Hardwood Sports System.

2.2 HARDWOOD FLOORING MATERIAL:
A. Species: Northern Hard Maple (Acer saccharum).
B. Grade: MFMA First Grade, kiln-dried to 6-9 percent moisture content.
C. Dimensions: 25/32-inch thickness x 2-1/4-inch face width, tongue and groove, end-matched.
D. Treatment: Factory treated with wood preservative adhering to MFMA environmental specifications.

2.3 VAPOR RETARDER:
A. 10-mil polyethylene slip sheet overlapping 6 inches at all joints, taped continuously.
B. Moisture vapor emission rate shall not exceed 3 lbs per 1,000 sq ft per 24 hours."""
    ]
    create_pdf("Lower_Merion_High_School_Gym_Spec_096466.pdf", "Lower Merion HS Gymnasium Replacement", p1_lower_merion)

    # 2. Allentown Civic Center - CSI 09 65 66 (Synthetic Resilient - Disqualified)
    p2_allentown = [
        # Page 1: Cover & TOC
        """CITY OF ALLENTOWN - PUBLIC WORKS DEPARTMENT
LEHIGH COUNTY, COMMONWEALTH OF PENNSYLVANIA
PROJECT: ALLENTOWN CIVIC OPERATIONS CENTER & ATHLETIC TRAINING WING
ARCHITECT: Alloy5 Architecture, Bethlehem, PA
PROJECT SPECIFICATIONS - DIVISION 09: FINISHES

INDEX OF SPECIFICATION SECTIONS:
Section 09 22 00 - Metal Stud Framing
Section 09 51 00 - Acoustical Ceilings & Baffles
Section 09 65 66 - RESILIENT ATHLETIC FLOORING (SYNTHETIC RUBBER / PVC) ............ Page 18
Section 09 68 13 - Tile Carpeting
Section 09 91 00 - Painting and Protective Coatings

NOTE TO BIDDERS:
This facility serves multi-purpose municipal training, indoor boot camps, and community weight rooms.
No hardwood maple flooring (CSI 09 64 00 / 09 64 66) is included or permitted under this contract.""",

        # Page 2: Section 09 65 66 - Products
        """SECTION 09 65 66 - RESILIENT ATHLETIC FLOORING

PART 1 - GENERAL
1.1 SCOPE OF WORK:
A. Provide all labor, materials, equipment, and supervision to install 8,500 sq ft of vulcanized synthetic rubber athletic sheet flooring in the multi-purpose civic training hall.
B. Substrate preparation, moisture testing, and polyurethane self-leveling underlayment.

PART 2 - PRODUCTS
2.1 ACCEPTABLE MANUFACTURERS:
A. Mondo America Inc. - Sportflex M 10mm Athletic Vulcanized Rubber.
B. Tarkett Sports - Omnisports Reference 8.3mm Multi-Use Synthetic Flooring.
C. Gerflor USA - Taraflex Sport M Plus Synthetic Vinyl Flooring.
D. Notice: Hardwood strip, tongue-and-groove maple, and wood athletic systems are strictly excluded.

2.2 PERFORMANCE REQUIREMENTS:
A. Shock Absorption: Minimum 32% force reduction per ASTM F2772.
B. Vertical Deformation: 1.5mm to 3.0mm.
C. Coefficient of Friction: 80 to 110 per EN 13036-4."""
    ]
    create_pdf("Allentown_Civic_Center_Resilient_Spec_096566.pdf", "Allentown Civic Center Athletic Training Wing", p2_allentown)

    # 3. Pavilion Central School District - CSI 09 64 00 (Sand & Refinish - Estimate 3790)
    p3_pavilion = [
        # Page 1: Cover & TOC
        """PAVILION CENTRAL SCHOOL DISTRICT
GENESEE COUNTY, NEW YORK
CAPITAL IMPROVEMENT PROGRAM: HIGH SCHOOL GYMNASIUM RESTORATION
ARCHITECT: Kimmel Bogrette Architecture + Site, Blue Bell, PA / Rochester, NY
PROJECT MANUAL - SPECIFICATION SECTION 09 64 00

PROJECT SUMMARY & SCOPE:
Sanding, screening, sealing, athletic court painting, and heavy-duty polyurethane finish coating
for the High School Gymnasium (approx. 10,214 sq ft).
Reference QuickBooks Master Estimate # 3790.
Target Completion Window: Summer Recess 2027 (June 25 - August 15, 2027).""",

        # Page 2: Section 09 64 00 - Execution
        """SECTION 09 64 00 - HARDWOOD FLOOR SANDING & ATHLETIC REFINISHING

PART 1 - GENERAL
1.1 SECTION INCLUDES:
A. Heavy drum sanding of existing 10,214 SF maple gymnasium floor down to bare wood.
B. Screening, tack rag cleaning, and application of MFMA approved athletic sealer.
C. Layout, masking, and precision painting of NCAA regulation game lines and center court school logo.
D. Application of two (2) finish coats of high-solids, MFMA certified polyurethane sports floor finish.

PART 2 - PRODUCTS
2.1 BASIS OF DESIGN FINISH SYSTEM:
A. Bona US - Bona SuperCourt Athletic Finishing System.
   1. Bona SuperCourt Athletic Sealer (low-VOC penetrating seal).
   2. Bona SuperCourt Optum High-Performance Polyurethane Sports Finish.
B. Acceptable Equal: Robbins Sports Surfaces - MFMA Heavy Duty Gym Finish.

PART 3 - EXECUTION
3.1 DRUM SANDING & LEVELING:
A. Machine sand entire 10,214 sq ft floor with heavy riding or walk-behind drum sanders.
B. First cut: #36 grit paper diagonal to grain to level all high spots.
C. Second cut: #60 grit paper parallel with wood grain.
D. Third cut: #100 grit finish paper to provide smooth uniform surface."""
    ]
    create_pdf("Pavilion_CSD_High_School_Gym_Spec_096400.pdf", "Pavilion Central School District HS Gym Refinishing", p3_pavilion)

if __name__ == "__main__":
    generate_all()
