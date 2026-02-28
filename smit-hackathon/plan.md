# Implementation Plan: AI Clinic Management + Smart Diagnosis SaaS

**Date**: 2026-03-01 | **Spec**: `smit-hackathon/spec.md` | **Constitution**: `.specify/memory/constitution.md`  
**Track**: Final Hackathon (Advanced MERN)

---

## Summary

Build a 4-role clinic management SaaS (Admin, Doctor, Receptionist, Patient) with AI-assisted diagnosis, prescription PDF generation, analytics dashboards, and simulated subscription plans. All features trace directly to the clarified spec acceptance criteria.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 16 (React 19), MongoDB 7, Tailwind CSS 4  
**Storage**: MongoDB (data), Cloudinary or Supabase Storage (file uploads)(use supabase. mcp is connected already use this project https://ybtmsrdztizutywfwqbv.supabase.co)  
**Auth**: JWT with bcrypt password hashing, role-based middleware  
**AI**: Gemini API (free tier) via backend proxy endpoint  
**Charts**: Recharts (React-native, composable)  
**PDF**: jsPDF or react-pdf (client-side generation)  
**Deployment**: Vercel (frontend + API routes), MongoDB Atlas (database)  
**Constraints**: Graceful AI fallback; Free Plan caps at 25 patients; no secrets in client

### Stack Decision: Next.js vs Express.js

The spec lists Express.js as required. The project is initialized with **Next.js 16**, which provides:
- React frontend (satisfies React.js requirement)
- API Routes (satisfies Express.js/Node.js backend requirement)
- Server-side rendering and built-in routing
- Single deployment target (Vercel)

**Decision**: Proceed with Next.js. API Routes serve the same purpose as Express endpoints. This simplifies deployment and is standard practice for MERN-track hackathons. If judges require standalone Express, API routes can be extracted with minimal effort.

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec Is Law | ✅ | All phases map 1:1 to spec sections |
| II. No Feature Creep | ✅ | Plan includes only spec features; stretch goals labeled |
| III. Deterministic | ✅ | Revenue = appointments × 500; no random values |
| IV. Readability | ✅ | Service layer pattern; named constants; no abbreviations |
| V. Fail Explicitly | ✅ | Consistent `{ success, message }` API format; AI fallback planned |
| VI. Role Boundaries | ✅ | Middleware-enforced RBAC on every route |

---

## Project Structure

### Documentation

```
smit-hackathon/smit-hackathon/
├── spec.md              # Clarified spec (source of truth)
├── plan.md              # This file
├── .specify/
│   └── memory/
│       └── constitution.md
```

### Source Code (repository root: smit-hackathon/)

```
smit-hackathon/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (sidebar, theme)
│   ├── page.tsx                  # Landing / login redirect
│   ├── globals.css               # Tailwind + medical theme
│   │
│   ├── (auth)/                   # Auth pages (public)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin analytics dashboard
│   │   │   ├── doctors/page.tsx
│   │   │   ├── receptionists/page.tsx
│   │   │   └── subscriptions/page.tsx
│   │   │
│   │   ├── doctor/
│   │   │   ├── page.tsx          # Doctor dashboard (stats)
│   │   │   ├── appointments/page.tsx
│   │   │   ├── patients/[id]/page.tsx
│   │   │   ├── prescriptions/new/page.tsx
│   │   │   └── ai-checker/page.tsx
│   │   │
│   │   ├── receptionist/
│   │   │   ├── page.tsx          # Daily schedule
│   │   │   ├── patients/page.tsx
│   │   │   ├── patients/new/page.tsx
│   │   │   └── appointments/page.tsx
│   │   │
│   │   └── patient/
│   │       ├── page.tsx          # Patient profile
│   │       ├── appointments/page.tsx
│   │       ├── prescriptions/page.tsx
│   │       └── book/page.tsx
│   │
│   └── api/                      # API Routes (backend)
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── users/route.ts
│       ├── patients/route.ts
│       ├── appointments/route.ts
│       ├── prescriptions/route.ts
│       ├── diagnosis/route.ts
│       ├── ai/
│       │   ├── symptom-check/route.ts
│       │   ├── prescription-explain/route.ts
│       │   └── risk-flag/route.ts
│       ├── analytics/
│       │   ├── admin/route.ts
│       │   └── doctor/route.ts
│       └── subscriptions/route.ts
│
├── lib/                          # Shared utilities
│   ├── db/
│   │   ├── mongodb.ts            # Connection singleton
│   │   └── models/               # Mongoose models
│   │       ├── User.ts
│   │       ├── Patient.ts
│   │       ├── Appointment.ts
│   │       ├── Prescription.ts
│   │       └── DiagnosisLog.ts
│   ├── auth/
│   │   ├── jwt.ts                # Sign/verify helpers
│   │   └── middleware.ts         # Role-based route protection
│   ├── ai/
│   │   └── gemini.ts             # AI client with fallback
│   ├── pdf/
│   │   └── prescription.ts       # PDF generation
│   ├── constants.ts              # Plan limits, revenue rate, roles
│   └── types.ts                  # Shared TypeScript interfaces
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI (buttons, inputs, cards)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── DashboardShell.tsx
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── PatientForm.tsx
│   │   ├── AppointmentForm.tsx
│   │   └── PrescriptionForm.tsx
│   ├── timeline/
│   │   └── MedicalTimeline.tsx
│   ├── charts/
│   │   ├── AppointmentChart.tsx
│   │   ├── DiagnosisChart.tsx
│   │   └── RevenueCard.tsx
│   └── ai/
│       ├── SymptomCheckerForm.tsx
│       ├── RiskBadge.tsx
│       └── PrescriptionExplanation.tsx
│
└── public/
    └── logo-placeholder.png
```

---

## Implementation Phases

### Phase 0: Foundation

> Goal: Working auth, database, and project skeleton. Every subsequent phase depends on this.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 0.1 | **MongoDB Connection** | `lib/db/mongodb.ts` – connection singleton with env vars | Tech Stack: MongoDB |
| 0.2 | **Mongoose Models** | 5 models: User, Patient, Appointment, Prescription, DiagnosisLog | Database Structure section |
| 0.3 | **JWT Auth** | `lib/auth/jwt.ts` – sign, verify, extract role; `lib/auth/middleware.ts` – role gate | Auth & Authorization |
| 0.4 | **API: Login** | `POST /api/auth/login` – email/password → JWT | Secure login |
| 0.5 | **API: Register** | `POST /api/auth/register` – patient self-registration (role=patient) | Patient self-register |
| 0.6 | **Role Middleware** | Middleware validates JWT + checks role against allowed roles per route | RBAC, Constitution VI |
| 0.7 | **Login Page** | Form with email/password, validation, error states | UI Requirements |
| 0.8 | **Register Page** | Patient self-registration form | Patient Registration (clarified) |
| 0.9 | **Dashboard Shell** | Sidebar navigation, role-based menu items, protected layout | UI: Sidebar navigation |
| 0.10 | **Seed Script** | Create 1 admin, 1 doctor, 1 receptionist for testing | Implicit: demo-able roles |
| 0.11 | **Constants File** | `REVENUE_PER_APPOINTMENT = 500`, `FREE_PLAN_PATIENT_LIMIT = 25`, roles enum | Constitution III |
| 0.12 | **Response Format** | Utility: `{ success: boolean, data?: T, message?: string }` | Constitution V |

**Exit Criteria:** All 4 roles can log in and see their (empty) dashboards. Unauthorized access returns 401/403.

---

### Phase 1: Core Features – Patient & Appointment Management

> Goal: Full CRUD for patients and appointments. Receptionist and patient workflows functional.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 1.1 | **API: Patients CRUD** | `GET/POST/PUT /api/patients` – add, edit, list, get by ID | Patient Management |
| 1.2 | **Patient Form** | Name, age, gender, contact; used by receptionist | Receptionist: Register patient |
| 1.3 | **Patient List** | Table with search/filter; receptionist + doctor views | View patient profile |
| 1.4 | **Patient Profile Page** | Display patient info + link to timeline | View patient profile |
| 1.5 | **SaaS: Patient Limit Check** | Middleware on `POST /api/patients` – block at 25 if Free Plan | SaaS Free Plan: max 25 |
| 1.6 | **API: Appointments CRUD** | `GET/POST/PUT/DELETE /api/appointments` – book, cancel, update status | Appointment Management |
| 1.7 | **Appointment Booking Form** | Select doctor, date, time slot; used by receptionist + patient | Book appointment |
| 1.8 | **Doctor Schedule View** | Calendar-like day view: time slots showing booked/available | Doctor Schedule (clarified) |
| 1.9 | **Appointment Status Flow** | pending → confirmed → completed; dropdown on doctor/receptionist view | Update status |
| 1.10 | **Patient: Book Appointment** | Patient dashboard "Book Appointment" page | Patient self-booking (clarified) |
| 1.11 | **Patient: View Appointments** | List of own appointments with status | View appointment history |
| 1.12 | **Receptionist: Daily Schedule** | Today's appointments by doctor | Manage daily schedule |

**Exit Criteria:** Receptionist creates patient, books appointment; patient self-books; doctor sees schedule with slots; appointment status can be updated through full lifecycle. Free Plan blocks at 25 patients.

---

### Phase 2: Prescription System & Medical History

> Goal: Doctors can write prescriptions, patients can view/download PDFs, timeline works.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 2.1 | **API: Prescriptions CRUD** | `GET/POST /api/prescriptions` – create, list by patient/doctor | Prescription System |
| 2.2 | **Prescription Form** | Dynamic medicine rows: name, dosage, frequency, duration + notes | Add medicines, dosage, notes |
| 2.3 | **PDF Generator** | `lib/pdf/prescription.ts` – clinic name, logo placeholder, doctor, patient, medicines, date, signature space | Prescription PDF (clarified) |
| 2.4 | **Patient: View Prescriptions** | List of prescriptions with "Download PDF" button | View prescriptions |
| 2.5 | **Patient: Download PDF** | Client-side PDF generation + browser download | Download prescription PDF |
| 2.6 | **API: Diagnosis Logs** | `POST /api/diagnosis` – store symptom entries + AI responses | DiagnosisLogs model |
| 2.7 | **Medical Timeline Component** | Visual timeline: appointments + diagnoses + prescriptions, chronological | Medical History Timeline (clarified) |
| 2.8 | **Timeline: Click to Expand** | Each event expandable to show full details | Clicking event expands |
| 2.9 | **Timeline: Filter by Type** | Toggle: show/hide appointment, diagnosis, prescription events | Filter by event type |
| 2.10 | **Doctor: Patient History** | Doctor views patient profile → sees timeline | Access patient history |

**Exit Criteria:** Doctor creates multi-medicine prescription; patient downloads professional PDF; timeline shows all event types in order with expand/collapse and filtering.

---

### Phase 3: AI Integration

> Goal: All 4 AI features working with graceful fallback. System functions normally without AI.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 3.1 | **Gemini Client** | `lib/ai/gemini.ts` – API wrapper with timeout (10s) + error handling | AI Integration |
| 3.2 | **AI Fallback** | All AI endpoints: try/catch → `{ success: false, message: "AI temporarily unavailable" }` | AI Fallback (clarified) |
| 3.3 | **SaaS: AI Gate** | Middleware: block AI endpoints for Free Plan users | SaaS: No AI on Free Plan |
| 3.4 | **API: Symptom Check** | `POST /api/ai/symptom-check` – symptoms, age, gender, history → conditions, risk, tests | AI Feature 1 |
| 3.5 | **Symptom Checker UI** | Form (text, number, dropdown, text) + result card with conditions/risk/tests | AI Feature 1 AC |
| 3.6 | **API: Prescription Explain** | `POST /api/ai/prescription-explain` – prescription data → simple explanation | AI Feature 2 |
| 3.7 | **Explanation Display** | On prescription detail page, show AI explanation to patient | AI Feature 2 AC |
| 3.8 | **API: Risk Flag** | `POST /api/ai/risk-flag` – analyze patient diagnosis history | AI Feature 3 |
| 3.9 | **Risk Detection Logic** | Query: patient with 3+ similar diagnoses in 30 days → flag | AI Feature 3 AC |
| 3.10 | **Risk Badge Component** | Visual badge on patient profile; warning banner for doctor | AI Feature 3: Visual + Alert |
| 3.11 | **Free Plan: AI Blocked UI** | "Upgrade to Pro" prompt when Free Plan user attempts AI features | SaaS AC |

**Exit Criteria:** Doctor uses symptom checker, gets response or sees fallback message. Patient sees prescription explanation. Risk-flagged patients show badge. Free Plan users see upgrade prompt on AI features. System works fully with AI disabled.

---

### Phase 4: Analytics Dashboards

> Goal: Admin and Doctor dashboards showing spec-required metrics with charts.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 4.1 | **API: Admin Analytics** | `GET /api/analytics/admin` – totals, revenue, top diagnoses, flagged patients | Admin Dashboard |
| 4.2 | **Admin Dashboard Page** | Cards: total patients, doctors, monthly appointments, revenue | Admin Dashboard AC |
| 4.3 | **Revenue Calculation** | `completed_appointments_count × REVENUE_PER_APPOINTMENT (500)` | Revenue (clarified) |
| 4.4 | **Diagnosis Chart** | Recharts bar/pie chart: top 5 diagnoses this month | Most common diagnosis |
| 4.5 | **Flagged Patients Table** | Table of high-risk patients from AI Feature 3 | Risk flagged list |
| 4.6 | **API: Doctor Analytics** | `GET /api/analytics/doctor` – daily appointments, monthly stats, Rx count | Doctor Dashboard |
| 4.7 | **Doctor Dashboard Page** | Today's appointments list + monthly chart + prescription count | Doctor Dashboard AC |
| 4.8 | **Date Range Filter** | Filter analytics by date range on doctor dashboard | Filter by date range |
| 4.9 | **AI Feature 4: Predictive** | Top 5 diseases chart, appointment trend (7/30 days), doctor performance | Predictive Analytics |
| 4.10 | **Admin: Subscription Mgmt** | Admin page: list users, view/change plan (Free ↔ Pro) | Manage subscription plans |
| 4.11 | **Admin: User Management** | Manage doctors + receptionists (add, view, remove) | Manage doctors, receptionists |

**Exit Criteria:** Admin sees all analytics with real data. Doctor sees personal stats. Subscription toggle works immediately. Charts render with Recharts.

---

### Phase 5: Polish, Deploy, Submit

> Goal: Production-ready app meeting all UI, deployment, and submission requirements.

| # | Component | Responsibility | Spec Reference |
|---|-----------|---------------|----------------|
| 5.1 | **Medical Theme** | Clean color palette (blues/whites), consistent typography | UI: Clean medical theme |
| 5.2 | **Responsive Layout** | Test all pages at 320px, 768px, 1024px+ | UI: Responsive layout |
| 5.3 | **Loading States** | Skeleton/spinner on all async operations | UI: Loading states |
| 5.4 | **Error Messages** | User-friendly messages on all forms + API failures | UI: Proper error messages |
| 5.5 | **Form Validation** | Client-side (immediate feedback) + server-side (security) | UI + Implicit Req |
| 5.6 | **Environment Variables** | `.env.example` with all required vars documented | Constitution: no secrets in repo |
| 5.7 | **Seed Data** | Comprehensive seed: admin, doctors, receptionist, patients, appointments | Demo readiness |
| 5.8 | **Deploy to Vercel** | Connect GitHub repo, configure env vars, verify live URL | Deployment Requirement |
| 5.9 | **MongoDB Atlas** | Production cluster, connection string in Vercel env | Deployment Requirement |
| 5.10 | **README** | Setup instructions, env vars, features list, demo credentials, tech stack | Proper README required |
| 5.11 | **Demo Video** | 3–7 min showing all features by role per submission requirements | Submission: Demo video |
| 5.12 | **Final Test** | Walk through all acceptance criteria on deployed URL | All spec ACs |

**Exit Criteria:** Live URL works. All 4 roles demo-able. PDF downloads. AI features work (or degrade gracefully). README complete. Video recorded.

---

## Stretch Goals (Only After All Phases Complete)

These are explicitly marked optional in the spec. Do NOT start until Phase 5 is complete.

| Feature | Spec Reference |
|---------|---------------|
| Urdu explanation mode | AI Feature 2: "stretch goal" |

---

## Dependency Graph

```
Phase 0 (Foundation)
  │
  ├──→ Phase 1 (Patients + Appointments)
  │       │
  │       └──→ Phase 2 (Prescriptions + Timeline)
  │               │
  │               ├──→ Phase 3 (AI Integration)
  │               │       │
  │               │       └──→ Phase 4 (Analytics + SaaS)
  │               │               │
  │               │               └──→ Phase 5 (Polish + Deploy)
  │               │
  │               └──→ Phase 4 can start charts without AI
  │
  └──→ Phase 5 (theme/responsive) can start in parallel with Phase 3+
```

**Critical Path:** Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

**Parallelizable:**
- Phase 5.1–5.5 (UI polish) can run alongside Phase 3/4
- Phase 4.1–4.3 (non-AI analytics) can start after Phase 2

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limit / downtime | AI features non-functional | Fallback UI built in Phase 3.2 before any AI feature |
| MongoDB Atlas cold start latency | Slow first request on Vercel | Use connection pooling singleton |
| PDF generation on client fails | Patient can't download prescription | Test early in Phase 2.3; have server-side fallback |
| Scope creep during implementation | Incomplete features | Constitution Principle II; reject all non-spec work |
| Time pressure (hackathon) | Unfinished phases | Phases ordered by spec priority; Phase 5 is polish, not new features |

---

## Decisions Log

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Next.js over Express.js | Already initialized; single deployment; API routes equivalent | Separate Express server (more deployment complexity) |
| Recharts over Chart.js | React-native composability; better TS support | Chart.js (imperative API, less React-idiomatic) |
| Client-side PDF (jsPDF) | No server dependency; works on Vercel free tier | pdfkit (requires Node runtime, larger bundle) |
| Gemini over OpenAI | Free tier available per spec requirement | OpenAI (paid; spec says "whichever is free") |
| Tailwind CSS | Already installed; utility-first; responsive by default | Custom CSS (slower for hackathon pace) |
