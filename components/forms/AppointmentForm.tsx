"use client";

import React, { useState, useEffect, useCallback } from "react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useApi } from "@/lib/hooks/useApi";

interface Doctor {
  _id: string;
  name: string;
}

interface SlotInfo {
  timeSlot: string;
  available: boolean;
}

interface AppointmentFormProps {
  onSubmit: (data: { patientId: string; doctorId: string; date: string; timeSlot: string }) => Promise<void>;
  patientId?: string;
  loading?: boolean;
  patients?: { _id: string; name: string }[];
}

export default function AppointmentForm({ onSubmit, patientId, loading, patients }: AppointmentFormProps) {
  const { apiFetch } = useApi();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);

  const [selectedPatient, setSelectedPatient] = useState(patientId || "");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch doctors
  useEffect(() => {
    (async () => {
      const res = await apiFetch<Doctor[]>("/api/users?role=doctor");
      if (res.success && res.data) setDoctors(res.data);
    })();
  }, [apiFetch]);

  // Fetch slots when doctor + date selected
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    const res = await apiFetch<SlotInfo[]>(
      `/api/appointments/schedule?doctorId=${selectedDoctor}&date=${selectedDate}`
    );
    if (res.success && res.data) {
      setSlots(res.data);
    }
    setSlotsLoading(false);
  }, [apiFetch, selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedPatient && !patientId) e.patient = "Patient is required.";
    if (!selectedDoctor) e.doctor = "Doctor is required.";
    if (!selectedDate) e.date = "Date is required.";
    if (!selectedSlot) e.slot = "Time slot is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      patientId: patientId || selectedPatient,
      doctorId: selectedDoctor,
      date: selectedDate,
      timeSlot: selectedSlot,
    });
  };

  const availableSlots = slots.filter((s) => s.available);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {!patientId && patients && (
        <Select
          label="Patient"
          name="patient"
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          error={errors.patient}
          options={patients.map((p) => ({ label: p.name, value: p._id }))}
          required
        />
      )}

      <Select
        label="Doctor"
        name="doctor"
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        error={errors.doctor}
        options={doctors.map((d) => ({ label: d.name, value: d._id }))}
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      {selectedDoctor && selectedDate && (
        slotsLoading ? (
          <p className="text-sm text-slate-400">Loading available slots...</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-sm text-red-500">No available slots for this date.</p>
        ) : (
          <Select
            label="Time Slot"
            name="slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            error={errors.slot}
            options={availableSlots.map((s) => ({ label: s.timeSlot, value: s.timeSlot }))}
            required
          />
        )
      )}

      <Button type="submit" loading={loading} disabled={slotsLoading}>
        Book Appointment
      </Button>
    </form>
  );
}
