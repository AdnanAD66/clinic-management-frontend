"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { ROLES, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { useAuth } from "@/lib/auth/AuthContext";
import SymptomCheckerForm from "@/components/ai/SymptomCheckerForm";
import UpgradePrompt from "@/components/ui/UpgradePrompt";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Brain, AlertTriangle, Activity, TestTube, FileText } from "lucide-react";

interface Condition {
  name: string;
  probability: string;
}

interface AnalysisResult {
  conditions?: Condition[];
  riskLevel?: string;
  suggestedTests?: string[];
  recommendations?: string;
  rawResponse?: string;
}

export default function DoctorAICheckerPage() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState("");

  const isPro = user?.subscriptionPlan === SUBSCRIPTION_PLANS.PRO;

  const handleSubmit = async (data: {
    symptoms: string;
    age: string;
    gender: string;
    history: string;
  }) => {
    setLoading(true);
    setResult(null);
    setFallbackMessage("");

    const res = await apiFetch<AnalysisResult>("/api/ai/symptom-check", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      setResult(res.data);
    } else if (res.success && !res.data) {
      setFallbackMessage(
        res.message || "AI temporarily unavailable. Diagnosis has been logged for manual review."
      );
    } else {
      setFallbackMessage(res.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-red-500/15 text-red-300 border-red-500/20";
      case "medium":
        return "bg-amber-500/15 text-amber-300 border-amber-500/20";
      case "low":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="h-7 w-7 text-indigo-400" />
          AI Symptom Checker
        </h1>
        <p className="text-slate-400">
          Enter patient symptoms for AI-powered analysis and recommendations
        </p>
      </div>

      {!isPro ? (
        <UpgradePrompt />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Patient Symptoms">
            <SymptomCheckerForm onSubmit={handleSubmit} loading={loading} />
          </Card>

          <div>
            {loading ? (
              <Card>
                <LoadingSpinner message="Analyzing symptoms with AI... (up to 10 seconds)" />
              </Card>
            ) : result ? (
              <div className="space-y-4">
                {/* Risk Level */}
                {result.riskLevel && (
                  <div
                    className={`rounded-lg border p-4 ${getRiskColor(result.riskLevel)}`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={20} />
                      <span className="font-bold text-lg">
                        Risk Level: {result.riskLevel}
                      </span>
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {result.conditions && result.conditions.length > 0 && (
                  <Card title="Possible Conditions">
                    <div className="space-y-2">
                      {result.conditions.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-indigo-400" />
                            <span className="font-medium text-white">
                              {c.name}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskColor(c.probability)}`}
                          >
                            {c.probability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Suggested Tests */}
                {result.suggestedTests && result.suggestedTests.length > 0 && (
                  <Card title="Suggested Tests">
                    <div className="space-y-2">
                      {result.suggestedTests.map((test, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-white/5 p-3"
                        >
                          <TestTube size={16} className="text-purple-400" />
                          <span className="text-sm text-slate-300">{test}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {result.recommendations && (
                  <Card title="Recommendations">
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-300">{result.recommendations}</p>
                    </div>
                  </Card>
                )}

                {/* Raw response fallback */}
                {result.rawResponse && (
                  <Card title="AI Response">
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {result.rawResponse}
                    </p>
                  </Card>
                )}
              </div>
            ) : fallbackMessage ? (
              <Card>
                <div className="text-center py-8">
                  <AlertTriangle size={40} className="mx-auto text-amber-400 mb-3" />
                  <p className="text-slate-300 font-medium">{fallbackMessage}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    You can still proceed with a manual diagnosis.
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <Brain size={48} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-500">
                    Enter symptoms and click &quot;Analyze&quot; to get AI-powered results
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
