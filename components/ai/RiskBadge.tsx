"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface RiskBadgeProps {
  isRiskFlagged: boolean;
}

export default function RiskBadge({ isRiskFlagged }: RiskBadgeProps) {
  if (!isRiskFlagged) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      <AlertTriangle size={12} />
      High Risk
    </span>
  );
}
