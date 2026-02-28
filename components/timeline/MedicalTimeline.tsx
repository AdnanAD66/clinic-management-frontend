"use client";

import React, { useState } from "react";
import { Calendar, Stethoscope, FileText, Activity, ChevronDown, ChevronUp } from "lucide-react";

export interface TimelineEvent {
  type: "appointment" | "diagnosis" | "prescription";
  date: string;
  summary: string;
  details: Record<string, unknown>;
}

interface MedicalTimelineProps {
  events: TimelineEvent[];
}

const TYPE_CONFIG = {
  appointment: {
    icon: Calendar,
    color: "bg-blue-100 text-blue-600 border-blue-200",
    label: "Appointment",
  },
  diagnosis: {
    icon: Activity,
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    label: "Diagnosis",
  },
  prescription: {
    icon: FileText,
    color: "bg-green-100 text-green-600 border-green-200",
    label: "Prescription",
  },
};

type FilterType = "all" | "appointment" | "diagnosis" | "prescription";

export default function MedicalTimeline({ events }: MedicalTimelineProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    const next = new Set(expanded);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpanded(next);
  };

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Appointments", value: "appointment" },
    { label: "Diagnoses", value: "diagnosis" },
    { label: "Prescriptions", value: "prescription" },
  ];

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No events to display.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {sorted.map((event, index) => {
              const config = TYPE_CONFIG[event.type];
              const Icon = config.icon;
              const isExpanded = expanded.has(index);

              return (
                <div key={index} className="relative pl-12">
                  {/* Icon on the line */}
                  <div
                    className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border ${config.color}`}
                  >
                    <Icon size={14} />
                  </div>

                  {/* Event card */}
                  <div
                    className="rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {event.summary}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                        {event.type === "appointment" && (
                          <div className="space-y-1">
                            <p><strong>Doctor:</strong> {(event.details.doctorName as string) || "N/A"}</p>
                            <p><strong>Time:</strong> {(event.details.timeSlot as string) || "N/A"}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{(event.details.status as string) || "N/A"}</span></p>
                          </div>
                        )}
                        {event.type === "diagnosis" && (
                          <div className="space-y-1">
                            <p><strong>Symptoms:</strong> {(event.details.symptoms as string) || "N/A"}</p>
                            <p><strong>Risk Level:</strong> {String(event.details.riskLevel ?? "N/A")}</p>
                            {event.details.aiResponse ? (
                              <p><strong>AI Response:</strong> Available</p>
                            ) : null}
                          </div>
                        )}
                        {event.type === "prescription" && (
                          <div className="space-y-1">
                            <p><strong>Doctor:</strong> {(event.details.doctorName as string) || "N/A"}</p>
                            <p><strong>Medicines:</strong> {(event.details.medicineCount as number) || 0} items</p>
                            {event.details.instructions ? (
                              <p><strong>Instructions:</strong> {String(event.details.instructions)}</p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
