// PUT /api/appointments/[id] – update status (doctor, receptionist)
// DELETE /api/appointments/[id] – cancel appointment (receptionist, patient own)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Appointment from "@/lib/db/models/Appointment";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handlePut: AuthenticatedHandler = async (request, { params }) => {
  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "confirmed", "completed"].includes(status)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Valid status required: pending, confirmed, completed." },
      { status: 400 }
    );
  }

  await connectDB();
  const appointment = await Appointment.findById(params?.id);
  if (!appointment) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Appointment not found." },
      { status: 404 }
    );
  }

  appointment.status = status;
  await appointment.save();

  return NextResponse.json<ApiResponse>({
    success: true,
    data: appointment,
    message: "Appointment status updated.",
  });
};

const handleDelete: AuthenticatedHandler = async (request, { user, params }) => {
  await connectDB();
  const appointment = await Appointment.findById(params?.id);
  if (!appointment) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Appointment not found." },
      { status: 404 }
    );
  }

  // Patients can only cancel their own
  if (user.role === ROLES.PATIENT) {
    const patientRecord = await Patient.findOne({ createdBy: user.userId }).lean();
    if (!patientRecord || appointment.patientId.toString() !== (patientRecord as { _id: { toString(): string } })._id.toString()) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }
  }

  await Appointment.findByIdAndDelete(params?.id);

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Appointment cancelled.",
  });
};

export const PUT = withAuth(handlePut, [ROLES.DOCTOR, ROLES.RECEPTIONIST]);
export const DELETE = withAuth(handleDelete, [ROLES.RECEPTIONIST, ROLES.PATIENT]);
