"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import PrescriptionForm from "@/components/forms/PrescriptionForm";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
}

export default function NewPrescriptionPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await apiFetch<Patient[]>("/api/patients");
      if (res.success && res.data) setPatients(res.data);
    })();
  }, [apiFetch]);

  const handleSubmit = async (data: { medicines: { name: string; dosage: string; frequency: string; duration: string }[]; instructions: string }) => {
    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await apiFetch("/api/prescriptions", {
      method: "POST",
      body: JSON.stringify({ patientId: selectedPatient, ...data }),
    });
    setLoading(false);
    if (res.success) {
      router.push("/doctor");
    } else {
      setError(res.message || "Failed to create prescription.");
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      <h1 className="text-2xl font-bold text-white mb-6">New Prescription</h1>
      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <div className="mb-6 max-w-lg">
          <Select
            label="Patient"
            name="patient"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            options={patients.map((p) => ({ label: `${p.name} (${p.age}, ${p.gender})`, value: p._id }))}
            required
          />
        </div>
        <PrescriptionForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </DashboardShell>
  );
}
