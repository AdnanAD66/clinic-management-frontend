# SmartClinic – AI Clinic Management SaaS

An AI-powered Clinic Management System built for the SMIT Final Hackathon. Features role-based dashboards, appointment management, AI symptom checking, prescription PDF generation, medical history timelines, and analytics dashboards.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Mongoose ODM
- **Database**: MongoDB Atlas
- **AI**: Google Gemini 2.0 Flash
- **Charts**: Recharts
- **PDF**: jsPDF
- **Auth**: JWT (bcryptjs + jsonwebtoken)

## Features by Role

### Admin
- Analytics dashboard (patients, revenue, appointment trends, doctor performance)
- Manage doctors &amp; receptionists (add/remove)
- Subscription management (Free ↔ Pro toggle)
- View high-risk flagged patients

### Doctor
- Daily appointment schedule with patient details
- AI Symptom Checker (Pro plan) with fallback for manual review
- Write multi-medicine prescriptions
- View patient medical history timeline
- Monthly appointment &amp; prescription stats with charts

### Receptionist
- Register new patients (Free plan limited to 25)
- Book appointments with time slot availability
- Manage daily appointment schedule (status updates)
- Search patients by name

### Patient
- Self-register &amp; self-book appointments
- View appointments &amp; cancel pending ones
- View prescriptions &amp; download professional PDF
- AI prescription explanation (Pro plan)
- Medical history timeline

## Setup Instructions

### 1. Clone &amp; Install

```bash
git clone &lt;repo-url&gt;
cd smit-hackathon
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values:
- `MONGODB_URI` – MongoDB Atlas connection string
- `JWT_SECRET` – Any random string (min 32 chars)
- `GEMINI_API_KEY` – Google Gemini API key ([get one free](https://aistudio.google.com/apikey))
- `NEXT_PUBLIC_APP_URL` – Your app URL (default: `http://localhost:3000`)

### 3. Seed Database

```bash
npx tsx scripts/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |
| Doctor | doctor1@clinic.com | doctor123 |
| Doctor | doctor2@clinic.com | doctor123 |
| Receptionist | reception@clinic.com | reception123 |
| Patient | patient1@clinic.com | patient123 |

## API Endpoints

### Auth
- `POST /api/auth/login` – Login
- `POST /api/auth/register` – Patient registration

### Patients
- `GET /api/patients` – List patients (search supported)
- `POST /api/patients` – Create patient (receptionist, 25 limit on free)
- `GET /api/patients/[id]` – Get patient
- `PUT /api/patients/[id]` – Update patient

### Appointments
- `GET /api/appointments` – List appointments (filters: doctorId, patientId, date, status)
- `POST /api/appointments` – Book appointment (double-booking prevented)
- `PUT /api/appointments/[id]` – Update status
- `DELETE /api/appointments/[id]` – Cancel appointment
- `GET /api/appointments/schedule` – Time slot availability

### Prescriptions
- `GET /api/prescriptions` – List prescriptions
- `POST /api/prescriptions` – Create prescription (doctor)
- `GET /api/prescriptions/[id]` – Get prescription detail

### Diagnosis
- `GET /api/diagnosis` – List diagnosis logs
- `POST /api/diagnosis` – Create diagnosis log

### AI (Pro Plan)
- `POST /api/ai/symptom-check` – AI symptom analysis (doctor)
- `POST /api/ai/prescription-explain` – Prescription explanation (patient)
- `POST /api/ai/risk-flag` – Patient risk flagging (doctor/admin)

### Analytics
- `GET /api/analytics/admin` – Admin dashboard analytics
- `GET /api/analytics/doctor` – Doctor dashboard analytics

### Admin
- `GET/PUT /api/subscriptions` – Subscription management
- `GET/POST/DELETE /api/users` – User management

## SaaS Model

- **Free Plan**: 25 patient limit, no AI features
- **Pro Plan**: Unlimited patients, full AI features
- Admin can toggle plans from the Subscriptions page

## Deployment

Deploy to Vercel:
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

---

Built for SMIT Final Hackathon
