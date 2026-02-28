"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { GENDERS } from "@/lib/constants";
import { Search } from "lucide-react";

interface SymptomCheckerFormProps {
  onSubmit: (data: {
    symptoms: string;
    age: string;
    gender: string;
    history: string;
  }) => void;
  loading?: boolean;
}

export default function SymptomCheckerForm({ onSubmit, loading }: SymptomCheckerFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [history, setHistory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!symptoms.trim()) newErrors.symptoms = "Symptoms are required.";
    if (!age || Number(age) <= 0) newErrors.age = "Valid age is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ symptoms, age, gender, history });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Symptoms <span className="text-red-500">*</span>
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe the patient's symptoms in detail..."
          rows={4}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            errors.symptoms
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {errors.symptoms && (
          <p className="mt-1 text-xs text-red-500">{errors.symptoms}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Age"
          type="number"
          name="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          error={errors.age}
          required
        />
        <Select
          label="Gender"
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          error={errors.gender}
          options={GENDERS.map((g) => ({ label: g, value: g }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical History
        </label>
        <textarea
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          placeholder="Any relevant medical history (allergies, chronic conditions, etc.)..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Button type="submit" loading={loading} disabled={loading}>
        <Search size={16} className="mr-1" />
        Analyze Symptoms
      </Button>
    </form>
  );
}
