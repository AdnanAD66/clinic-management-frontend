"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import { CreditCard, Sparkles } from "lucide-react";

interface UserSub {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
}

export default function AdminSubscriptionsPage() {
  const { apiFetch } = useApi();
  const [users, setUsers] = useState<UserSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<UserSub[]>("/api/subscriptions");
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const togglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === "free" ? "pro" : "free";
    const confirmed = window.confirm(
      `Change subscription to ${newPlan.toUpperCase()} plan?`
    );
    if (!confirmed) return;

    setToggling(userId);
    const res = await apiFetch<UserSub>("/api/subscriptions", {
      method: "PUT",
      body: JSON.stringify({ userId, plan: newPlan }),
    });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, subscriptionPlan: newPlan } : u
        )
      );
    }
    setToggling(null);
  };

  return (
    <DashboardShell allowedRoles={[ROLES.ADMIN]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-blue-600" />
          Subscription Management
        </h1>
        <p className="text-gray-500">Manage user subscription plans</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading users..." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Name</th>
                  <th className="pb-3 font-medium text-gray-500">Email</th>
                  <th className="pb-3 font-medium text-gray-500">Role</th>
                  <th className="pb-3 font-medium text-gray-500">Plan</th>
                  <th className="pb-3 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <span className="capitalize text-gray-600">{u.role}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.subscriptionPlan === "pro"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.subscriptionPlan === "pro" && <Sparkles size={12} />}
                        {u.subscriptionPlan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => togglePlan(u._id, u.subscriptionPlan)}
                        disabled={toggling === u._id}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          u.subscriptionPlan === "pro"
                            ? "border border-gray-300 text-gray-600 hover:bg-gray-100"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        } disabled:opacity-50`}
                      >
                        {toggling === u._id
                          ? "Updating..."
                          : u.subscriptionPlan === "pro"
                            ? "Downgrade to Free"
                            : "Upgrade to Pro"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
