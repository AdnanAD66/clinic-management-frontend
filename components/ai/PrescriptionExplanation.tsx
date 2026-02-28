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
      <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-amber-300">
          <Sparkles size={16} />
          <span className="text-sm font-medium">AI Prescription Explanation</span>
        </div>
        <p className="mt-1 text-sm text-amber-400/80">
          Upgrade to Pro to get AI-powered explanations of your prescriptions in simple language.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
        <Sparkles size={14} className="text-indigo-400" />
        AI Explanation
      </h3>

      {explanation ? (
        <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
          <p className="text-sm text-slate-300 whitespace-pre-line">{explanation}</p>
        </div>
      ) : loading ? (
        <LoadingSpinner message="Generating explanation..." />
      ) : error ? (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
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
