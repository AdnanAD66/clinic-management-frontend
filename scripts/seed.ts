// Comprehensive Seed script – Run with: npx tsx scripts/seed.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smartclinic";

// ── Schemas ──────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "doctor", "receptionist", "patient"], required: true },
    subscriptionPlan: { type: String, enum: ["free", "pro"], default: "free" },
  },
  { timestamps: true }
);

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRiskFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed"], default: "pending" },
  },
  { timestamps: true }
);

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicines: [{ name: String, dosage: String, frequency: String, duration: String }],
  instructions: { type: String },
  aiExplanation: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const DiagnosisLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  symptoms: { type: String, required: true },
  aiResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  riskLevel: { type: String, enum: ["Low", "Medium", "High", null], default: null },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
const DiagnosisLog = mongoose.models.DiagnosisLog || mongoose.model("DiagnosisLog", DiagnosisLogSchema);

// ── Seed Data ────────────────────────────────────────
const SEED_USERS = [
  { name: "Admin User", email: "admin@clinic.com", password: "admin123", role: "admin", subscriptionPlan: "pro" },
  { name: "Dr. Ahmed Khan", email: "doctor1@clinic.com", password: "doctor123", role: "doctor", subscriptionPlan: "pro" },
  { name: "Dr. Sara Ali", email: "doctor2@clinic.com", password: "doctor123", role: "doctor", subscriptionPlan: "pro" },
  { name: "Reception Desk", email: "reception@clinic.com", password: "reception123", role: "receptionist", subscriptionPlan: "free" },
  { name: "Patient Ali", email: "patient1@clinic.com", password: "patient123", role: "patient", subscriptionPlan: "pro" },
];

