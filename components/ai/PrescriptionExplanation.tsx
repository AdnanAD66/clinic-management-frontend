"use client";

import React, { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Sparkles, AlertCircle } from "lucide-react";

interface PrescriptionExplanationProps {
  prescriptionId: string;
  existingExplanation?: string;
  isPro?: boolean;
}

export default function PrescriptionExplanation({
  prescriptionId,
  existingExplanation,
  isPro = false,
}: PrescriptionExplanationProps) {
  const { apiFetch } = useApi();
  const [explanation, setExplanation] = useState(existingExplanation || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getExplanation = async () => {
    setLoading(true);
    setError("");
    const res = await apiFetch<{ explanation: string }>("/api/ai/prescription-explain", {
      method: "POST",
      body: JSON.stringify({ prescriptionId }),
    });

    if (res.success && res.data?.explanation) {
      setExplanation(res.data.explanation);
    } else if (res.message?.includes("Upgrade to Pro")) {
      setError("This feature requires a Pro plan. Contact your administrator to upgrade.");
    } else {
      setError(res.message || "AI explanation temporarily unavailable. Please try again later.");
    }
    setLoading(false);
  };

  if (!isPro) {
    return (
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <Sparkles size={16} />
          <span className="text-sm font-medium">AI Prescription Explanation</span>
        </div>
        <p className="mt-1 text-sm text-amber-600">
          Upgrade to Pro to get AI-powered explanations of your prescriptions in simple language.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
        <Sparkles size={14} className="text-blue-500" />
        AI Explanation
      </h3>

      {explanation ? (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm text-gray-700 whitespace-pre-line">{explanation}</p>
        </div>
      ) : loading ? (
        <LoadingSpinner message="Generating explanation..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <Button onClick={getExplanation} variant="secondary">
          <Sparkles size={14} className="mr-1" />
          Get AI Explanation
        </Button>
      )}
    </div>
  );
}
