"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RevenueCard from "@/components/charts/RevenueCard";
import DiagnosisChart from "@/components/charts/DiagnosisChart";
import AppointmentChart from "@/components/charts/AppointmentChart";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { Users, Stethoscope, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

interface AdminAnalytics {
  totalPatients: number;
  totalDoctors: number;
  totalReceptionists: number;
  monthlyAppointments: number;
  completedThisMonth: number;
  revenue: number;
  topDiagnoses: { diagnosis: string; count: number }[];
  flaggedPatients: { _id: string; name: string; age: number; gender: string; contact: string }[];
  appointmentTrend7: { date: string; count: number }[];
  appointmentTrend30: { date: string; count: number }[];
  doctorPerformance: { name: string; completed: number; avgPerDay: number }[];
}

export default function AdminDashboard() {
  const { apiFetch } = useApi();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState<"7" | "30">("30");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AdminAnalytics>("/api/analytics/admin");
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <DashboardShell allowedRoles={[ROLES.ADMIN]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of clinic operations</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : data ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-3">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.totalPatients}</p>
                  <p className="text-sm text-slate-400">Total Patients</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Stethoscope className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.totalDoctors}</p>
                  <p className="text-sm text-slate-400">Total Doctors</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.monthlyAppointments}</p>
                  <p className="text-sm text-slate-400">Monthly Appointments</p>
                </div>
              </div>
            </Card>
            <RevenueCard count={data.completedThisMonth} />
          </div>

          {/* Top Diagnoses Chart */}
          <Card title="Top Diagnoses This Month">
            <DiagnosisChart data={data.topDiagnoses} />
          </Card>

          {/* Flagged Patients */}
          <Card title="High-Risk Flagged Patients">
            {data.flaggedPatients.length === 0 ? (
              <p className="text-center py-6 text-slate-500">No flagged patients.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="pb-3 font-medium text-slate-400">Name</th>
                      <th className="pb-3 font-medium text-slate-400">Age</th>
                      <th className="pb-3 font-medium text-slate-400">Gender</th>
                      <th className="pb-3 font-medium text-slate-400">Contact</th>
                      <th className="pb-3 font-medium text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flaggedPatients.map((p) => (
                      <tr key={p._id} className="border-b border-white/5">
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-400" />
                          {p.name}
                        </td>
                        <td className="py-3 text-slate-400">{p.age}</td>
                        <td className="py-3 text-slate-400">{p.gender}</td>
                        <td className="py-3 text-slate-400">{p.contact}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                            High Risk
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Appointment Trend */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" />
                Appointment Trends
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setTrendView("7")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    trendView === "7"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-500 hover:bg-white/5"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTrendView("30")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    trendView === "30"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-500 hover:bg-white/5"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
            <AppointmentChart
              data={trendView === "7" ? data.appointmentTrend7 : data.appointmentTrend30}
            />
          </Card>

          {/* Doctor Performance */}
          <Card title="Doctor Performance This Month">
            {data.doctorPerformance.length === 0 ? (
              <p className="text-center py-6 text-slate-500">No performance data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="pb-3 font-medium text-slate-400">Doctor</th>
                      <th className="pb-3 font-medium text-slate-400">Completed</th>
                      <th className="pb-3 font-medium text-slate-400">Avg/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.doctorPerformance.map((doc, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 font-medium text-white">{doc.name}</td>
                        <td className="py-3 text-slate-400">{doc.completed}</td>
                        <td className="py-3 text-slate-400">{doc.avgPerDay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-center py-8 text-slate-500">Failed to load analytics.</p>
        </Card>
      )}
    </DashboardShell>
  );
}
