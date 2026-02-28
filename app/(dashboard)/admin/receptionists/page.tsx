"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { UserPlus, Plus, Trash2, X } from "lucide-react";

interface Receptionist {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminReceptionistsPage() {
  const { apiFetch } = useApi();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReceptionists = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Receptionist[]>("/api/users?role=receptionist");
    if (res.success && res.data) {
      setReceptionists(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchReceptionists();
  }, [fetchReceptionists]);

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
      body: JSON.stringify({ ...formData, role: "receptionist" }),
    });
    if (res.success) {
      setShowForm(false);
      setFormData({ name: "", email: "", password: "" });
      fetchReceptionists();
    } else {
      setFormError(res.message || "Failed to create receptionist.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove receptionist "${name}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/users?id=${id}`, { method: "DELETE" });
    if (res.success) {
      setReceptionists((prev) => prev.filter((r) => r._id !== id));
    }
  };

  return (
    <DashboardShell allowedRoles={[ROLES.ADMIN]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-indigo-400" />
            Manage Receptionists
          </h1>
          <p className="text-slate-400">Add or remove receptionist accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
          {showForm ? "Cancel" : "Add Receptionist"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <h3 className="font-semibold text-white">New Receptionist</h3>
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
              Create Receptionist
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingSpinner message="Loading receptionists..." />
      ) : (
        <Card>
          {receptionists.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No receptionists registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-3 font-medium text-slate-400">Name</th>
                    <th className="pb-3 font-medium text-slate-400">Email</th>
                    <th className="pb-3 font-medium text-slate-400">Joined</th>
                    <th className="pb-3 font-medium text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receptionists.map((rec) => (
                    <tr key={rec._id} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="py-3 font-medium text-white">{rec.name}</td>
                      <td className="py-3 text-slate-400">{rec.email}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(rec._id, rec.name)}
                          className="rounded-lg border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
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
