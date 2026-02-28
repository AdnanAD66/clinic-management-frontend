# Tasks: AI Clinic Management + Smart Diagnosis SaaS

**Input**: `plan.md`, `spec.md`, `constitution.md`  
**Track**: Final Hackathon (Advanced MERN)

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included
- Each task independently verifiable

---

## Phase 0: Foundation (Blocking – all phases depend on this)

**Goal**: Working auth, DB connection, role-based routing, empty dashboards for all 4 roles.

**Verification**: All 4 roles can log in → see role-specific empty dashboard. Unauthorized access returns 401/403.

### Infrastructure

- [ ] T001 [P] Create `lib/constants.ts` – export `ROLES` enum (admin, doctor, receptionist, patient), `REVENUE_PER_APPOINTMENT = 500`, `FREE_PLAN_PATIENT_LIMIT = 25`, `APPOINTMENT_STATUSES` (pending, confirmed, completed), `SUBSCRIPTION_PLANS` (free, pro)
  - **Verify**: Import in any file → values accessible, no magic numbers
  - **Spec**: Constitution III (deterministic), SaaS Free Plan, Revenue Simulation

- [ ] T002 [P] Create `lib/types.ts` – export interfaces: `ApiResponse<T>` (`{ success, data?, message? }`), `UserRole`, `SubscriptionPlan`, `AppointmentStatus`, `JwtPayload` (`{ userId, email, role }`)
  - **Verify**: TypeScript compiles with no `any` types
  - **Spec**: Constitution V (fail explicitly), Database Structure

- [ ] T003 [P] Create `lib/db/mongodb.ts` – MongoDB connection singleton using `MONGODB_URI` env var, connection caching for serverless
  - **Verify**: `await connectDB()` succeeds with valid URI, throws with invalid URI
  - **Spec**: Tech Stack: MongoDB

- [ ] T004 Create `lib/db/models/User.ts` – Mongoose schema: name (string, required), email (string, required, unique), password (string, required), role (enum: admin/doctor/receptionist/patient), subscriptionPlan (enum: free/pro, default: free)
  - **Verify**: Create user → saved to DB; duplicate email → error; missing required field → validation error
  - **Spec**: Database Structure: Users

- [ ] T005 [P] Create `lib/db/models/Patient.ts` – Mongoose schema: name (string, required), age (number, required), gender (string, required), contact (string, required), createdBy (ObjectId ref User), isRiskFlagged (boolean, default: false), timestamps
  - **Verify**: Create patient → saved; missing field → validation error
  - **Spec**: Database Structure: Patients

- [ ] T006 [P] Create `lib/db/models/Appointment.ts` – Mongoose schema: patientId (ObjectId ref Patient, required), doctorId (ObjectId ref User, required), date (Date, required), timeSlot (string, required), status (enum: pending/confirmed/completed, default: pending), timestamps
  - **Verify**: Create appointment → saved; invalid status → error
  - **Spec**: Database Structure: Appointments

- [ ] T007 [P] Create `lib/db/models/Prescription.ts` – Mongoose schema: patientId (ObjectId ref Patient, required), doctorId (ObjectId ref User, required), medicines (array of { name, dosage, frequency, duration }), instructions (string), createdAt (Date, default: now)
  - **Verify**: Create prescription with multiple medicines → all saved correctly
  - **Spec**: Database Structure: Prescriptions

- [ ] T008 [P] Create `lib/db/models/DiagnosisLog.ts` – Mongoose schema: patientId (ObjectId ref Patient), doctorId (ObjectId ref User), symptoms (string, required), aiResponse (object), riskLevel (string: Low/Medium/High), createdAt (Date, default: now)
  - **Verify**: Create log with and without aiResponse → both save correctly
  - **Spec**: Database Structure: DiagnosisLogs

### Auth

- [ ] T009 Create `lib/auth/jwt.ts` – export `signToken(payload: JwtPayload): string` and `verifyToken(token: string): JwtPayload | null` using `JWT_SECRET` env var. Token expires in 24h.
  - **Verify**: Sign token → verify returns same payload; expired/invalid token → returns null
  - **Spec**: JWT Authentication, Implicit: Session management (24h expiry)

- [ ] T010 Create `lib/auth/middleware.ts` – export `withAuth(handler, allowedRoles[])` that extracts JWT from Authorization header, verifies, checks role against allowedRoles. Returns 401 if no/invalid token, 403 if wrong role. Attaches user to request.
  - **Verify**: Valid admin token + admin allowed → passes; valid patient token + admin-only route → 403; no token → 401
  - **Spec**: RBAC, Constitution VI (role boundaries), Implicit: Role middleware

- [ ] T011 Create `app/api/auth/login/route.ts` – POST: accept email + password, find user, compare bcrypt hash, return JWT + user role. Validate inputs server-side. Return `{ success, data: { token, user: { name, email, role } }, message }`.
  - **Verify**: Correct credentials → 200 + token; wrong password → 401 + message; missing fields → 400
  - **Spec**: Secure login, Auth & Authorization

- [ ] T012 Create `app/api/auth/register/route.ts` – POST: accept name, email, password, role forced to "patient". Hash password with bcrypt. Return `{ success, data: { token, user } }`. Reject if email exists.
  - **Verify**: New patient → 201 + token; duplicate email → 409; password stored as hash (not plaintext)
  - **Spec**: Patient self-register, Implicit: Password hashing

### Seed Script

