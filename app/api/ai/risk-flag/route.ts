// POST /api/ai/risk-flag – AI-powered patient risk flagging
// Protected: doctor + admin only
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import DiagnosisLog from "@/lib/db/models/DiagnosisLog";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handlePost: AuthenticatedHandler = async (request) => {
  const body = await request.json();
  const { patientId } = body;

  if (!patientId) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient ID is required." },
      { status: 400 }
    );
  }

  await connectDB();

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient not found." },
      { status: 404 }
    );
  }

  // Get diagnosis logs from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogs = await DiagnosisLog.find({
    patientId,
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Check for 3+ entries with similar symptoms (basic string matching)
  let shouldFlag = false;
  let flagReason = "";

  if (recentLogs.length >= 3) {
    // Group similar symptoms using basic word overlap
    const symptomGroups: Record<string, number> = {};
    for (const log of recentLogs) {
      const logData = log as Record<string, unknown>;
      const symptoms = String(logData.symptoms || "").toLowerCase();
      const words = symptoms.split(/\s+/).filter((w) => w.length > 3);
      for (const word of words) {
        symptomGroups[word] = (symptomGroups[word] || 0) + 1;
      }
    }

    // If any significant word appears in 3+ logs, consider them similar
    const repeatedSymptoms = Object.entries(symptomGroups)
      .filter(([, count]) => count >= 3)
      .map(([word]) => word);

    if (repeatedSymptoms.length > 0) {
      shouldFlag = true;
      flagReason = `Repeated similar symptoms in ${recentLogs.length} diagnoses over 30 days: ${repeatedSymptoms.slice(0, 5).join(", ")}`;
    }
  }

  if (shouldFlag) {
    patient.isRiskFlagged = true;
    await patient.save();
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      isRiskFlagged: shouldFlag,
      reason: flagReason || "No risk pattern detected.",
      totalDiagnoses: recentLogs.length,
    },
    message: shouldFlag ? "Patient flagged as high risk." : "No risk pattern detected.",
  });
};

export const POST = withAuth(handlePost, [ROLES.DOCTOR, ROLES.ADMIN]);
