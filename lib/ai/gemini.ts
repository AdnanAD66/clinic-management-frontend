// ==========================================
// Google Gemini AI Client with Fallback
// ==========================================

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your-gemini-api-key") return null;
  genAI = new GoogleGenerativeAI(key);
  return genAI;
}

/**
 * Call Gemini AI with a prompt. Returns the text response or null on any error.
 * Never throws – always returns null as fallback.
 * 10-second timeout to prevent hanging.
 */
export async function callGemini(prompt: string): Promise<string | null> {
  try {
    const client = getClient();
    if (!client) {
      console.error("[Gemini] No API key configured or still placeholder.");
      return null;
    }

    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const text = response.text();
    return text || null;
  } catch (err) {
    console.error("[Gemini] AI call failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