const SEED_PATIENTS = [
  { name: "Ali Raza", age: 35, gender: "Male", contact: "0300-1234567" },
  { name: "Fatima Noor", age: 28, gender: "Female", contact: "0321-7654321" },
  { name: "Hassan Malik", age: 45, gender: "Male", contact: "0333-1112233" },
  { name: "Ayesha Siddiqui", age: 22, gender: "Female", contact: "0345-9998877" },
  { name: "Usman Iqbal", age: 60, gender: "Male", contact: "0312-5556644" },
];

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { family: 4 });
  console.log("✅ Connected\n");

  // ── Users ──────────────────────────────────────
  const createdUsers: Record<string, mongoose.Types.ObjectId> = {};
  for (const userData of SEED_USERS) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`⏭  Skipping ${userData.email} (already exists)`);
      createdUsers[userData.email] = exists._id;
      continue;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({ ...userData, password: hashedPassword });
    createdUsers[userData.email] = user._id;
    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  const doctor1Id = createdUsers["doctor1@clinic.com"];
  const doctor2Id = createdUsers["doctor2@clinic.com"];
  const receptionId = createdUsers["reception@clinic.com"];

  // ── Patients ───────────────────────────────────
  const createdPatients: mongoose.Types.ObjectId[] = [];
  for (const pData of SEED_PATIENTS) {
    const exists = await Patient.findOne({ name: pData.name, contact: pData.contact });
    if (exists) {
      console.log(`⏭  Skipping patient ${pData.name} (already exists)`);
      createdPatients.push(exists._id);
      continue;
    }
    const patient = await Patient.create({ ...pData, createdBy: receptionId });
    createdPatients.push(patient._id);
    console.log(`✅ Created patient: ${pData.name}`);
  }

  // ── Appointments ───────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const appointmentData = [
    { patientId: createdPatients[0], doctorId: doctor1Id, date: today, timeSlot: "09:00", status: "confirmed" },
    { patientId: createdPatients[1], doctorId: doctor1Id, date: today, timeSlot: "10:00", status: "pending" },
    { patientId: createdPatients[2], doctorId: doctor1Id, date: today, timeSlot: "11:00", status: "pending" },
    { patientId: createdPatients[3], doctorId: doctor2Id, date: today, timeSlot: "09:30", status: "confirmed" },
    { patientId: createdPatients[4], doctorId: doctor2Id, date: today, timeSlot: "10:30", status: "pending" },
    { patientId: createdPatients[0], doctorId: doctor1Id, date: yesterday, timeSlot: "09:00", status: "completed" },
    { patientId: createdPatients[1], doctorId: doctor1Id, date: yesterday, timeSlot: "10:00", status: "completed" },
    { patientId: createdPatients[2], doctorId: doctor2Id, date: tomorrow, timeSlot: "14:00", status: "pending" },
    { patientId: createdPatients[3], doctorId: doctor2Id, date: tomorrow, timeSlot: "14:30", status: "pending" },
    { patientId: createdPatients[4], doctorId: doctor1Id, date: tomorrow, timeSlot: "15:00", status: "pending" },
  ];

  const existingCount = await Appointment.countDocuments();
  if (existingCount === 0) {
    await Appointment.insertMany(appointmentData);
    console.log(`✅ Created ${appointmentData.length} appointments`);
  } else {
    console.log(`⏭  Skipping appointments (${existingCount} already exist)`);
  }

  // ── Prescriptions ──────────────────────────────
  const prescriptionData = [
    {
      patientId: createdPatients[0], doctorId: doctor1Id,
      medicines: [
        { name: "Amoxicillin", dosage: "500mg", frequency: "Thrice daily", duration: "7 days" },
        { name: "Paracetamol", dosage: "500mg", frequency: "Twice daily", duration: "5 days" },
      ],
      instructions: "Take after meals. Drink plenty of fluids.",
    },
    {
      patientId: createdPatients[1], doctorId: doctor1Id,
      medicines: [
        { name: "Omeprazole", dosage: "20mg", frequency: "Once daily", duration: "14 days" },
      ],
      instructions: "Take 30 minutes before breakfast.",
    },
    {
      patientId: createdPatients[2], doctorId: doctor2Id,
      medicines: [
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days" },
        { name: "Vitamin D3", dosage: "1000IU", frequency: "Once daily", duration: "30 days" },
        { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "30 days" },
      ],
      instructions: "Monitor blood sugar levels daily. Follow low-sugar diet.",
    },
    {
      patientId: createdPatients[3], doctorId: doctor2Id,
      medicines: [
        { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "10 days" },
      ],
      instructions: "Take at bedtime. Avoid driving.",
    },
    {
      patientId: createdPatients[4], doctorId: doctor1Id,
      medicines: [
        { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
      ],
      instructions: "Take at night. Regular blood pressure monitoring advised.",
    },
  ];

  const existingRx = await Prescription.countDocuments();
  if (existingRx === 0) {
    await Prescription.insertMany(prescriptionData);
    console.log(`✅ Created ${prescriptionData.length} prescriptions`);
  } else {
    console.log(`⏭  Skipping prescriptions (${existingRx} already exist)`);
  }

  // ── Diagnosis Logs ─────────────────────────────
  const diagnosisData = [
    { patientId: createdPatients[4], doctorId: doctor1Id, symptoms: "chest pain, shortness of breath, fatigue", riskLevel: "High" },
    { patientId: createdPatients[4], doctorId: doctor1Id, symptoms: "chest pain, dizziness, fatigue", riskLevel: "High" },
    { patientId: createdPatients[4], doctorId: doctor2Id, symptoms: "chest pain, high blood pressure, fatigue", riskLevel: "High" },
    { patientId: createdPatients[0], doctorId: doctor1Id, symptoms: "fever, sore throat, body aches", riskLevel: "Low" },
  ];

  const existingDx = await DiagnosisLog.countDocuments();
  if (existingDx === 0) {
    await DiagnosisLog.insertMany(diagnosisData);
    // Flag the high-risk patient (Usman Iqbal)
    await Patient.findByIdAndUpdate(createdPatients[4], { isRiskFlagged: true });
    console.log(`✅ Created ${diagnosisData.length} diagnosis logs (1 patient flagged)`);
  } else {
    console.log(`⏭  Skipping diagnosis logs (${existingDx} already exist)`);
  }

  // ── Summary ────────────────────────────────────
  console.log("\n📋 Demo Credentials:");
  console.log("══════════════════════════════════════════════════════");
  console.log("  Role            Email                    Password  ");
  console.log("──────────────────────────────────────────────────────");
  for (const u of SEED_USERS) {
    console.log(`  ${u.role.padEnd(16)}${u.email.padEnd(25)}${u.password}`);
  }
  console.log("══════════════════════════════════════════════════════");
  console.log(`\n  Patients: ${SEED_PATIENTS.length} | Appointments: ${appointmentData.length}`);
  console.log(`  Prescriptions: ${prescriptionData.length} | Diagnosis Logs: ${diagnosisData.length}`);
  console.log(`  Flagged Patients: 1 (Usman Iqbal)\n`);

  await mongoose.disconnect();
  console.log("🌱 Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
