# AI Hackathon Task – MERN Stack Students (Final & Mid)

## Project Title:
AI Clinic Management + Smart Diagnosis SaaS

---

## Clarified Requirements & Acceptance Criteria

> **Target Track:** Final Hackathon (Advanced MERN)  
> All clarifications below apply to the Final Hackathon requirements.

### Resolved Ambiguities

| Area | Original Statement | Clarified Requirement | Acceptance Criteria |
|------|-------------------|----------------------|---------------------|
| **SaaS Free Plan Limit** | "Limited patients" | 25 patients max | System blocks patient creation when clinic reaches 25 patients on Free Plan |
| **Patient Appointment Booking** | "by receptionist or patient" (but Patient role didn't list booking) | Patients CAN self-book appointments | Patient dashboard includes "Book Appointment" feature with doctor/date selection |
| **Risk Flagging Action** | "System detects" (no specified action) | Visual + Notification + Dashboard | (1) Badge on patient profile, (2) Alert shown to doctor when viewing patient, (3) Risk cases appear in analytics dashboard |
| **Revenue Simulation** | "Revenue (simulated)" | Per-appointment basis | Revenue = appointment count × Rs 500 (configurable); displayed in Admin analytics |
| **AI Fallback Behavior** | "Graceful fallback if API fails" | Show error message, allow manual workflow | UI displays "AI temporarily unavailable" message; doctor can proceed without AI suggestions |
| **Subscription Management** | Plans not assigned | Admin assigns plans | Admin can view/change subscription plan for any clinic/user from admin panel |
| **Urdu Explanation Mode** | "Optional" | Stretch goal | Not required for MVP; implement only if time permits |
| **Medical History Timeline** | "Timeline" | Visual timeline component | Interactive timeline with clickable events showing appointments, diagnoses, prescriptions |
| **Prescription PDF** | "Generate PDF" | Full professional format | PDF includes: Clinic name, logo placeholder, doctor details, patient info, medicines with dosage, instructions, date |
| **Doctor Schedule View** | "Doctor schedule view" | Time slots with availability | Calendar-like view showing working hours with available/booked slots |
| **Patient Registration** | Receptionist registers + Patient logs in | Self-registration with own account | Patients create their own accounts; receptionist can also create patient records |

---

## Problem Statement
Small and medium-sized clinics still rely heavily on:

• Paper-based prescriptions  
• Manual patient records  
• No digital appointment tracking  
• No analytics or reporting  
• No AI support for diagnosis  

This leads to:

• Data loss  
• Time waste  
• Inefficient patient handling  
• No performance visibility  

Your mission is to build a modern AI-powered Clinic Management SaaS that digitizes the entire workflow and intelligently assists doctors.

This is not just a hackathon submission.  
This can be your first real startup idea.

---

## Vision
Build a scalable SaaS platform that:

• Digitizes clinic operations  
• Improves efficiency  
• Provides intelligent AI assistance  
• Can realistically be sold to local clinics  

---

## User Roles (Mandatory – 4 Roles)

### Admin
• Manage doctors  
• Manage receptionists  
• View analytics  
• Manage subscription plans (simulation allowed)  
• Monitor system usage  

### Doctor
• View appointments  
• Access patient history  
• Add diagnosis  
• Write prescriptions  
• Use AI assistance  
• View analytics (personal stats)  

### Receptionist
• Register new patients  
• Book appointments  
• Update patient info  
• Manage daily schedule  

### Patient
• Login securely  
• View profile  
• View appointment history  
• View prescriptions  
• Download prescription PDF  
• See AI-generated explanation (if enabled)  
• **Book appointments** (clarified: self-booking enabled)

---

### Testable Acceptance Criteria by Role

| Role | Feature | Acceptance Criteria |
|------|---------|---------------------|
| Admin | Manage subscription | Can toggle clinic between Free/Pro plan; changes reflect immediately |
| Admin | View analytics | Dashboard shows: total patients, doctors, monthly appointments, revenue (appointments×500), common diagnosis |
| Doctor | AI Symptom Checker | Enter symptoms → receive AI response with conditions, risk level, suggested tests |
| Doctor | Schedule view | See today's slots with patient names or "Available" status |
| Receptionist | Register patient | Form with name, age, gender, contact; creates patient record in DB |
| Patient | Self-register | Registration form creates patient account with login credentials |
| Patient | Download PDF | Click download → browser downloads formatted prescription PDF |

---

## 🛠 Tech Stack Requirements

### FINAL HACKATHON – Advanced MERN Track

**Required Tech Stack:**

• MongoDB  
• Express.js  
• React.js  
• Node.js  
• JWT Authentication  
• Role-Based Access Control  
• Chart.js / Recharts (for analytics)  
• Cloudinary / Supabase Storage (for file uploads)  

**AI Integration (Required for full marks):**

• Gemini / OpenAI API (or any other AI Tool which ever is free)  
• Backend AI endpoint handling  
• Graceful fallback if API fails  

---

### MID HACKATHON – Intermediate Level (Batch 16 & 17)

**Required Tech Stack:**

**Option 1:**

• MERN (If you know React)  
• Simple REST APIs if you about NodeJS  
• Basic JWT  

**Option 2:**

• HTML, CSS, JavaScript  
• Firebase Auth / Supabase Auth  
• Firestore / Supabase DB  
• Supabase Storage / Cloudinary  
• Basic CRUD  
• Optional AI  

---

## Core Features (Mandatory for Both Levels)

### Authentication & Authorization
• Secure login  
• Role-based dashboard  
• Protected routes  
• Input validation  

---

## Implicit Requirements (Extracted from Context)

The following requirements are implied by the spec but not explicitly stated:

| Implicit Requirement | Derived From | Acceptance Criteria |
|---------------------|--------------|---------------------|
| Password hashing | "Secure login" | Passwords stored as bcrypt hash, never plaintext |
| Session management | "JWT Authentication" | JWT expires after reasonable time (e.g., 24h); refresh token optional |
| Role middleware | "Role-Based Access Control" | Each API route validates user role before processing |
| Error handling | "Graceful fallback" | All API endpoints return consistent error format with status codes |
| Loading states | UI Requirements | All async operations show loading spinner/skeleton |
| Form validation | UI Requirements | Client-side + server-side validation; clear error messages |
| Mobile responsive | "Responsive layout" | Works on mobile viewport (min 320px width) |
| API rate limiting | "Graceful fallback" (implied) | Consider rate limiting AI endpoints to prevent abuse |

---

### Patient Management
• Add patient  
• Edit patient  
• View patient profile  
• View medical history timeline  

### Appointment Management
• Book appointment (by receptionist or patient)  
• Cancel appointment  
• Update status (pending / confirmed / completed)  
• Doctor schedule view  

**Clarified Requirements:**
- Patients can self-book appointments from their dashboard
- Doctor schedule shows time slots with availability (calendar-like view)

**Acceptance Criteria:**
- [ ] Receptionist can select doctor + date + time slot to book appointment
- [ ] Patient can browse available doctors and select open time slot
- [ ] Appointment status transitions: pending → confirmed → completed
- [ ] Doctor sees daily calendar with booked vs available slots  

### Prescription System
• Add medicines  
• Add dosage  
• Add notes  
• Generate PDF  
• Patient can download prescription  

**Clarified PDF Format (Full Professional):**
- Clinic name and logo placeholder
- Doctor details (name, specialization)
- Patient info (name, age, gender)
- Medicines with dosage and frequency
- Instructions/notes
- Date and time
- Space for signature

**Acceptance Criteria:**
- [ ] Doctor form includes: medicine name, dosage, frequency, duration, notes
- [ ] PDF generates with all above elements
- [ ] PDF download works from patient dashboard
- [ ] Multiple medicines supported per prescription

### Medical History Timeline

Each patient should have:

• Appointment history  
• Diagnosis history  
• Prescription history  
• Timestamp tracking  

**Clarified UI:** Visual timeline component with clickable events

**Acceptance Criteria:**
- [ ] Timeline shows events in chronological order (newest first or oldest first toggle)
- [ ] Each event shows: type (appointment/diagnosis/prescription), date, summary
- [ ] Clicking event expands to show full details
- [ ] Filter by event type available  

---

## AI Features (Advanced Layer)

AI must enhance experience, not block system.  
If AI fails, the system must still function normally.

> **Clarified Fallback Behavior:** When AI API fails, display "AI temporarily unavailable" message and allow doctor to proceed with manual diagnosis entry.

### AI Feature 1 – Smart Symptom Checker

Doctor enters:

• Symptoms  
• Age  
• Gender  
• History  

AI returns:

• Possible conditions  
• Risk level  
• Suggested tests  

**Acceptance Criteria:**
- [ ] Form captures: symptoms (text), age (number), gender (dropdown), history (text)
- [ ] AI response displays within 10 seconds or shows timeout message
- [ ] Response shows at least 1 possible condition with risk level (Low/Medium/High)

### AI Feature 2 – Prescription Explanation

AI generates:

• Simple explanation for patient  
• Lifestyle recommendations  
• Preventive advice  

Optional: Urdu explanation mode (stretch goal - not required for MVP).

**Acceptance Criteria:**
- [ ] Patient can view explanation on prescription detail page
- [ ] Explanation is in simple language (non-medical terms)

### ⚠ AI Feature 3 – Risk Flagging

System detects:

• Repeated infection patterns  
• Chronic symptoms  
• High-risk combinations  

**Clarified Actions:**
1. Visual badge/indicator on patient profile
2. Alert shown to doctor when accessing flagged patient
3. Flagged patients appear in analytics dashboard

**Acceptance Criteria:**
- [ ] Patient with 3+ similar diagnoses in 30 days triggers flag
- [ ] Doctor sees warning banner when opening flagged patient
- [ ] Admin dashboard shows list of high-risk patients

### AI Feature 4 – Predictive Analytics (Final Hackathon Only)

• Most common disease this month  
• Patient load forecast  
• Doctor performance trends  

**Acceptance Criteria:**
- [ ] Dashboard chart shows top 5 diagnoses for current month
- [ ] Shows appointment count trend (last 7/30 days)
- [ ] Doctor stats: appointments completed, avg per day  

---

## Analytics Dashboard (Mandatory for Final)

### Admin Dashboard:
• Total patients  
• Total doctors  
• Monthly appointments  
• Revenue (simulated: appointments × Rs 500 per appointment)  
• Most common diagnosis  
• High-risk flagged patients list (from AI Feature 3)

**Acceptance Criteria:**
- [ ] Cards/widgets show real-time counts
- [ ] Revenue calculated as: completed appointments × 500
- [ ] Chart shows top 5 diagnoses
- [ ] Table lists patients flagged by risk detection

### Doctor Dashboard:
• Daily appointments  
• Monthly stats  
• Prescription count  

**Acceptance Criteria:**
- [ ] Today's appointments list with patient names and times
- [ ] Monthly chart: appointments and prescriptions
- [ ] Filter by date range available  

---

## SaaS Layer (Final Hackathon only)

Simulate subscription plans:

### Free Plan
• Limited patients (max 25)  
• No AI features  

### Pro Plan
• Unlimited patients  
• AI features enabled  
• Advanced analytics  

Feature-based access control required.

> **Clarified:** Admin assigns/changes plans from admin panel. Plan change takes effect immediately.

**Acceptance Criteria:**
- [ ] Free Plan users see "Upgrade to Pro" prompt when accessing AI features
- [ ] Free Plan blocks patient creation at 25 patients with message: "Patient limit reached. Upgrade to Pro."
- [ ] Admin can change any clinic's plan from Free → Pro or Pro → Free
- [ ] AI Feature buttons/menus hidden or disabled for Free Plan users

---

## 🗂 Suggested Database Structure

### Users
• id  
• name  
• email  
• password  
• role  
• subscriptionPlan  

### Patients
• id  
• name  
• age  
• gender  
• contact  
• createdBy  

### Appointments
• id  
• patientId  
• doctorId  
• date  
• status  

### Prescriptions
• id  
• patientId  
• doctorId  
• medicines[]  
• instructions  
• createdAt  

### DiagnosisLogs
• id  
• symptoms  
• aiResponse  
• riskLevel  
• createdAt  

---

## UI Requirements

• Clean medical theme  
• Sidebar navigation  
• Responsive layout  
• Proper error messages  
• Loading states  
• Form validation  

---

## Deployment Requirement (Final Hackathon)

• Must be deployed  
• Live demo required  
• GitHub repository required  
• Proper README required  

Mid-level hackathon deployment optional but encouraged.

---

## Startup Opportunity

This project is highly commercial.

You are encouraged to:

• Approach nearby clinics  
• Offer live demo  
• Customize features  
• Add SMS reminders  
• Add WhatsApp integration  
• Add billing module  
• Convert into real SaaS  

If you launch this as a startup, we would be extremely proud of you.

---

## Submission Requirements (Mandatory)

### 1. Deployed URL (Live App)

• A working deployed link where the project can be tested.  
• Example platforms: Vercel / Netlify (Frontend), Render / Railway / Cyclic / Firebase / Supabase (Backend/DB hosting as applicable)  

### 2. GitHub Repository URL

• Public repo preferred (or provide collaborator access if private).  
• Must include clean commit history (avoid uploading zip as 1 commit).  

### 3. Project Demo Video URL (LinkedIn or YouTube)

• A 3–7 minute demo video showing:  
o Login + role dashboards  
o Patient management  
o Appointment booking  
o Prescription generation (PDF)  
o Medical history timeline  
o AI features (if implemented)  
o Admin analytics (final hackathon)  