"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Calendar, Trash2 } from "lucide-react";

interface Appointment {
  _id: string;
  doctorId: { _id: string; name: string };
  date: string;
  timeSlot: string;
  status: string;
}

export default function PatientAppointmentsPage() {
  const { apiFetch } = useApi();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Appointment[]>("/api/appointments");
    if (res.success && res.data) {
      setAppointments(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (id: string) => {
    const res = await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (res.success) {
      fetchAppointments();
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/20 text-emerald-300";
      case "confirmed": return "bg-blue-500/20 text-blue-300";
      default: return "bg-amber-500/20 text-amber-300";
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.PATIENT]}>
      <h1 className="text-2xl font-bold text-white mb-6">My Appointments</h1>

      {loading ? (
        <LoadingSpinner message="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400">No appointments yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt._id}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    Dr. {apt.doctorId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                  {apt.status === "pending" && (
                    <button
                      onClick={() => cancelAppointment(apt._id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