- [ ] T013 Create `scripts/seed.ts` – Insert 1 admin (admin@clinic.com), 2 doctors (doctor1@clinic.com, doctor2@clinic.com), 1 receptionist (reception@clinic.com) with bcrypt-hashed passwords. Idempotent (skip if exists). Run via `npx tsx scripts/seed.ts`.
  - **Verify**: Run once → users created; run again → no duplicates; all can log in via API
  - **Spec**: Implicit: demo-able roles, Submission: live demo

### Frontend Shell

- [ ] T014 Create `components/ui/Button.tsx` – Reusable button with variants: primary, secondary, danger. Props: children, onClick, disabled, loading, variant, type.
  - **Verify**: Renders in all 3 variants; disabled state prevents click; loading shows spinner
  - **Spec**: UI: Loading states

- [ ] T015 [P] Create `components/ui/Input.tsx` – Reusable input with label, error message display, types: text, email, password, number. Props: label, error, type, name, required, value, onChange.
  - **Verify**: Renders with label; shows error text in red when error prop set
  - **Spec**: UI: Form validation

- [ ] T016 [P] Create `components/ui/Card.tsx` – Container component with optional title, padding, shadow.
  - **Verify**: Renders children with consistent styling
  - **Spec**: UI: Clean medical theme

- [ ] T017 Create `components/layout/Sidebar.tsx` – Sidebar navigation showing menu items based on user role. Admin: Dashboard, Doctors, Receptionists, Subscriptions. Doctor: Dashboard, Appointments, AI Checker. Receptionist: Dashboard, Patients, Appointments. Patient: Profile, Appointments, Prescriptions, Book Appointment. Active link highlighted.
  - **Verify**: Render with role="admin" → shows admin items only; role="patient" → patient items only
  - **Spec**: UI: Sidebar navigation, User Roles

- [ ] T018 Create `components/layout/DashboardShell.tsx` – Layout wrapper with Sidebar + main content area. Accepts children. Shows user name + role in header. Logout button that clears token.
  - **Verify**: Renders sidebar on left, content in main area; logout clears token from storage
  - **Spec**: UI: Sidebar navigation, Role-based dashboard

- [ ] T019 Create `app/(auth)/login/page.tsx` – Login form: email input, password input, submit button with loading state. On success: store JWT, redirect to role-based dashboard. On error: show error message below form.
  - **Verify**: Valid login → redirects to /admin or /doctor or /receptionist or /patient based on role; invalid → shows error; empty fields → validation message
  - **Spec**: Secure login, UI: Form validation, UI: Error messages

- [ ] T020 Create `app/(auth)/register/page.tsx` – Registration form: name, email, password, confirm password. On success: store JWT, redirect to /patient dashboard. Link to login page.
  - **Verify**: Valid registration → creates patient account → redirects; password mismatch → error; duplicate email → error
  - **Spec**: Patient self-register

- [ ] T021 Create `app/(dashboard)/admin/page.tsx` – Empty admin dashboard shell with DashboardShell wrapper. Shows "Admin Dashboard" heading. Protected: redirects to login if no valid admin token.
  - **Verify**: Admin token → renders page; no token → redirects to login; patient token → access denied
  - **Spec**: Role-based dashboard, Protected routes

- [ ] T022 [P] Create `app/(dashboard)/doctor/page.tsx` – Empty doctor dashboard shell with DashboardShell wrapper. Shows "Doctor Dashboard" heading. Protected: doctor role only.
  - **Verify**: Doctor token → renders; other roles → denied
  - **Spec**: Role-based dashboard

- [ ] T023 [P] Create `app/(dashboard)/receptionist/page.tsx` – Empty receptionist dashboard shell. Shows "Receptionist Dashboard" heading. Protected: receptionist role only.
  - **Verify**: Receptionist token → renders; other roles → denied
  - **Spec**: Role-based dashboard

- [ ] T024 [P] Create `app/(dashboard)/patient/page.tsx` – Empty patient dashboard/profile shell. Shows "My Profile" heading with patient info. Protected: patient role only.
  - **Verify**: Patient token → renders; other roles → denied
  - **Spec**: Patient: View profile

- [ ] T025 Update `app/page.tsx` – Landing page that redirects authenticated users to their role-based dashboard, or shows login/register links for unauthenticated users.
  - **Verify**: No token → shows login/register links; admin token → redirects to /admin
  - **Spec**: Protected routes

