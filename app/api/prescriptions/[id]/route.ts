// GET /api/prescriptions/[id] – single prescription with populated patient + doctor
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Prescription from "@/lib/db/models/Prescription";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (_request, { user, params }) => {
  await connectDB();

  const prescription = await Prescription.findById(params?.id)
    .populate("patientId", "name age gender contact")
    .populate("doctorId", "name email")
    .lean();

  if (!prescription) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Prescription not found." },
      { status: 404 }
    );
  }

  // Patients can only view their own
  if (user.role === ROLES.PATIENT) {
    const patientRecord = await Patient.findOne({ createdBy: user.userId }).lean();
    const presPatientId = (prescription as { patientId: { _id: { toString(): string } } }).patientId?._id?.toString();
    if (!patientRecord || presPatientId !== (patientRecord as { _id: { toString(): string } })._id.toString()) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }
  }

  return NextResponse.json<ApiResponse>({ success: true, data: prescription });
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]);
