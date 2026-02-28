"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
