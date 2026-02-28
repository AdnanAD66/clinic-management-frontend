// GET /api/prescriptions – list prescriptions (filter by patientId, doctorId)
// POST /api/prescriptions – create prescription (doctor only)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Prescription from "@/lib/db/models/Prescription";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request, { user }) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const filter: Record<string, unknown> = {};

  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");

  if (patientId) filter.patientId = patientId;
  if (doctorId) filter.doctorId = doctorId;

  // Doctors see only their own prescriptions
  if (user.role === ROLES.DOCTOR) {
    filter.doctorId = user.userId;
  }

  // Patients see only their own
  if (user.role === ROLES.PATIENT) {
    const patientRecord = await Patient.findOne({ createdBy: user.userId }).lean();
    if (patientRecord) {
      filter.patientId = (patientRecord as { _id: unknown })._id;
    } else {
      return NextResponse.json<ApiResponse>({ success: true, data: [] });
    }
  }

  const prescriptions = await Prescription.find(filter)
    .populate("patientId", "name age gender")
    .populate("doctorId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: prescriptions });
};

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { patientId, medicines, instructions } = body;

  if (!patientId) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient ID is required." },
      { status: 400 }
    );
  }

  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "At least one medicine is required." },
      { status: 400 }
    );
  }

  for (const med of medicines) {
    if (!med.name || !med.dosage) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Each medicine must have a name and dosage." },
        { status: 400 }
      );
    }
  }

  await connectDB();

  const prescription = await Prescription.create({
    patientId,
    doctorId: user.userId,
    medicines,
    instructions: instructions || "",
  });

  return NextResponse.json<ApiResponse>(
    { success: true, data: prescription, message: "Prescription created successfully." },
    { status: 201 }
  );
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]);
export const POST = withAuth(handlePost, [ROLES.DOCTOR]);
