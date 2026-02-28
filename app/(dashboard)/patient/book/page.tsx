"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { useAuth } from "@/lib/auth/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle } from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
}

interface SlotInfo {
  timeSlot: string;
  available: boolean;
}

export default function PatientBookPage() {
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Fetch doctors
  useEffect(() => {
    (async () => {
      const res = await apiFetch<Doctor[]>("/api/users?role=doctor");
      if (res.success && res.data) setDoctors(res.data);
    })();
  }, [apiFetch]);

  // Find patient record for this user
  useEffect(() => {
    (async () => {
      const res = await apiFetch<{ _id: string }[]>("/api/patients/me");
      if (res.success && res.data && res.data.length > 0) {
        setPatientId(res.data[0]._id);
      }
    })();
  }, [apiFetch]);

  // Fetch slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    (async () => {
      setSlotsLoading(true);
      setSelectedSlot("");
      const res = await apiFetch<SlotInfo[]>(
        `/api/appointments/schedule?doctorId=${selectedDoctor}&date=${selectedDate}`
      );
      if (res.success && res.data) setSlots(res.data);
      setSlotsLoading(false);
    })();
  }, [apiFetch, selectedDoctor, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError("Please select doctor, date, and time slot.");
      return;
    }

    setLoading(true);
    setError("");

    // If no patientId found, use the user's own userId
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        patientId: patientId || user?._id,
        doctorId: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedSlot,
      }),
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || "Failed to book appointment.");
    }
  };

  if (success) {
    return (
      <DashboardShell allowedRoles={[ROLES.PATIENT]}>
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment on {selectedDate} at {selectedSlot} has been confirmed.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/patient/appointments")}>
              View Appointments
            </Button>
            <Button variant="secondary" onClick={() => { setSuccess(false); setSelectedDoctor(""); setSelectedDate(""); setSelectedSlot(""); }}>
              Book Another
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <DashboardShell allowedRoles={[ROLES.PATIENT]}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>
      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <Select
            label="Doctor"
            name="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            options={doctors.map((d) => ({ label: d.name, value: d._id }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {selectedDoctor && selectedDate && (
            slotsLoading ? (
              <p className="text-sm text-gray-500">Loading available slots...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-red-500">No available slots for this date.</p>
            ) : (
              <Select
                label="Time Slot"
                name="slot"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                options={availableSlots.map((s) => ({ label: s.timeSlot, value: s.timeSlot }))}
                required
              />
            )
          )}

          <Button type="submit" loading={loading}>
            Confirm Booking
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
