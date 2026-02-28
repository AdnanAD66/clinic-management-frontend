"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function UpgradePrompt() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
        <Sparkles className="h-8 w-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Pro Plan Required</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
        This feature requires a Pro Plan subscription. Contact your administrator to
        upgrade and unlock AI-powered features including symptom analysis, prescription
        explanations, and predictive analytics.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300">
        <Sparkles size={14} />
        Upgrade to Pro
      </div>
    </div>
  );
}
