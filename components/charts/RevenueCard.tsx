"use client";

import React from "react";
import { DollarSign } from "lucide-react";

interface RevenueCardProps {
  count: number;
  revenuePerAppointment?: number;
}

export default function RevenueCard({
  count,
  revenuePerAppointment = 500,
}: RevenueCardProps) {
  const total = count * revenuePerAppointment;
  const formatted = total.toLocaleString("en-PK");

  return (
    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-3">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">Rs {formatted}</p>
          <p className="text-sm text-gray-500">Revenue This Month</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Based on {count} completed appointment{count !== 1 ? "s" : ""} &times; Rs{" "}
        {revenuePerAppointment.toLocaleString("en-PK")}
      </p>
    </div>
  );
}
