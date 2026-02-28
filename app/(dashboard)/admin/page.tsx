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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of clinic operations</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : data ? (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalPatients}</p>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.totalDoctors}</p>
                  <p className="text-sm text-gray-500">Total Doctors</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.monthlyAppointments}</p>
                  <p className="text-sm text-gray-500">Monthly Appointments</p>
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
              <p className="text-center py-6 text-gray-400">No flagged patients.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 font-medium text-gray-500">Name</th>
                      <th className="pb-3 font-medium text-gray-500">Age</th>
                      <th className="pb-3 font-medium text-gray-500">Gender</th>
                      <th className="pb-3 font-medium text-gray-500">Contact</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flaggedPatients.map((p) => (
                      <tr key={p._id} className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-900 flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500" />
                          {p.name}
                        </td>
                        <td className="py-3 text-gray-600">{p.age}</td>
                        <td className="py-3 text-gray-600">{p.gender}</td>
                        <td className="py-3 text-gray-600">{p.contact}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
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
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Appointment Trends
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setTrendView("7")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    trendView === "7"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTrendView("30")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    trendView === "30"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100"
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
              <p className="text-center py-6 text-gray-400">No performance data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 font-medium text-gray-500">Doctor</th>
                      <th className="pb-3 font-medium text-gray-500">Completed</th>
                      <th className="pb-3 font-medium text-gray-500">Avg/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.doctorPerformance.map((doc, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-900">{doc.name}</td>
                        <td className="py-3 text-gray-600">{doc.completed}</td>
                        <td className="py-3 text-gray-600">{doc.avgPerDay}</td>
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
          <p className="text-center py-8 text-gray-500">Failed to load analytics.</p>
        </Card>
      )}
    </DashboardShell>
  );
}