- [ ] T026 Update `app/globals.css` – Define medical theme CSS variables: primary (blue #2563EB), background (#F8FAFC), text (#1E293B), success (#10B981), danger (#EF4444), warning (#F59E0B). Apply to html/body.
  - **Verify**: Page renders with blue primary, light background; no default Next.js black theme
  - **Spec**: UI: Clean medical theme

**Checkpoint 0**: Login with admin/doctor/receptionist → see role dashboard. Register as patient → see patient dashboard. Wrong role → 403. No token → redirect to login.

---

## Phase 1: Patient & Appointment Management

**Goal**: Full CRUD for patients and appointments. Receptionist workflow. Patient self-booking.

**Verification**: Receptionist creates patient + books appointment. Patient self-books. Doctor sees schedule. Status flows pending → confirmed → completed. Free Plan blocks at 25 patients.

### Patient CRUD

- [ ] T027 Create `app/api/patients/route.ts` – GET (list patients, query: ?search=name): roles [admin, doctor, receptionist]. POST (create patient: name, age, gender, contact): roles [receptionist]. Server-side validation on all fields. Consistent `ApiResponse` format.
  - **Verify**: POST with valid data → 201 + patient; missing name → 400; unauthorized role → 403; GET returns list
  - **Spec**: Patient Management: Add patient; Receptionist: Register patient

- [ ] T028 Create `app/api/patients/[id]/route.ts` – GET (single patient by ID): roles [admin, doctor, receptionist]. PUT (update patient): roles [receptionist]. Return 404 if not found.
  - **Verify**: GET valid ID → patient data; invalid ID → 404; PUT updates fields; unauthorized → 403
  - **Spec**: Patient Management: Edit patient, View patient profile

- [ ] T029 Add patient limit check to POST in `app/api/patients/route.ts` – Before creating patient, count existing patients. If user's subscriptionPlan is "free" AND count >= 25, return `{ success: false, message: "Patient limit reached. Upgrade to Pro." }` with 403.
  - **Verify**: Free plan + 25 patients → blocked; Free plan + 24 → allowed; Pro plan + 100 → allowed
  - **Spec**: SaaS Free Plan: max 25, SaaS AC

- [ ] T030 Create `components/forms/PatientForm.tsx` – Form with fields: name (text, required), age (number, required), gender (dropdown: Male/Female/Other, required), contact (text, required). Submit handler via props. Client-side validation: all required, age > 0.
  - **Verify**: All fields filled → submit enabled; empty name → shows error; age = -1 → shows error
  - **Spec**: Receptionist: Register patient AC, UI: Form validation

- [ ] T031 Create `app/(dashboard)/receptionist/patients/page.tsx` – Patient list table with columns: Name, Age, Gender, Contact. Search input filters by name. "Add Patient" button links to new patient form.
  - **Verify**: Shows patients from API; search "Ahmed" → filters list; empty state message when no patients
  - **Spec**: Patient Management, Receptionist: Register new patients

- [ ] T032 Create `app/(dashboard)/receptionist/patients/new/page.tsx` – Page with PatientForm. On submit: POST to /api/patients. On success: redirect to patient list with success message. On 403 (limit): show "Patient limit reached. Upgrade to Pro." message.
  - **Verify**: Submit valid → creates patient → redirects; limit reached → shows upgrade message
  - **Spec**: Receptionist: Register patient, SaaS AC

- [ ] T033 Create `app/(dashboard)/doctor/patients/[id]/page.tsx` – Patient profile page: name, age, gender, contact, risk badge (if flagged). Tabs/sections for: Info, Timeline (placeholder), Prescriptions (placeholder).
  - **Verify**: Shows patient info; 404 for invalid ID; doctor role only
  - **Spec**: Doctor: Access patient history, View patient profile

### Appointment CRUD

- [ ] T034 Create `app/api/appointments/route.ts` – GET (list: ?doctorId, ?patientId, ?date, ?status): roles [admin, doctor, receptionist, patient – patient sees only own]. POST (book: patientId, doctorId, date, timeSlot): roles [receptionist, patient]. Validate: no double-booking same doctor+date+timeSlot.
  - **Verify**: POST valid → 201; double-book same slot → 409; patient GET → only own; doctor GET → only assigned
  - **Spec**: Appointment Management: Book appointment, Patient self-booking

- [ ] T035 Create `app/api/appointments/[id]/route.ts` – PUT (update status: pending→confirmed→completed): roles [doctor, receptionist]. DELETE (cancel): roles [receptionist, patient – own only]. Return 404 if not found.
  - **Verify**: PUT status confirmed → updated; skip to completed from pending → allowed; DELETE by patient → own only; wrong role → 403
  - **Spec**: Appointment Management: Cancel, Update status

- [ ] T036 Create `app/api/appointments/schedule/route.ts` – GET (?doctorId, ?date): returns all time slots for a doctor on a date, each marked as "available" or "booked" (with patient name if booked). Time slots: 09:00–17:00 in 30-min intervals.
  - **Verify**: Doctor with 2 bookings at 09:00, 10:30 → those slots show "booked", rest show "available"
  - **Spec**: Doctor Schedule (clarified): Time slots with availability

- [ ] T037 Create `components/forms/AppointmentForm.tsx` – Form: select doctor (dropdown from API), select date (date picker), select time slot (dropdown, only available slots shown). Submit handler via props.
  - **Verify**: Select doctor → loads available dates; select date → shows only open slots; no empty slot selection allowed
  - **Spec**: Book appointment AC, Appointment Management

- [ ] T038 Create `app/(dashboard)/receptionist/appointments/page.tsx` – Appointment list for today (default) with date filter. Columns: Patient, Doctor, Time, Status. Status dropdown to update (pending/confirmed/completed). "Book Appointment" button opens form.
  - **Verify**: Shows appointments; status change → API call → UI update; date filter works
  - **Spec**: Receptionist: Book appointments, Manage daily schedule

- [ ] T039 Create `app/(dashboard)/doctor/appointments/page.tsx` – Doctor's schedule view: calendar-like day view showing time slots 09:00–17:00. Each slot shows patient name or "Available". Date picker to change day. Click booked slot → go to patient profile.
  - **Verify**: Shows today's slots; booked slots show patient name; available slots show "Available"; date change reloads
  - **Spec**: Doctor Schedule (clarified), Doctor: View appointments

- [ ] T040 Create `app/(dashboard)/patient/book/page.tsx` – Patient self-booking: select doctor, select date, select available time slot, confirm. On success: show confirmation with appointment details.
  - **Verify**: Patient selects doctor + date + slot → books → appointment appears in their list
  - **Spec**: Patient self-booking (clarified), Patient: Book appointments

- [ ] T041 Create `app/(dashboard)/patient/appointments/page.tsx` – Patient's appointment list: Date, Doctor, Status. Cancel button (only for pending appointments).
  - **Verify**: Shows patient's appointments only; cancel pending → removed; no cancel for confirmed/completed
  - **Spec**: Patient: View appointment history, Appointment Management: Cancel

**Checkpoint 1**: Receptionist creates patient → books appointment → doctor sees it in schedule. Patient self-books → sees in list → cancels pending. Status: pending → confirmed → completed. Free Plan blocks at patient 26.

---

## Phase 2: Prescriptions & Medical History

**Goal**: Doctor writes multi-medicine prescriptions. Patient views + downloads professional PDF. Medical timeline works.

**Verification**: Doctor creates prescription with 3 medicines → patient sees it → downloads PDF with clinic name, logo, doctor, patient, medicines, date. Timeline shows all event types with expand/collapse and filtering.

### Prescription API & Form

- [ ] T042 Create `app/api/prescriptions/route.ts` – GET (?patientId, ?doctorId): roles [doctor – own, patient – own, admin]. POST (create: patientId, doctorId, medicines[], instructions): roles [doctor]. Validate: at least 1 medicine, each medicine has name + dosage.
  - **Verify**: POST with 3 medicines → 201 + saved; empty medicines → 400; patient GET → only own prescriptions
  - **Spec**: Prescription System, Database Structure: Prescriptions

- [ ] T043 Create `app/api/prescriptions/[id]/route.ts` – GET (single prescription with patient + doctor populated): roles [doctor, patient – own only, admin].
  - **Verify**: GET valid ID → full prescription with doctor name + patient name; unauthorized → 403
  - **Spec**: View prescriptions

- [ ] T044 Create `components/forms/PrescriptionForm.tsx` – Dynamic form: "Add Medicine" button adds row with fields: medicine name (text), dosage (text), frequency (dropdown: Once/Twice/Thrice daily), duration (text, e.g., "7 days"). Remove row button. Instructions textarea. Minimum 1 medicine required.
  - **Verify**: Add 3 medicines → all render; remove 1 → 2 remain; submit with 0 medicines → validation error
  - **Spec**: Prescription System: Add medicines, dosage, notes; AC: multiple medicines per prescription

- [ ] T045 Create `app/(dashboard)/doctor/prescriptions/new/page.tsx` – Page: select patient (dropdown or from context), PrescriptionForm. On submit: POST to API. On success: show success message + option to view.
  - **Verify**: Doctor selects patient, adds medicines, submits → prescription created; shows in patient's list
  - **Spec**: Doctor: Write prescriptions

### PDF Generation

- [ ] T046 Install `jspdf` package. Create `lib/pdf/prescription.ts` – export `generatePrescriptionPDF(prescription)` function. PDF layout: (1) Clinic name "Smart Clinic" centered at top, (2) logo placeholder rectangle, (3) Doctor: name + specialization, (4) Patient: name, age, gender, (5) Table: Medicine | Dosage | Frequency | Duration, (6) Instructions section, (7) Date + time, (8) "Doctor's Signature: ___________" line at bottom.
  - **Verify**: Call with sample data → generates valid PDF blob; PDF contains all 8 sections; text is readable
  - **Spec**: Prescription PDF (clarified): Full professional format, all listed elements

- [ ] T047 Create `app/(dashboard)/patient/prescriptions/page.tsx` – List of patient's prescriptions. Columns: Date, Doctor, Medicines (count). "View" button → prescription detail. "Download PDF" button → triggers PDF generation + browser download.
  - **Verify**: Shows prescription list; click Download → browser downloads .pdf file; PDF opens with correct content
  - **Spec**: Patient: View prescriptions, Download prescription PDF

- [ ] T048 Create prescription detail view (within patient prescriptions page or modal) – Shows: doctor name, date, full medicines table, instructions, AI explanation placeholder (empty for now).
  - **Verify**: Click "View" on prescription → sees all details; medicines table shows all entries
  - **Spec**: Patient: View prescriptions

### Diagnosis Log API

- [ ] T049 Create `app/api/diagnosis/route.ts` – GET (?patientId): roles [doctor, admin]. POST (create: patientId, doctorId, symptoms, aiResponse?, riskLevel?): roles [doctor]. Stores diagnosis log entry.
  - **Verify**: POST with symptoms → 201; GET by patientId → returns history; saves aiResponse when provided, null when not
  - **Spec**: DiagnosisLogs model, Doctor: Add diagnosis

### Medical History Timeline

- [ ] T050 Create `components/timeline/MedicalTimeline.tsx` – Visual vertical timeline component. Accepts array of events: `{ type: 'appointment'|'diagnosis'|'prescription', date, summary, details }`. Renders chronologically (newest first by default). Each event: icon by type, date, summary line. Click to expand → shows full details.
  - **Verify**: Pass 5 mixed events → renders in date order; click event → expands details; click again → collapses
  - **Spec**: Medical History Timeline (clarified): Visual timeline, clickable, expand details

- [ ] T051 Add type filter to `MedicalTimeline.tsx` – Toggle buttons: "All", "Appointments", "Diagnoses", "Prescriptions". Filters visible events by type. Default: All.
  - **Verify**: Click "Appointments" → only appointment events shown; click "All" → all visible
  - **Spec**: Medical History Timeline AC: Filter by event type

- [ ] T052 Create timeline data fetcher in `app/(dashboard)/doctor/patients/[id]/page.tsx` – Fetch patient's appointments, diagnoses, prescriptions. Merge into single timeline array sorted by date. Pass to MedicalTimeline component.
  - **Verify**: Patient with 2 appointments + 1 prescription + 1 diagnosis → timeline shows 4 events in order
  - **Spec**: Doctor: Access patient history, Medical History Timeline

- [ ] T053 Add timeline to patient profile `app/(dashboard)/patient/page.tsx` – Patient can see own medical history timeline with same expand/filter functionality.
  - **Verify**: Patient sees own events; cannot see other patients' data
  - **Spec**: Patient: View appointment history, View prescriptions

**Checkpoint 2**: Doctor creates prescription with 3 medicines → patient downloads PDF with all professional elements. Doctor views patient → sees timeline with appointments + diagnoses + prescriptions. Filter and expand/collapse work.

---

## Phase 3: AI Integration

**Goal**: All 4 AI features functional with graceful fallback. Free Plan users blocked from AI. System works without AI.

**Verification**: Doctor enters symptoms → gets AI response OR fallback message. Patient sees prescription explanation. Risk-flagged patient shows badge + warning. Free Plan → "Upgrade to Pro" on AI features.

### AI Client & Fallback

- [ ] T054 Install `@google/generative-ai` package. Create `lib/ai/gemini.ts` – export `callGemini(prompt: string): Promise<string | null>`. Uses `GEMINI_API_KEY` env var. 10-second timeout. On any error (network, timeout, API limit) → return null (never throw).
  - **Verify**: Valid key + prompt → returns string; invalid key → returns null; no key → returns null; simulated timeout → returns null
  - **Spec**: AI Integration: Gemini, AI Fallback (clarified)

- [ ] T055 Create SaaS AI gate in `lib/auth/middleware.ts` – export `withProPlan(handler)` middleware. Checks user's subscriptionPlan. If "free" → return `{ success: false, message: "Upgrade to Pro to access AI features." }` with 403.
  - **Verify**: Pro user → passes through; Free user → 403 with upgrade message
  - **Spec**: SaaS: No AI on Free Plan, SaaS AC

### AI Feature 1: Smart Symptom Checker

- [ ] T056 Create `app/api/ai/symptom-check/route.ts` – POST: accept symptoms (text), age (number), gender (string), history (text). Protected: doctor + Pro plan. Build prompt for Gemini: "Given symptoms: {symptoms}, patient age: {age}, gender: {gender}, medical history: {history}. Return JSON: { conditions: [{ name, probability }], riskLevel: 'Low'|'Medium'|'High', suggestedTests: [string] }". Parse AI response. If AI fails → return `{ success: false, message: "AI temporarily unavailable" }` with 200 (not error, fallback). Save to DiagnosisLog either way.
  - **Verify**: Valid request + AI works → returns conditions + risk + tests; AI fails → returns fallback message; Free plan → 403; saves DiagnosisLog
  - **Spec**: AI Feature 1 AC, AI Fallback, DiagnosisLogs

- [ ] T057 Create `components/ai/SymptomCheckerForm.tsx` – Form: symptoms (textarea), age (number input), gender (dropdown: Male/Female/Other), history (textarea). Submit button with loading state.
  - **Verify**: All fields fill → submit enabled; submitting → shows loading spinner; empty symptoms → validation error
  - **Spec**: AI Feature 1 AC: Form captures symptoms, age, gender, history

- [ ] T058 Create `app/(dashboard)/doctor/ai-checker/page.tsx` – Page with SymptomCheckerForm. On submit → call API. On success: show result card with (1) Possible Conditions list, (2) Risk Level badge (colored: green/yellow/red), (3) Suggested Tests list. On fallback: show "AI temporarily unavailable" message with option to proceed manually (link to diagnosis form).
  - **Verify**: Submit → loading → result card appears; AI fail → fallback message shown; doctor can still work
  - **Spec**: AI Feature 1, AI Fallback (clarified), AI Feature 1 AC: response within 10s or timeout

### AI Feature 2: Prescription Explanation

- [ ] T059 Create `app/api/ai/prescription-explain/route.ts` – POST: accept prescriptionId. Protected: patient + Pro plan. Fetch prescription, build prompt: "Explain this prescription in simple non-medical terms for a patient: medicines: {list}, instructions: {text}. Include: (1) simple explanation, (2) lifestyle recommendations, (3) preventive advice." Return explanation text. Fallback if AI fails.
  - **Verify**: Valid prescription → explanation in simple language; AI fails → fallback; Free plan → 403
  - **Spec**: AI Feature 2, AI Feature 2 AC

- [ ] T060 Create `components/ai/PrescriptionExplanation.tsx` – Component: accepts prescriptionId. "Get Explanation" button. On click → call API → show explanation text. Loading state. Fallback message if unavailable.
  - **Verify**: Click → loading → explanation appears; AI fail → shows message; Free plan → shows "Upgrade to Pro"
  - **Spec**: AI Feature 2 AC: Patient views explanation on prescription detail page

- [ ] T061 Integrate PrescriptionExplanation into prescription detail view (T048). Show below medicines table. Only visible/enabled for Pro plan patients. Free plan shows "Upgrade to Pro" badge.
  - **Verify**: Pro patient → sees "Get Explanation" button; Free patient → sees upgrade prompt; explanation renders below prescription
  - **Spec**: AI Feature 2, SaaS AC: AI hidden/disabled for Free Plan

### AI Feature 3: Risk Flagging

- [ ] T062 Create `app/api/ai/risk-flag/route.ts` – POST: accept patientId. Protected: doctor + admin. Query DiagnosisLogs for patient in last 30 days. If 3+ entries with similar symptoms (use basic string matching on symptoms field), flag patient: set `isRiskFlagged = true` on Patient model. Return flag status + reason.
  - **Verify**: Patient with 3 similar diagnoses in 30 days → flagged; patient with 2 → not flagged; patient with 3 in 60 days → not flagged
  - **Spec**: AI Feature 3 AC: 3+ similar diagnoses in 30 days triggers flag

- [ ] T063 Create `components/ai/RiskBadge.tsx` – Component: accepts `isRiskFlagged` boolean. If true: red badge "High Risk" + warning icon. If false: renders nothing.
  - **Verify**: isRiskFlagged=true → red badge visible; false → nothing rendered
  - **Spec**: AI Feature 3: Visual badge on patient profile

- [ ] T064 Add risk warning banner to doctor patient view `app/(dashboard)/doctor/patients/[id]/page.tsx` – If patient.isRiskFlagged, show prominent yellow/red banner at top: "⚠ This patient has been flagged as high-risk due to repeated similar diagnoses."
  - **Verify**: Flagged patient → banner shows at top; unflagged patient → no banner
  - **Spec**: AI Feature 3 AC: Doctor sees warning banner

- [ ] T065 Add RiskBadge to patient list views (receptionist + doctor) – Show red badge next to name in patient tables.
  - **Verify**: Flagged patient row shows badge; unflagged rows show nothing
  - **Spec**: AI Feature 3: Visual badge on patient profile

### Free Plan AI Gate UI

- [ ] T066 Create `components/ui/UpgradePrompt.tsx` – Component: card with message "This feature requires Pro Plan. Contact your administrator to upgrade." Styled as info card.
  - **Verify**: Renders with clear upgrade message
  - **Spec**: SaaS AC: "Upgrade to Pro" prompt

- [ ] T067 Add UpgradePrompt to AI Checker page – If user's plan is "free", show UpgradePrompt instead of SymptomCheckerForm.
  - **Verify**: Free plan doctor → sees upgrade prompt; Pro plan doctor → sees form
  - **Spec**: SaaS AC: AI buttons hidden/disabled for Free Plan

**Checkpoint 3**: Doctor (Pro) → symptom checker works (or shows fallback). Patient (Pro) → sees prescription explanation. Flagged patient → badge on profile + banner for doctor. Free plan → upgrade prompts on all AI features. System fully functional without AI (all fallbacks work).

---

## Phase 4: Analytics & Admin Management

**Goal**: Admin dashboard with all spec metrics. Doctor dashboard with personal stats. Subscription management. User management.

**Verification**: Admin sees total patients/doctors/appointments/revenue/top diagnoses/flagged patients. Doctor sees daily appointments + monthly chart + prescription count. Admin toggles subscription plan.

### Analytics APIs

- [ ] T068 Create `app/api/analytics/admin/route.ts` – GET: protected admin only. Return: totalPatients (count), totalDoctors (count), monthlyAppointments (count this month), revenue (completed appointments this month × 500), topDiagnoses (top 5 by frequency this month from DiagnosisLogs), flaggedPatients (list with isRiskFlagged=true: name, age, flagReason).
  - **Verify**: With seed data → returns all metrics with correct counts; revenue matches formula; empty DB → all zeros
  - **Spec**: Admin Dashboard, Admin Dashboard AC

- [ ] T069 Create `app/api/analytics/doctor/route.ts` – GET (?startDate, ?endDate): protected doctor only. Return: todayAppointments (list: patient name, time, status), monthlyAppointmentCount, monthlyPrescriptionCount, appointmentsByDay (last 30 days for chart data).
  - **Verify**: Doctor with 5 appointments today → returns 5 in list; date range filter works; another doctor's data not included
  - **Spec**: Doctor Dashboard, Doctor Dashboard AC

### Admin Dashboard UI

- [ ] T070 Install `recharts` package. Update `app/(dashboard)/admin/page.tsx` – Fetch admin analytics. Display: (1) Stat cards: Total Patients, Total Doctors, Monthly Appointments, Revenue (formatted: Rs X,XXX). (2) Bar chart: top 5 diagnoses (Recharts BarChart). (3) Table: high-risk flagged patients (name, age, risk reason).
  - **Verify**: Cards show real numbers; chart renders with bars; table shows flagged patients; loading skeleton while fetching
  - **Spec**: Admin Dashboard AC: cards, revenue, chart, flagged table

- [ ] T071 Create `components/charts/RevenueCard.tsx` – Card showing "Revenue" title + formatted amount (Rs {completedAppointments × 500}). Green background accent.
  - **Verify**: Pass count=10 → displays "Rs 5,000"; count=0 → displays "Rs 0"
  - **Spec**: Revenue (clarified), Admin Dashboard: Revenue

- [ ] T072 Create `components/charts/DiagnosisChart.tsx` – Recharts BarChart or PieChart. Accepts array of `{ diagnosis, count }`. Shows top 5. Labeled axes.
  - **Verify**: Pass 5 diagnoses → renders 5 bars/slices; pass 0 → shows "No data" message
  - **Spec**: Admin Dashboard: Most common diagnosis, AI Feature 4: top 5 diagnoses

- [ ] T073 Create `components/charts/AppointmentChart.tsx` – Recharts LineChart. Accepts array of `{ date, count }`. Shows appointment trend over time. Used in admin + doctor dashboards.
  - **Verify**: Pass 30 days of data → renders line chart; hover shows tooltip with date + count
  - **Spec**: AI Feature 4: appointment count trend

### Doctor Dashboard UI

- [ ] T074 Update `app/(dashboard)/doctor/page.tsx` – Fetch doctor analytics. Display: (1) Today's appointments list (patient name, time, status). (2) Monthly stats: appointment count + prescription count as stat cards. (3) AppointmentChart for last 30 days. (4) Date range picker to filter stats.
  - **Verify**: Shows today's list; monthly numbers correct; chart renders; date range change updates data
  - **Spec**: Doctor Dashboard AC: today's list, monthly chart, filter by date range

### Admin: Subscription Management

- [ ] T075 Create `app/api/subscriptions/route.ts` – GET: list all users with subscriptionPlan. PUT: update user's subscriptionPlan (accept userId, plan: free|pro). Protected: admin only. Change takes effect immediately.
  - **Verify**: GET → list with plans; PUT userId + "pro" → user plan updated; PUT non-admin → 403
  - **Spec**: Admin: Manage subscription plans, Subscription Management (clarified)

- [ ] T076 Create `app/(dashboard)/admin/subscriptions/page.tsx` – Table: User Name, Email, Role, Current Plan. Toggle button per row: Free ↔ Pro. Click → calls PUT API → immediate UI update. Confirmation dialog before changing.
  - **Verify**: Shows users with plans; click toggle → plan changes → badge updates; confirmation dialog appears
  - **Spec**: Admin: Manage subscription, SaaS AC: Admin can change plans

### Admin: User Management (Doctors & Receptionists)

- [ ] T077 Create `app/api/users/route.ts` – GET (?role): list users filtered by role. POST: create new user (name, email, password, role – admin can create doctor/receptionist). DELETE (?id): remove user. Protected: admin only.
  - **Verify**: GET ?role=doctor → only doctors; POST new doctor → created with doctor role; non-admin → 403
  - **Spec**: Admin: Manage doctors, Manage receptionists

- [ ] T078 Create `app/(dashboard)/admin/doctors/page.tsx` – Doctor list table: Name, Email, Status. "Add Doctor" button → form (name, email, password). Delete button per row.
  - **Verify**: Shows doctors; add new → appears in list; delete → removed; admin role only
  - **Spec**: Admin: Manage doctors

- [ ] T079 Create `app/(dashboard)/admin/receptionists/page.tsx` – Same as T078 but for receptionists.
  - **Verify**: Shows receptionists; CRUD works; admin role only
  - **Spec**: Admin: Manage receptionists

### AI Feature 4: Predictive Analytics

- [ ] T080 Add to `app/api/analytics/admin/route.ts` – Extend response with: appointmentTrend (last 7 and 30 days counts), doctorPerformance (list: doctor name, appointments completed, avg per day this month).
  - **Verify**: Returns trend data for 7/30 days; doctor stats are per-doctor; math is correct
  - **Spec**: AI Feature 4 AC: trend, doctor stats

- [ ] T081 Add predictive analytics section to admin dashboard – Below existing analytics: (1) AppointmentChart showing 7-day and 30-day trends (toggle). (2) Doctor performance table: Name, Completed, Avg/Day.
  - **Verify**: Chart toggles between 7/30 day views; doctor table shows correct averages
  - **Spec**: AI Feature 4: patient load forecast, doctor performance trends

**Checkpoint 4**: Admin dashboard shows all metrics with charts. Doctor dashboard shows personal stats with date filter. Admin can toggle Free↔Pro for any user. Admin can add/remove doctors and receptionists. Predictive analytics charts render.

---

## Phase 5: Polish, Deploy, Submit

**Goal**: Production-ready. All UI requirements met. Deployed. README. Demo video.

**Verification**: Live URL works for all 4 roles. Responsive on mobile. Loading states on all async ops. PDF downloads. AI fallback works. Clean README with setup instructions.

### UI Polish

- [ ] T082 Audit all pages for loading states – Add skeleton/spinner to: patient list, appointment list, prescription list, analytics dashboard, timeline, AI responses. Use consistent loading component.
  - **Verify**: Slow network → every data-loading page shows skeleton before content
  - **Spec**: UI: Loading states, Implicit: loading spinner/skeleton

- [ ] T083 Audit all forms for validation messages – Ensure: login, register, patient form, appointment form, prescription form, symptom checker all show field-level error messages. Red text below invalid field.
  - **Verify**: Submit empty form → each required field shows red error text; fix field → error disappears
  - **Spec**: UI: Form validation, Implicit: client-side + server-side validation

- [ ] T084 Audit all API calls for error display – Ensure: network errors show "Something went wrong. Please try again." toast/message. 401 → redirect to login. 403 → "Access denied" message. 404 → "Not found" message.
  - **Verify**: Simulate 500 → user sees error message; 401 → redirected to login; 403 → access denied
  - **Spec**: UI: Proper error messages, Constitution V

- [ ] T085 Responsive audit – Test all pages at 320px (mobile), 768px (tablet), 1024px+ (desktop). Sidebar collapses to hamburger on mobile. Tables scroll horizontally on small screens. Forms stack vertically.
  - **Verify**: All pages usable at 320px; no horizontal overflow; sidebar toggleable on mobile
  - **Spec**: UI: Responsive layout, Implicit: min 320px width

- [ ] T086 Apply medical theme polish – Consistent spacing, card shadows, button hover states, header with clinic name. Ensure blue/white palette throughout. Add logo placeholder to header and PDF.
  - **Verify**: Visual consistency across all pages; no unstyled sections; professional appearance
  - **Spec**: UI: Clean medical theme

### Deployment

- [ ] T087 Create `.env.example` at project root – Document all required env vars: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`. Include comments explaining each.
  - **Verify**: Copy .env.example → .env → fill values → app runs
  - **Spec**: Constitution: no secrets in repo, Deployment Requirement

- [ ] T088 Update `scripts/seed.ts` – Comprehensive seed: 1 admin, 2 doctors, 1 receptionist, 5 patients, 10 appointments (mixed statuses), 5 prescriptions, 3 diagnosis logs (1 patient flagged). Include clear demo credentials in output.
  - **Verify**: Run seed → all data created; all roles can log in; dashboard shows populated data
  - **Spec**: Submission: live demo testable, demo video content

- [ ] T089 Ensure `.gitignore` includes: node_modules, .next, .env, .env.local. Verify no secrets in repo.
  - **Verify**: `git status` shows no ignored files; .env not tracked
  - **Spec**: Constitution: Git, no secrets

- [ ] T090 Deploy frontend + API to Vercel – Connect GitHub repo, set environment variables in Vercel dashboard, verify build succeeds, test live URL.
  - **Verify**: Live URL loads login page; API routes respond; all env vars configured
  - **Spec**: Deployment Requirement: deployed, live demo

- [ ] T091 Set up MongoDB Atlas – Create production cluster, add connection string to Vercel env vars, run seed script against production DB.
  - **Verify**: Production DB has seed data; live app connects and shows data
  - **Spec**: Deployment Requirement

### Documentation & Submission

- [ ] T092 Create comprehensive README.md – Sections: Project Title, Tech Stack, Features (by role), Setup Instructions (clone, install, env, seed, run), Demo Credentials (table), Deployment, API Endpoints summary, Screenshots placeholder.
  - **Verify**: Follow README steps from scratch → app runs locally; demo credentials work
  - **Spec**: Deployment: Proper README required

- [ ] T093 Final acceptance test on deployed URL – Walk through every spec acceptance criteria on live site: (1) Login all 4 roles, (2) Receptionist creates patient + books appointment, (3) Patient self-registers + self-books, (4) Doctor views schedule + writes prescription + uses AI checker, (5) Patient downloads PDF, (6) Timeline works, (7) Admin analytics show data, (8) Subscription toggle works, (9) Free plan limits work, (10) AI fallback works.
  - **Verify**: All 10 scenarios pass on live URL
  - **Spec**: All acceptance criteria across entire spec

- [ ] T094 Record demo video (3–7 minutes) – Demonstrate: login + role dashboards, patient management, appointment booking, prescription generation (PDF download), medical history timeline, AI features, admin analytics. Upload to YouTube/LinkedIn.
  - **Verify**: Video shows all required demo points from spec; under 7 minutes; link accessible
  - **Spec**: Submission: Demo Video requirements

**Checkpoint 5**: Live URL works. All 4 roles demo-able. PDF downloads. AI features work (or degrade gracefully). README complete. Video recorded. Ready for submission.

---

## Dependencies & Execution Order

```
T001-T003 [P] ──→ T004-T008 [P] ──→ T009-T012 (sequential) ──→ T013
                                                                    │
T014-T016 [P] ──→ T017-T018 ──→ T019-T026 ──────────────────────  │
                                                                    │
                                     Checkpoint 0 ◄────────────────┘
                                          │
              T027-T029 ──→ T030-T033 ──→ T034-T036 ──→ T037-T041
                                                              │
                                     Checkpoint 1 ◄──────────┘
                                          │
              T042-T043 ──→ T044-T045 ──→ T046-T048 ──→ T049 ──→ T050-T053
                                                                       │
                                     Checkpoint 2 ◄──────────────────┘
                                          │
              T054-T055 ──→ T056-T058 ──→ T059-T061 ──→ T062-T067
                                                              │
                                     Checkpoint 3 ◄──────────┘
                                          │
              T068-T069 ──→ T070-T074 ──→ T075-T079 ──→ T080-T081
                                                              │
                                     Checkpoint 4 ◄──────────┘
                                          │
              T082-T086 ──→ T087-T089 ──→ T090-T091 ──→ T092-T094
                                                              │
                                     Checkpoint 5 ◄──────────┘
```

### Parallel Opportunities (Within Phases)

- **Phase 0**: T001-T003, T005-T008, T014-T016, T022-T024 are all parallelizable
- **Phase 1**: T027-T028 (patient API) parallel with T034-T036 (appointment API) after models exist
- **Phase 2**: T042 (prescription API) parallel with T049 (diagnosis API) after Phase 1
- **Phase 4**: T068-T069 (analytics APIs) parallel; T078-T079 (doctor/receptionist pages) parallel
- **Phase 5**: T082-T086 (UI polish tasks) all parallel

---

## Task Count Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 0 | T001–T026 | Foundation (26 tasks) |
| Phase 1 | T027–T041 | Patients & Appointments (15 tasks) |
| Phase 2 | T042–T053 | Prescriptions & Timeline (12 tasks) |
| Phase 3 | T054–T067 | AI Integration (14 tasks) |
| Phase 4 | T068–T081 | Analytics & Admin (14 tasks) |
| Phase 5 | T082–T094 | Polish, Deploy, Submit (13 tasks) |
| **Total** | **94 tasks** | |
