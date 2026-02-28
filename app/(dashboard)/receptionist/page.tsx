"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { ROLES } from "@/lib/constants";
import { Users, Calendar, Clock } from "lucide-react";

export default function ReceptionistDashboard() {
  return (
    <DashboardShell allowedRoles={[ROLES.RECEPTIONIST]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
        <p className="text-gray-500">Manage patients and appointments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Total Patients</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Pending Appointments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Today&apos;s Schedule">
          <p className="text-gray-500">No appointments scheduled for today.</p>
        </Card>
      </div>
    </DashboardShell>
  );
}
