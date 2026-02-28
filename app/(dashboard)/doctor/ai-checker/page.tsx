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
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-blue-600" />
          AI Symptom Checker
        </h1>
        <p className="text-gray-500">
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
                            <Activity size={16} className="text-blue-500" />
                            <span className="font-medium text-gray-900">
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
                          className="flex items-center gap-2 rounded-lg border border-gray-100 p-3"
                        >
                          <TestTube size={16} className="text-purple-500" />
                          <span className="text-sm text-gray-700">{test}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {result.recommendations && (
                  <Card title="Recommendations">
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-green-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{result.recommendations}</p>
                    </div>
                  </Card>
                )}

                {/* Raw response fallback */}
                {result.rawResponse && (
                  <Card title="AI Response">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {result.rawResponse}
                    </p>
                  </Card>
                )}
              </div>
            ) : fallbackMessage ? (
              <Card>
                <div className="text-center py-8">
                  <AlertTriangle size={40} className="mx-auto text-amber-400 mb-3" />
                  <p className="text-gray-700 font-medium">{fallbackMessage}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    You can still proceed with a manual diagnosis.
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <Brain size={48} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400">
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
