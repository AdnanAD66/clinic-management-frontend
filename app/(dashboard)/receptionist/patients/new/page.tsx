"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import PatientForm from "@/components/forms/PatientForm";
import Card from "@/components/ui/Card";

export default function NewPatientPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: { name: string; age: number; gender: string; contact: string }) => {
    setLoading(true);
    setError("");
    const res = await apiFetch("/api/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setLoading(false);

    if (res.success) {
      router.push("/receptionist/patients");
    } else {
      setError(res.message || "Failed to create patient.");
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <h1 className="text-2xl font-bold text-white mb-6">Add New Patient</h1>
      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <PatientForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </DashboardShell>
  );
}
