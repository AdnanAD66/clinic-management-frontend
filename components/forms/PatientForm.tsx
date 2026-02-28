"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { GENDERS } from "@/lib/constants";

interface PatientFormProps {
  onSubmit: (data: { name: string; age: number; gender: string; contact: string }) => Promise<void>;
  initial?: { name: string; age: number; gender: string; contact: string };
  loading?: boolean;
}

export default function PatientForm({ onSubmit, initial, loading }: PatientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!age || isNaN(Number(age)) || Number(age) < 0) e.age = "Valid age is required.";
    if (!gender) e.gender = "Gender is required.";
    if (!contact.trim()) e.contact = "Contact is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), age: Number(age), gender, contact: contact.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="Full Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Age"
        name="age"
        type="number"
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
      <Input
        label="Contact"
        name="contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        error={errors.contact}
        required
      />
      <Button type="submit" loading={loading}>
        {initial ? "Update Patient" : "Add Patient"}
      </Button>
    </form>
  );
}
