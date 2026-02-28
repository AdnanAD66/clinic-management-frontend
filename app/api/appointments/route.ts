// GET /api/appointments – list appointments (filter by doctorId, patientId, date, status)
// POST /api/appointments – book appointment (receptionist, patient)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Appointment from "@/lib/db/models/Appointment";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request, { user }) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const filter: Record<string, unknown> = {};

  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (status) filter.status = status;

  // Patients can only see their own appointments
  if (user.role === ROLES.PATIENT) {
    // Find patient record linked to this user
    const patientRecord = await Patient.findOne({ createdBy: user.userId }).lean();
    if (patientRecord) {
      filter.patientId = (patientRecord as { _id: unknown })._id;
    } else {
      // self-registered patient without a Patient record – return empty
      return NextResponse.json<ApiResponse>({ success: true, data: [] });
    }
  }

  // Doctors see only their own
  if (user.role === ROLES.DOCTOR) {
    filter.doctorId = user.userId;
  }

  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name age gender contact isRiskFlagged")
    .populate("doctorId", "name email")
    .sort({ date: 1, timeSlot: 1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: appointments });
};

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { patientId, doctorId, date, timeSlot } = body;

  if (!patientId || !doctorId || !date || !timeSlot) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "All fields required: patientId, doctorId, date, timeSlot." },
      { status: 400 }
    );
  }

  await connectDB();

  // Double-booking check
  const existing = await Appointment.findOne({
    doctorId,
    date: new Date(date),
    timeSlot,
  });

  if (existing) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "This time slot is already booked for the selected doctor." },
      { status: 409 }
    );
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    date: new Date(date),
    timeSlot,
  });

  return NextResponse.json<ApiResponse>(
    { success: true, data: appointment, message: "Appointment booked successfully." },
    { status: 201 }
  );
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]);
export const POST = withAuth(handlePost, [ROLES.RECEPTIONIST, ROLES.PATIENT]);
