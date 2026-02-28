"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  type = "text",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-slate-300"
      >
        {label}
        {props.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        className={`rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-white/10"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
