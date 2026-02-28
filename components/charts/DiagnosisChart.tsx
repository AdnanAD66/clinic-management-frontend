"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DiagnosisData {
  diagnosis: string;
  count: number;
}

interface DiagnosisChartProps {
  data: DiagnosisData[];
}

const COLORS = ["#818CF8", "#A78BFA", "#34D399", "#FBBF24", "#F87171"];

export default function DiagnosisChart({ data }: DiagnosisChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
        No diagnosis data available.
      </div>
    );
  }

  // Truncate long diagnosis names
  const chartData = data.map((d) => ({
    ...d,
    shortName:
      d.diagnosis.length > 25
        ? d.diagnosis.substring(0, 25) + "..."
        : d.diagnosis,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 11, fill: "#64748B" }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [String(value), "Cases"]}
          labelFormatter={(label) => {
            const item = chartData.find((d) => d.shortName === label);
            return item?.diagnosis || label;
          }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "13px",
            background: "#0F1629",
            color: "#F1F5F9",
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
