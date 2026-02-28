"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { ROLES } from "@/lib/constants";
import { Users, Calendar, Clock } from "lucide-react";

export default function ReceptionistDashboard() {
  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Receptionist Dashboard</h1>
        <p className="text-slate-400">Manage patients and appointments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-3">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-400">Total Patients</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Calendar className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-400">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-400">Pending Appointments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Today&apos;s Schedule">
          <p className="text-slate-500">No appointments scheduled for today.</p>
        </Card>
      </div>
    </DashboardShell>
  );
}
