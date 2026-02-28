"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionFormProps {
  onSubmit: (data: { medicines: MedicineRow[]; instructions: string }) => Promise<void>;
  loading?: boolean;
}

const FREQUENCY_OPTIONS = [
  { label: "Once daily", value: "Once daily" },
  { label: "Twice daily", value: "Twice daily" },
  { label: "Thrice daily", value: "Thrice daily" },
  { label: "As needed", value: "As needed" },
];

const emptyMedicine = (): MedicineRow => ({ name: "", dosage: "", frequency: "", duration: "" });

export default function PrescriptionForm({ onSubmit, loading }: PrescriptionFormProps) {
  const [medicines, setMedicines] = useState<MedicineRow[]>([emptyMedicine()]);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const addMedicine = () => setMedicines([...medicines, emptyMedicine()]);

  const removeMedicine = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (medicines.length === 0) {
      setError("At least one medicine is required.");
      return;
    }

    for (const med of medicines) {
      if (!med.name.trim() || !med.dosage.trim()) {
        setError("Each medicine must have a name and dosage.");
        return;
      }
    }

    await onSubmit({ medicines, instructions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Medicines</h3>
          <button
            type="button"
            onClick={addMedicine}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <Plus size={16} /> Add Medicine
          </button>
        </div>

        {medicines.map((med, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/[0.06] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Medicine #{index + 1}
              </span>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Medicine Name"
                name={`med-name-${index}`}
                value={med.name}
                onChange={(e) => updateMedicine(index, "name", e.target.value)}
                required
              />
              <Input
                label="Dosage"
                name={`med-dosage-${index}`}
                value={med.dosage}
                onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                placeholder="e.g., 500mg"
                required
              />
              <Select
                label="Frequency"
                name={`med-frequency-${index}`}
                value={med.frequency}
                onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                options={FREQUENCY_OPTIONS}
              />
              <Input
                label="Duration"
                name={`med-duration-${index}`}
                value={med.duration}
                onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                placeholder="e.g., 7 days"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Instructions / Notes
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Additional instructions for the patient..."
        />
      </div>

      <Button type="submit" loading={loading}>
        Create Prescription
      </Button>
    </form>
  );
}
