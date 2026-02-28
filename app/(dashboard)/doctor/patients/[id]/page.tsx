"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MedicalTimeline, { type TimelineEvent } from "@/components/timeline/MedicalTimeline";
import { AlertTriangle, User, Phone, Calendar as CalendarIcon } from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  isRiskFlagged: boolean;
  createdAt: string;
}

export default function DoctorPatientProfilePage() {
  const params = useParams();
  const { apiFetch } = useApi();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "prescriptions">("info");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Patient>(`/api/patients/${params.id}`);
    if (res.success && res.data) {
      setPatient(res.data);
    }
    setLoading(false);
  }, [apiFetch, params.id]);

  const fetchTimeline = useCallback(async () => {
    if (!params.id) return;
    setTimelineLoading(true);
    const events: TimelineEvent[] = [];

    // Fetch appointments
    const aptRes = await apiFetch<Array<{ date: string; timeSlot: string; status: string; doctorId: { name: string } }>>(
      `/api/appointments?patientId=${params.id}`
    );
    if (aptRes.success && aptRes.data) {
      for (const apt of aptRes.data) {
        events.push({
          type: "appointment",
          date: apt.date,
          summary: `Appointment at ${apt.timeSlot} – ${apt.status}`,
          details: { doctorName: apt.doctorId?.name, timeSlot: apt.timeSlot, status: apt.status },
        });
      }
    }

    // Fetch prescriptions
    const rxRes = await apiFetch<Array<{ createdAt: string; doctorId: { name: string }; medicines: unknown[]; instructions: string }>>(
      `/api/prescriptions?patientId=${params.id}`
    );
    if (rxRes.success && rxRes.data) {
      for (const rx of rxRes.data) {
        events.push({
          type: "prescription",
          date: rx.createdAt,
          summary: `Prescription – ${rx.medicines.length} medicine(s)`,
          details: { doctorName: rx.doctorId?.name, medicineCount: rx.medicines.length, instructions: rx.instructions },
        });
      }
    }

    // Fetch diagnosis logs
    const dxRes = await apiFetch<Array<{ createdAt: string; symptoms: string; riskLevel: string | null; aiResponse: unknown }>>(
      `/api/diagnosis?patientId=${params.id}`
    );
    if (dxRes.success && dxRes.data) {
      for (const dx of dxRes.data) {
        events.push({
          type: "diagnosis",
          date: dx.createdAt,
          summary: `Diagnosis – ${dx.symptoms.substring(0, 50)}${dx.symptoms.length > 50 ? "..." : ""}`,
          details: { symptoms: dx.symptoms, riskLevel: dx.riskLevel, aiResponse: dx.aiResponse },
        });
      }
    }

    setTimelineEvents(events);
    setTimelineLoading(false);
  }, [apiFetch, params.id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (activeTab === "timeline") {
      fetchTimeline();
    }
  }, [activeTab, fetchTimeline]);

  if (loading) {
    return (
      <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
        <LoadingSpinner message="Loading patient..." />
      </DashboardShell>
    );
  }

  if (!patient) {
    return (
      <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
        <p className="text-center text-gray-500 py-8">Patient not found.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={[ROLES.DOCTOR]}>
      {patient.isRiskFlagged && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <AlertTriangle size={20} />
          <span className="font-medium">
            This patient has been flagged as high-risk due to repeated similar diagnoses.
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
          {patient.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {patient.name}
            {patient.isRiskFlagged && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                <AlertTriangle size={12} /> High Risk
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">
            {patient.gender} &bull; {patient.age} years
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(["info", "timeline", "prescriptions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500">Age</p>
                <p className="font-medium text-gray-900">{patient.age} years</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-medium text-gray-900">{patient.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium text-gray-900">{patient.contact}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "timeline" && (
        <Card>
          {timelineLoading ? (
            <LoadingSpinner message="Loading timeline..." />
          ) : (
            <MedicalTimeline events={timelineEvents} />
          )}
        </Card>
      )}

      {activeTab === "prescriptions" && (
        <Card>
          {timelineEvents.filter((e) => e.type === "prescription").length === 0 ? (
            <p className="text-center text-gray-500 py-8">No prescriptions recorded.</p>
          ) : (
            <div className="space-y-3">
              {timelineEvents
                .filter((e) => e.type === "prescription")
                .map((e, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{e.summary}</p>
                    <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}
    </DashboardShell>
  );
}
