"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AppointmentChart from "@/components/charts/AppointmentChart";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { Calendar, FileText, Activity, Clock } from "lucide-react";

interface TodayAppointment {
  _id: string;
  patientId: { _id: string; name: string; age: number; gender: string };
  timeSlot: string;
  status: string;
}

interface DoctorAnalytics {
  todayAppointments: TodayAppointment[];
  monthlyAppointmentCount: number;
  monthlyPrescriptionCount: number;
  appointmentsByDay: { date: string; count: number }[];
}

export default function DoctorDashboard() {
  const { apiFetch } = useApi();
  const [data, setData] = useState<DoctorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<DoctorAnalytics>("/api/analytics/doctor");
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500">Your daily overview</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : data ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.todayAppointments.length}
                  </p>
                  <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.monthlyPrescriptionCount}
                  </p>
                  <p className="text-sm text-gray-500">Prescriptions This Month</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-3">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.monthlyAppointmentCount}
                  </p>
                  <p className="text-sm text-gray-500">Monthly Appointments</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card title="Today&apos;s Schedule">
            {data.todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-2">
                {data.todayAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={14} />
                        <span className="text-sm font-medium">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {apt.patientId?.name || "Unknown Patient"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {apt.patientId?.age} yrs &bull; {apt.patientId?.gender}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Appointment Trend */}
          <Card title="Appointment Trend (Last 30 Days)">
            <AppointmentChart data={data.appointmentsByDay} color="#8B5CF6" />
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-center py-8 text-gray-500">Failed to load dashboard data.</p>
        </Card>
      )}
    </DashboardShell>
  );
}
