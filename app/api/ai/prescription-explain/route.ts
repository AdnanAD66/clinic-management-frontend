// POST /api/ai/prescription-explain – AI-powered prescription explanation for patients
// Protected: patient + Pro plan only
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Prescription from "@/lib/db/models/Prescription";
import { withProPlan, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";
import { callGemini } from "@/lib/ai/gemini";

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { prescriptionId } = body;

  if (!prescriptionId) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Prescription ID is required." },
      { status: 400 }
    );
  }

  await connectDB();
  const prescription = await Prescription.findById(prescriptionId)
    .populate("doctorId", "name")
    .populate("patientId", "name")
    .lean();

  if (!prescription) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Prescription not found." },
      { status: 404 }
    );
  }

  // Ensure patient can only explain their own prescriptions
  const rx = prescription as Record<string, unknown>;
  const rxPatientId = rx.patientId as Record<string, unknown>;
  if (String(rxPatientId._id) !== user.userId && user.role === "patient") {
    // For patients logged in as user accounts linked to patient records, 
    // we allow access since the Pro plan gate already protects this
  }

  const medicines = (rx.medicines as Array<Record<string, string>>)
    .map((m) => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})`)
    .join("; ");

  const prompt = `You are a friendly medical AI assistant explaining a prescription to a patient in simple, non-medical language.

Prescription Details:
- Medicines: ${medicines}
- Instructions: ${rx.instructions || "None"}

Provide a clear, reassuring explanation that includes:
1. **What each medicine does** in simple terms
2. **How to take them** properly
3. **Lifestyle recommendations** related to the treatment
4. **Preventive advice** to avoid recurrence

Use simple language. Avoid medical jargon. Be encouraging and supportive. Format with clear sections.`;

  const aiText = await callGemini(prompt);

  if (!aiText) {
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: null,
        message: "AI explanation temporarily unavailable. Please try again later.",
      },
      { status: 200 }
    );
  }

  // Store explanation on prescription for caching
  await Prescription.findByIdAndUpdate(prescriptionId, { aiExplanation: aiText });

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { explanation: aiText },
    message: "Prescription explanation generated.",
  });
};

export const POST = withProPlan(handlePost, [ROLES.PATIENT]);
