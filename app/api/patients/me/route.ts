// GET /api/patients/me – get patient record for the current logged-in user (patient role)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (_request, { user }) => {
  await connectDB();
  // For patient role, find by userId link. For staff, find records they created.
  const query = user.role === ROLES.PATIENT
    ? { userId: user.userId }
    : { createdBy: user.userId };
  const patients = await Patient.find(query).lean();
  return NextResponse.json<ApiResponse>({ success: true, data: patients });
};

export const GET = withAuth(handleGet, [ROLES.PATIENT, ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]);
