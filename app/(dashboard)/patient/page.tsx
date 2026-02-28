"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { useApi } from "@/lib/hooks/useApi";
import { ROLES } from "@/lib/constants";
import MedicalTimeline, { type TimelineEvent } from "@/components/timeline/MedicalTimeline";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { User, Calendar, FileText } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const events: TimelineEvent[] = [];

    const aptRes = await apiFetch<Array<{ _id: string; date: string; timeSlot: string; status: string; doctorId: { name: string } }>>(
      "/api/appointments"
    );
    if (aptRes.success && aptRes.data) {
      setAppointmentCount(aptRes.data.length);
      for (const apt of aptRes.data) {
        events.push({
          type: "appointment",
          date: apt.date,
          summary: `Appointment at ${apt.timeSlot} – ${apt.status}`,
          details: { doctorName: apt.doctorId?.name, timeSlot: apt.timeSlot, status: apt.status },
        });
      }
    }

    const rxRes = await apiFetch<Array<{ _id: string; createdAt: string; doctorId: { name: string }; medicines: unknown[]; instructions: string }>>(
      "/api/prescriptions"
    );
    if (rxRes.success && rxRes.data) {
      setPrescriptionCount(rxRes.data.length);
      for (const rx of rxRes.data) {
        events.push({
          type: "prescription",
          date: rx.createdAt,
          summary: `Prescription – ${rx.medicines.length} medicine(s)`,
          details: { doctorName: rx.doctorId?.name, medicineCount: rx.medicines.length, instructions: rx.instructions },
        });
      }
    }

    setTimelineEvents(events);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardShell allowedRoles={[ROLES.PATIENT]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Profile Information" className="lg:col-span-1">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15">
              <User className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium capitalize text-indigo-300">
                {user?.subscriptionPlan} Plan
              </span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-3">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{appointmentCount}</p>
                <p className="text-sm text-slate-400">Total Appointments</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <FileText className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{prescriptionCount}</p>
                <p className="text-sm text-slate-400">Total Prescriptions</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Medical Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4">Medical History</h2>
        {loading ? (
          <LoadingSpinner message="Loading history..." />
        ) : (
          <MedicalTimeline events={timelineEvents} />
        )}
      </div>
    </DashboardShell>
  );
}
