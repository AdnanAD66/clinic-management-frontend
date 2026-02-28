"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";

interface PopulatedPatient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  isRiskFlagged: boolean;
}

interface PopulatedDoctor {
  _id: string;
  name: string;
}

interface Appointment {
  _id: string;
  patientId: PopulatedPatient;
  doctorId: PopulatedDoctor;
  date: string;
  timeSlot: string;
  status: string;
}

export default function ReceptionistAppointmentsPage() {
  const { apiFetch } = useApi();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Appointment[]>(
      `/api/appointments?date=${dateFilter}`
    );
    if (res.success && res.data) {
      setAppointments(res.data);
    }
    setLoading(false);
  }, [apiFetch, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    fetchAppointments();
  };

  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <Link href="/receptionist/appointments/book">
            <Button>
              <Plus size={16} className="mr-1" /> Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner message="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No appointments for this date.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 font-medium text-slate-400">Patient</th>
                  <th className="pb-3 font-medium text-slate-400">Doctor</th>
                  <th className="pb-3 font-medium text-slate-400">Time</th>
                  <th className="pb-3 font-medium text-slate-400">Status</th>
                  <th className="pb-3 font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      {apt.patientId?.name || "Unknown"}
                      {apt.patientId?.isRiskFlagged && (
                        <AlertTriangle size={14} className="text-red-400" />
                      )}
                    </td>
                    <td className="py-3 text-slate-400">{apt.doctorId?.name || "Unknown"}</td>
                    <td className="py-3 text-slate-400">{apt.timeSlot}</td>
                    <td className="py-3">
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-medium border-0 bg-transparent cursor-pointer ${
                          apt.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : apt.status === "confirmed"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={async () => {
                          await apiFetch(`/api/appointments/${apt._id}`, { method: "DELETE" });
                          fetchAppointments();
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
