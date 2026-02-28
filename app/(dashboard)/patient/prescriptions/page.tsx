"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ROLES } from "@/lib/constants";
import { useApi } from "@/lib/hooks/useApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { generatePrescriptionPDF } from "@/lib/pdf/prescription";
import { FileText, Download, Eye, X } from "lucide-react";
import PrescriptionExplanation from "@/components/ai/PrescriptionExplanation";
import { useAuth } from "@/lib/auth/AuthContext";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  _id: string;
  doctorId: { _id: string; name: string; email?: string };
  patientId: { _id: string; name: string; age: number; gender: string };
  medicines: Medicine[];
  instructions: string;
  aiExplanation?: string;
  createdAt: string;
}

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const isPro = user?.subscriptionPlan === SUBSCRIPTION_PLANS.PRO;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Prescription | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<Prescription[]>("/api/prescriptions");
    if (res.success && res.data) {
      setPrescriptions(res.data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const viewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    const res = await apiFetch<Prescription>(`/api/prescriptions/${id}`);
    if (res.success && res.data) {
      setDetail(res.data);
    }
    setDetailLoading(false);
  };

  const downloadPDF = (prescription: Prescription) => {
    const blob = generatePrescriptionPDF({
      doctor: prescription.doctorId,
      patient: prescription.patientId,
      medicines: prescription.medicines,
      instructions: prescription.instructions,
      createdAt: prescription.createdAt,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${new Date(prescription.createdAt).toISOString().split("T")[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell allowedRoles={[ROLES.PATIENT]}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Prescriptions</h1>

      {loading ? (
        <LoadingSpinner message="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No prescriptions yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <Card key={rx._id}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    Dr. {rx.doctorId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(rx.createdAt).toLocaleDateString()} &bull; {rx.medicines.length} medicine(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewDetail(rx._id)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => downloadPDF(rx)}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Prescription Detail</h2>
              <button onClick={() => { setSelectedId(null); setDetail(null); }}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {detailLoading ? (
              <LoadingSpinner message="Loading..." />
            ) : detail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Doctor</p>
                    <p className="font-medium">Dr. {detail.doctorId?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">{new Date(detail.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Medicines</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-gray-500">Medicine</th>
                          <th className="pb-2 font-medium text-gray-500">Dosage</th>
                          <th className="pb-2 font-medium text-gray-500">Frequency</th>
                          <th className="pb-2 font-medium text-gray-500">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.medicines.map((med, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2 font-medium">{med.name}</td>
                            <td className="py-2 text-gray-600">{med.dosage}</td>
                            <td className="py-2 text-gray-600">{med.frequency || "-"}</td>
                            <td className="py-2 text-gray-600">{med.duration || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {detail.instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Instructions</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{detail.instructions}</p>
                  </div>
                )}

                <PrescriptionExplanation
                  prescriptionId={detail._id}
                  existingExplanation={detail.aiExplanation}
                  isPro={isPro}
                />

                <Button onClick={() => downloadPDF(detail)}>
                  <Download size={16} className="mr-1" /> Download PDF
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Failed to load prescription.</p>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
