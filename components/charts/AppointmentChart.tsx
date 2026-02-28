"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AppointmentData {
  date: string;
  count: number;
}

interface AppointmentChartProps {
  data: AppointmentData[];
  color?: string;
}

export default function AppointmentChart({
  data,
  color = "#3B82F6",
}: AppointmentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
        No appointment data available.
      </div>
    );
  }

  // Format dates for display
  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 11, fill: "#64748B" }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [String(value), "Appointments"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "13px",
            background: "#0F1629",
            color: "#F1F5F9",
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
