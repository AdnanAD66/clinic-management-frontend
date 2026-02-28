"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { Plus, Search, AlertTriangle } from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  isRiskFlagged: boolean;
  createdAt: string;
}

export default function ReceptionistPatientsPage() {
  const { apiFetch } = useApi();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiFetch<Patient[]>(`/api/patients${params}`);
    if (res.success && res.data) {
      setPatients(res.data);
    }
    setLoading(false);
  }, [apiFetch, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Patients</h1>
        <Link href="/receptionist/patients/new">
          <Button>
            <Plus size={16} className="mr-1" /> Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading patients..." />
        ) : patients.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            {search ? "No patients match your search." : "No patients registered yet."}
          </p>
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
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      {p.name}
                      {p.isRiskFlagged && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                          <AlertTriangle size={12} /> High Risk
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">{p.age}</td>
                    <td className="py-3 text-slate-400">{p.gender}</td>
                    <td className="py-3 text-slate-400">{p.contact}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.isRiskFlagged ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                        {p.isRiskFlagged ? "Flagged" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
