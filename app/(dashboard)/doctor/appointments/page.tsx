"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES, TIME_SLOTS } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { Clock, User, AlertTriangle } from "lucide-react";

interface SlotInfo {
  timeSlot: string;
  available: boolean;
  patientName?: string;
  appointmentId?: string;
  status?: string;
  patientId?: string;
}

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string; isRiskFlagged: boolean };
  timeSlot: string;
  status: string;
}

export default function DoctorAppointmentsPage() {
  const { apiFetch } = useApi();
  const [schedule, setSchedule] = useState<SlotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    // We need the current doctor's userId — fetch from /api/appointments instead
    const res = await apiFetch<Appointment[]>(`/api/appointments?date=${dateFilter}`);
    if (res.success && res.data) {
      setAppointments(res.data);
      // Build schedule from TIME_SLOTS
      const bookedMap: Record<string, Appointment> = {};
      for (const apt of res.data) {
        bookedMap[apt.timeSlot] = apt;
      }
      const sched: SlotInfo[] = TIME_SLOTS.map((slot) => {
        const apt = bookedMap[slot];
        return {
          timeSlot: slot,
          available: !apt,
          patientName: apt?.patientId?.name,
          appointmentId: apt?._id,
          status: apt?.status,
          patientId: apt?.patientId?._id,
        };
      });
      setSchedule(sched);
    }
    setLoading(false);
  }, [apiFetch, dateFilter]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const statusColor = (status?: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading schedule..." />
      ) : (
        <div className="grid gap-2">
          {schedule.map((slot) => (
            <Card key={slot.timeSlot}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-mono text-sm font-medium text-gray-700 w-14">
                    {slot.timeSlot}
                  </span>
                  {slot.available ? (
                    <span className="text-sm text-gray-400">Available</span>
                  ) : (
                    <Link
                      href={`/doctor/patients/${slot.patientId}`}
                      className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <User size={14} />
                      {slot.patientName}
                    </Link>
                  )}
                </div>
                {!slot.available && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor(slot.status)}`}>
                    {slot.status}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
