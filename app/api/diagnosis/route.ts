// GET /api/diagnosis – list diagnosis logs (filter by patientId)
// POST /api/diagnosis – create diagnosis log (doctor only)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import DiagnosisLog from "@/lib/db/models/DiagnosisLog";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const filter: Record<string, unknown> = {};

  const patientId = searchParams.get("patientId");
  if (patientId) filter.patientId = patientId;

  const logs = await DiagnosisLog.find(filter)
    .populate("patientId", "name")
    .populate("doctorId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: logs });
};

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { patientId, symptoms, aiResponse, riskLevel } = body;

  if (!patientId || !symptoms) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient ID and symptoms are required." },
      { status: 400 }
    );
  }

  await connectDB();

  const log = await DiagnosisLog.create({
    patientId,
    doctorId: user.userId,
    symptoms,
    aiResponse: aiResponse || null,
    riskLevel: riskLevel || null,
  });

  return NextResponse.json<ApiResponse>(
    { success: true, data: log, message: "Diagnosis log created." },
    { status: 201 }
  );
};

export const GET = withAuth(handleGet, [ROLES.DOCTOR, ROLES.ADMIN]);
export const POST = withAuth(handlePost, [ROLES.DOCTOR]);
