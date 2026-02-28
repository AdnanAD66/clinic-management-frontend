"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { Stethoscope, Plus, Trash2, X } from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDoctorsPage() {
  const { apiFetch } = useApi();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Doctor[]>("/api/users?role=doctor");
    if (res.success && res.data) {
      setDoctors(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const res = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ ...formData, role: "doctor" }),
    });
    if (res.success) {
      setShowForm(false);
      setFormData({ name: "", email: "", password: "" });
      fetchDoctors();
    } else {
      setFormError(res.message || "Failed to create doctor.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove doctor "${name}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/users?id=${id}`, { method: "DELETE" });
    if (res.success) {
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.ADMIN]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-blue-600" />
            Manage Doctors
          </h1>
          <p className="text-gray-500">Add or remove doctor accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
          {showForm ? "Cancel" : "Add Doctor"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <h3 className="font-semibold text-gray-900">New Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button type="submit" loading={submitting}>
              Create Doctor
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingSpinner message="Loading doctors..." />
      ) : (
        <Card>
          {doctors.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No doctors registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-500">Name</th>
                    <th className="pb-3 font-medium text-gray-500">Email</th>
                    <th className="pb-3 font-medium text-gray-500">Joined</th>
                    <th className="pb-3 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{doc.name}</td>
                      <td className="py-3 text-gray-600">{doc.email}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(doc._id, doc.name)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </DashboardShell>
  );
}
