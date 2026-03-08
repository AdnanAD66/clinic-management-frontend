"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { Users, Calendar, Clock } from "lucide-react";

interface Patient {
  _id: string;
  name: string;
}

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string };
  doctorId: { _id: string; name: string };
  timeSlot: string;
  status: string;
}

export default function ReceptionistDashboard() {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const [patientsRes, appointmentsRes] = await Promise.all([
      apiFetch<Patient[]>("/api/patients"),
      apiFetch<Appointment[]>(`/api/appointments?date=${today}`),
    ]);

    if (patientsRes.success && patientsRes.data) {
      setTotalPatients(patientsRes.data.length);
    }
    if (appointmentsRes.success && appointmentsRes.data) {
      setTodayAppointments(appointmentsRes.data);
      setPendingCount(appointmentsRes.data.filter((a) => a.status === "pending").length);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
        <LoadingSpinner message="Loading dashboard..." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Receptionist Dashboard</h1>
        <p className="text-slate-400">Manage patients and appointments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-3">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalPatients}</p>
              <p className="text-sm text-slate-400">Total Patients</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Calendar className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{todayAppointments.length}</p>
              <p className="text-sm text-slate-400">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-sm text-slate-400">Pending Appointments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Today&apos;s Schedule">
          {todayAppointments.length === 0 ? (
            <p className="text-slate-500">No appointments scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 font-medium text-slate-400">Patient</th>
                    <th className="pb-3 font-medium text-slate-400">Doctor</th>
                    <th className="pb-3 font-medium text-slate-400">Time</th>
                    <th className="pb-3 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b border-white/5">
                      <td className="py-3 font-medium text-white">{apt.patientId?.name || "Unknown"}</td>
                      <td className="py-3 text-slate-400">{apt.doctorId?.name || "Unknown"}</td>
                      <td className="py-3 text-slate-400">{apt.timeSlot}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          apt.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                          apt.status === "confirmed" ? "bg-indigo-500/20 text-indigo-300" :
                          "bg-amber-500/20 text-amber-300"
                        }`}>{apt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
