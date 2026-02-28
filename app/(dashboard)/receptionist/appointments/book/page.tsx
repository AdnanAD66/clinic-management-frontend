"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import AppointmentForm from "@/components/forms/AppointmentForm";
import Card from "@/components/ui/Card";

interface Patient {
  _id: string;
  name: string;
}

export default function BookAppointmentReceptionistPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    (async () => {
      const res = await apiFetch<Patient[]>("/api/patients");
      if (res.success && res.data) setPatients(res.data);
    })();
  }, [apiFetch]);

  const handleSubmit = async (data: { patientId: string; doctorId: string; date: string; timeSlot: string }) => {
    setLoading(true);
    setError("");
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.success) {
      router.push("/receptionist/appointments");
    } else {
      setError(res.message || "Failed to book appointment.");
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>
      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <AppointmentForm onSubmit={handleSubmit} loading={loading} patients={patients} />
      </Card>
    </DashboardShell>
  );
}
