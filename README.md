<div align="center">

# 🏢 Atlantic Estimating OS
### Autonomous Commercial Estimating, Spec Analysis & Bid Qualification Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.1_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Beanie_ODM-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>An AI-powered operating system for commercial specialty subcontractors to automate the tedious 10-hour manual bid review process into a 15-second qualified decision.</strong>
</p>

[Quick Start](#-quick-start-in-5-minutes) •
[Architecture](#-system-architecture) •
[Features](#-key-features) •
[Project Structure](#-project-structure) •
[Configuration](#-configuration--environment-variables) •
[Beginner Contribution Guide](#-contributing-guide-beginners-welcome) •
[Troubleshooting](#-troubleshooting--faq)

---

</div>

## 📌 What is Atlantic Estimating OS?

Commercial specialty subcontractors (such as athletic gymnasium hardwood flooring contractors) receive **dozens of 100+ page architectural specification books and blueprint sets** each week from multiple General Contractors (GCs). 

Before spending 5 to 8 hours doing manual quantity takeoffs and material counts, an estimator must answer one critical question:
> **"Is this project actually qualified for our business to bid?"**

Estimators frequently waste hundreds of hours each month:
1. Manually reading Division 09 specification manuals searching for trade-specific keywords.
2. Accidentally bidding non-specialty materials (e.g., bidding synthetic rubber when the firm specializes exclusively in MFMA Hardwood Maple).
3. Receiving duplicate invitations for the same school district from 5 competing GCs and doing redundant takeoffs.
4. Estimating small 200 sq ft jobs 4 hours away where mobilization overhead eradicates profit.
5. Manually creating tasks in ClickUp and organizing cloud folders in OneDrive.

**Atlantic Estimating OS** solves this entire pipeline autonomously using a modern 5-layer workflow combining Multimodal LLMs, deterministic business rules, fuzzy deduplication, and automated cloud provisioning.

---

## 🏛️ System Architecture

The platform follows a **5-Layer Architecture** designed for high reliability, auditability, and human-in-the-loop control:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 Layer 1: Incoming Bids & Project Files                  │
│   • GC Email Invites (Azure Graph API / IMAP4 SSL Harvester)            │
│   • Plan-Room Bids (PlanHub / Dodge / ConstructConnect / Procore)       │
│   • Project Spec Manuals (PDF) & Blueprint Sets (A-Sheets)              │
│   • Project Addendums & Scope Revisions                                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Layer 2: Smart AI Filtering Layer                     │
│   • Document Profiler (PyMuPDF High-Speed Section Extraction)           │
│   • Flooring Scope Radar: Division 09 64 66 (Wood) vs 09 65 66 (Resilient)│
│   • Vital Facts Extraction (GC, Address, Bid Due Date, Gym SF)         │
│   • Plain-English Executive Summary (Gemini 1.5/2.0 Flash or GPT-4o)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 Layer 3: Strict Company Business Rules                  │
│   • The Data Gatekeeper: Flags missing due dates, SF, or unreadable scan│
│   • Trade Scope Filter: Pass Wood / Flag Resilient-Only                 │
│   • Dynamic Distance-vs-Footprint Check:                                │
│       - Local (<50 mi): Any SF qualified                                │
│       - Regional (50–150 mi): Requires ≥7,500 SF to absorb per-diems    │
│       - Long Distance (>150 mi): Disqualified unless arena ≥14,000 SF   │
│   • Multi-GC Deduplication (RapidFuzz Token-Set Ratio >85% Similarity)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 Layer 4: Business Software Automation                   │
│   • ClickUp Task Creation: Custom fields (SF, CSI, Basis of Design, GCs)│
│   • OneDrive Cloud Hierarchy Setup: 5 standardized subdirectories       │
│     (01_Specs, 02_Drawings, 03_Addenda, 04_Takeoffs, 05_Vendor_Quotes)  │
│   • Permanent Secure Audit Ledger: Immutable timeline log               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Layer 5: Human Quality Control & Sign-offs                │
│   • Karla's Triage Desk: 5 specialized filter tabs                      │
│   • Slide-over Interactive Approval Drawer (Estimator & Slot assignment)│
│   • Quick-Reason Rejection Modal: 4 instant chips + AI Feedback Memory  │
│   • Addendum Watchdog: Re-qualifies bids if addenda swap scope to wood  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- **⚡ Dual Intake Engine:** Automatically polls a dedicated email folder (e.g. `Inbox/Bid Invites` via Microsoft Graph API or IMAP4 SSL) and provides an instant drag-and-drop PDF specification uploader.
- **🔍 Split-Screen Spec Inspector:** Side-by-side view with original indexed PDF specification clauses on the left and extracted AI intelligence on the right.
- **🛡️ The Data Gatekeeper:** Dedicated *Exceptions / Missing Info* tab with inline quick-fix parameter fields (due date, estimated gym square footage) that immediately re-evaluate business rules.
- **👥 Multi-GC Deduplication:** Consolidates multiple GCs bidding the same project into a single master dossier using fuzzy matching (`RapidFuzz`), eliminating duplicate estimating work.
- **🚗 Distance-vs-Footprint Geofence:** Dynamic logistics engine that evaluates driving mileage and travel overhead against project scale.
- **📂 Automated 5-Folder OneDrive Provisioning:** Generates structured cloud folders ready for architectural drawings, addenda, and manufacturer quotes upon approval.
- **📋 ClickUp Task Pipeline:** Creates tasks with bid timers, estimated SF, approved manufacturers (Robbins, Connor, Aacer), and links.
- **🐕 Addendum Watchdog:** Monitors project revisions. If an architect releases an addendum swapping synthetic resilient flooring to maple wood athletic flooring, the project surges back to the top of the desk with an amber alert.
- **🧠 19-Year-Old Estimator AI Memory Loop:** When an estimator rejects a bid with custom notes, the rule is saved to `AIFeedbackRule` to continuously train future AI qualifications.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router + Turbopack engine)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v3.4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Design System:** Custom Dark Slate Glassmorphism with micro-animations

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Server:** [Uvicorn](https://www.uvicorn.org/) with async event loop
- **Database ODM:** [Beanie](https://beanie-odm.dev/) (Async MongoDB ODM built on Motor & Pydantic v2)
- **Fuzzy Matching:** [RapidFuzz](https://github.com/rapidfuzz/RapidFuzz)
- **PDF Extraction:** [PyMuPDF (fitz)](https://pymupdf.readthedocs.io/)
- **Security:** PyJWT for Role-Based Access Control (RBAC)

### AI & LLM Engine
- **Default:** Google Gemini 1.5 / 2.0 Flash (via `@google/genai` or HTTP API, 1M token context window)
- **Alternative:** OpenAI GPT-4o / GPT-4o-mini
- **Built-in Fallback:** Fast regex/heuristic scanner when no API keys are configured (works 100% offline).

---

## 🚀 Quick Start in 5 Minutes

You can run the entire OS locally using **Docker Compose** (recommended) or **Manual Setup**.

### Prerequisites
Make sure you have installed:
- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker method)
- OR [Node.js 18+](https://nodejs.org/) & [Python 3.11+](https://www.python.org/) (for Manual method)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI (or a local MongoDB running on `localhost:27017`)

---

### Option A: Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ashishsharmastudio/Commercial-Estimating-Automation-Bid-Setup-Proposal.git
   cd Commercial-Estimating-Automation-Bid-Setup-Proposal
   ```

2. **Configure Environment Variables:**
   Copy the provided `.env.example` file to `.env`:
   ```bash
   # On Windows (PowerShell):
   cp .env.example .env

   # On Linux / macOS:
   cp .env.example .env
   ```
   Open `.env` and set your `MONGODB_URI` (and optionally your `GEMINI_API_KEY`):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
   DATABASE_NAME=atlantic_estimating_os
   AI_PROVIDER=gemini
   AI_MODEL_NAME=gemini-1.5-flash
   GEMINI_API_KEY=your-gemini-api-key
   ```
   > 💡 *Tip: If you do not have an AI key yet, leave it blank! The OS includes an automatic deterministic heuristic parser so you can test all features immediately.*

3. **Launch the platform:**
   *(Note: Make sure there is a space between `docker` and `compose`)*
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - 🖥️ **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - ⚙️ **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - 🔍 **Interactive Spec Inspector:** [http://localhost:3000/inspector](http://localhost:3000/inspector)
   - 📥 **Email & Portal Intake:** [http://localhost:3000/intake](http://localhost:3000/intake)
   - 📋 **Karla's Triage Desk:** [http://localhost:3000/triage](http://localhost:3000/triage)

---

### Option B: Manual Local Setup (Without Docker)

If you prefer to run services individually without Docker:

#### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server with live reload
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000`.

#### 2. Frontend Setup (Next.js)
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js Turbopack development server
npm run dev
```
Frontend will be live at `http://localhost:3000`.

---

## 📁 Project Structure

```
atlantic-estimating-os/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Root git ignore (protects .env, node_modules, etc.)
├── docker-compose.yml            # Multi-container orchestration (Backend + Frontend)
│
├── backend/                      # FastAPI Python Backend
│   ├── .gitignore                # Python venv & cache ignore rules
│   ├── Dockerfile                # Backend container definition
│   ├── requirements.txt          # Python dependencies
│   └── app/
│       ├── main.py               # FastAPI entrypoint, CORS & lifespan
│       ├── config.py             # Pydantic BaseSettings loading from .env
│       ├── database.py           # Motor & Beanie ODM initialization
│       ├── models/               # MongoDB Document Schemas
│       │   ├── project.py        # Project, TakeoffItem, CSI Citation, GCInvite
│       │   ├── user.py           # RBAC Roles (Senior Estimator, Owner, PM)
│       │   ├── company_settings.py # Target CSI codes, mills & thresholds
│       │   └── ai_feedback.py   # AI Estimator memory rules
│       ├── services/             # Core Business Logic & AI Engines
│       │   ├── pdf_extractor.py  # PyMuPDF + Gemini 1.5/GPT-4o parser
│       │   ├── business_rules.py # Gatekeeper, distance check, fuzzy dedup
│       │   ├── automation_service.py # ClickUp & OneDrive 5-folder provisioning
│       │   └── email_fetcher.py  # Azure Graph & IMAP4 email harvester
│       ├── controllers/          # Request Orchestration
│       │   ├── ingestion_controller.py   # Bid ingestion & Addendum watchdog
│       │   ├── triage_controller.py      # Approval drawer & rejection chips
│       │   └── estimate_rfq_controller.py# Takeoffs, RFQ & estimate sync
│       ├── views/                # API Endpoints (FastAPI Routers)
│       │   ├── project_view.py   # /api/projects, /api/triage, /api/ingest
│       │   └── auth_view.py      # /api/auth users & RBAC switcher
│       ├── scripts/              # Utility Scripts
│       │   └── generate_real_specs.py # Generates realistic sample PDF specs
│       └── static/specs/         # Sample specification PDF documents
│
└── frontend/                     # Next.js 16 (React 19) Frontend
    ├── .gitignore                # Frontend node_modules & .next ignore rules
    ├── Dockerfile                # Frontend container definition
    ├── package.json              # NPM dependencies & scripts
    ├── tsconfig.json             # TypeScript compiler settings
    ├── tailwind.config.ts        # Tailwind CSS theme configuration
    └── src/
        ├── context/
        │   └── OSContext.tsx     # Centralized State, API calls & RBAC context
        ├── components/
        │   ├── NavbarRBAC.tsx    # Role Switcher (Karla Delaet / John Delaet)
        │   └── Sidebar.tsx       # 7-Stage Estimating Navigation bar
        └── app/
            ├── page.tsx          # Pipeline Master Grid (Stages 1-7)
            ├── triage/page.tsx   # Stage 1: Karla's Triage Desk & Approval Drawer
            ├── inspector/page.tsx# Split-screen PDF spec vs AI intelligence
            ├── intake/page.tsx   # Outlook & Plan-room email sync desk
            ├── projects/[id]/page.tsx # Detailed Project Dossier view
            ├── proposal/page.tsx # Commercial Proposal preview
            └── settings/page.tsx # Geofence radius & AI feedback rule manager
```

---

## ⚙️ Configuration & Environment Variables

All settings are configured via the root [`.env`](.env) file. A complete reference is provided in [`.env.example`](.env.example):

| Variable | Description | Default | Required? |
| :--- | :--- | :--- | :---: |
| `MONGODB_URI` | MongoDB Connection URI (Atlas or Local) | `mongodb://localhost:27017` | **Yes** |
| `DATABASE_NAME` | MongoDB database name | `atlantic_estimating_os` | No |
| `JWT_SECRET` | Secret key for JWT session auth | `super-secret-key-2026` | No |
| `AI_PROVIDER` | AI provider to use (`gemini` or `openai`) | `gemini` | No |
| `AI_MODEL_NAME` | Model name (`gemini-1.5-flash`, `gpt-4o`) | `gemini-1.5-flash` | No |
| `GEMINI_API_KEY` | Google AI Studio API key | `""` | Optional |
| `OPENAI_API_KEY` | OpenAI API key | `""` | Optional |
| `AZURE_TENANT_ID` | Microsoft Entra ID (Tenant ID) | `""` | Optional |
| `AZURE_CLIENT_ID` | Azure App Client ID | `""` | Optional |
| `AZURE_CLIENT_SECRET` | Azure Client Secret Value | `""` | Optional |
| `OUTLOOK_MONITORED_EMAIL`| Target estimating email account | `karla@atlanticflooring.com`| No |
| `OUTLOOK_FOLDER_NAME`| Target email intake folder | `Inbox/Bid Invites` | No |
| `IMAP_HOST` | IMAP4 Mail server hostname | `outlook.office365.com` | Optional |
| `IMAP_PORT` | IMAP4 SSL port | `993` | Optional |
| `IMAP_USER` | IMAP username / email | `""` | Optional |
| `IMAP_PASSWORD` | IMAP app password | `""` | Optional |
| `NEXT_PUBLIC_API_URL`| Frontend URL pointing to FastAPI backend | `http://localhost:8000/api` | **Yes** |

---

## 🤝 Contributing Guide (Beginners Welcome!)

We love contributions! Whether you are fixing a typo, improving CSS animations, adding unit tests, or integrating a new plan-room portal, your help is appreciated.

### 🌟 Good First Issues for Beginners
- [ ] Add unit tests for `BusinessRulesService` using `pytest`.
- [ ] Add a new certified maple flooring manufacturer to `SpecifiedManufacturer` list in `company_settings.py`.
- [ ] Improve dark-mode contrast or mobile responsiveness on `/triage`.
- [ ] Implement export of qualified project summaries to CSV / Excel.
- [ ] Add keyboard shortcuts (e.g. `A` for approve, `D` for decline) to Karla's Triage Desk.

### Step-by-Step Contribution Workflow

1. **Fork the Repository:**
   Click the **Fork** button in the upper right corner of this GitHub page.

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/<your-username>/Commercial-Estimating-Automation-Bid-Setup-Proposal.git
   cd Commercial-Estimating-Automation-Bid-Setup-Proposal
   ```

3. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes:**
   - Follow clean code practices.
   - For backend code: PEP8 compliant.
   - For frontend code: TypeScript types, clean Tailwind CSS.

5. **Test your changes:**
   ```bash
   # Test frontend build:
   cd frontend
   npm run build

   # Test backend:
   cd ../backend
   .\venv\Scripts\python.exe -m pytest  # or run manual checks
   ```

6. **Commit your changes:**
   Use clear, conventional commit messages:
   ```bash
   git add .
   git commit -m "feat: add keyboard shortcuts for triage desk approval"
   ```

7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request (PR):**
   Go to your fork on GitHub and click **Compare & pull request**. Fill out the PR template describing your changes.

---

## ❓ Troubleshooting & FAQ

### Q1: `docker: unknown command: docker compose-up`
**Answer:** In Docker CLI, the sub-command is separated by a space, not a hyphen:
```bash
# Correct:
docker compose up -d

# Incorrect:
docker compose-up
```

### Q2: MongoDB connection error or timeout
**Answer:** 
1. Make sure your IP address is whitelisted in MongoDB Atlas under **Network Access** (`0.0.0.0/0` for development).
2. Ensure you have copied `.env.example` to `.env` and supplied a valid `MONGODB_URI`.
3. Check the backend logs: `docker logs atlantic_backend`.

### Q3: Do I need a paid Gemini or OpenAI API key to run this?
**Answer:** **No!** If `GEMINI_API_KEY` is left blank, the system automatically falls back to its deterministic regex & heuristic rule engine. It extracts Division 09 CSI codes, manufacturers, square footages, and due dates using local algorithms.

### Q4: How do I test the Addendum Watchdog feature?
**Answer:**
1. Navigate to `/triage`.
2. Locate a non-wood project (e.g., Allentown Civic Center).
3. Click the amber button: **"Simulate Addendum #2"**.
4. The watchdog will re-parse the addendum, detect the maple hardwood specification change, and resurrect the project with an alert banner!

---

## 📜 License

This project is open-source under the **[MIT License](LICENSE)**. You are free to use, modify, and distribute it for personal and commercial projects.

---

<div align="center">
  <sub>Built with ❤️ for specialty subcontractors, estimators, and automation enthusiasts.</sub>
</div>
