// POST /api/ai/symptom-check – AI-powered symptom analysis
// Protected: doctor + Pro plan only
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import DiagnosisLog from "@/lib/db/models/DiagnosisLog";
import { withProPlan, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";
import { callGemini } from "@/lib/ai/gemini";

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { symptoms, age, gender, history, patientId } = body;

  if (!symptoms) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Symptoms are required." },
      { status: 400 }
    );
  }

  const prompt = `You are a medical AI assistant. Given the following patient information, provide a clinical analysis.

Patient Details:
- Symptoms: ${symptoms}
- Age: ${age || "Unknown"}
- Gender: ${gender || "Unknown"}
- Medical History: ${history || "None provided"}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "conditions": [{"name": "condition name", "probability": "High/Medium/Low"}],
  "riskLevel": "Low" or "Medium" or "High",
  "suggestedTests": ["test1", "test2"],
  "recommendations": "Brief clinical recommendation"
}

Provide 3-5 possible conditions, a risk level assessment, and 2-4 suggested diagnostic tests.`;

  const aiText = await callGemini(prompt);

  let aiResponse: Record<string, unknown> | null = null;
  let riskLevel: "Low" | "Medium" | "High" | null = null;

  if (aiText) {
    try {
      // Clean potential markdown wrapping
      const cleaned = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiResponse = JSON.parse(cleaned);
      riskLevel = (aiResponse?.riskLevel as "Low" | "Medium" | "High") || null;
    } catch {
      // AI returned non-JSON, wrap it
      aiResponse = { rawResponse: aiText };
    }
  }

  // Save diagnosis log
  await connectDB();
  await DiagnosisLog.create({
    patientId: patientId || null,
    doctorId: user.userId,
    symptoms,
    aiResponse,
    riskLevel,
  });

  if (!aiResponse) {
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: null,
        message: "AI temporarily unavailable. Diagnosis logged for manual review.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: aiResponse,
    message: "Symptom analysis complete.",
  });
};

export const POST = withProPlan(handlePost, [ROLES.DOCTOR]);
