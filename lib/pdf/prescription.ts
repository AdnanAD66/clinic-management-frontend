// Prescription PDF Generator using jsPDF
import { jsPDF } from "jspdf";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  doctor: { name: string; email?: string };
  patient: { name: string; age: number; gender: string };
  medicines: Medicine[];
  instructions: string;
  createdAt: string;
}

export function generatePrescriptionPDF(data: PrescriptionData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // 1. Clinic name centered
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Smart Clinic", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("AI-Powered Clinic Management System", pageWidth / 2, y, { align: "center" });
  y += 6;

  // 2. Logo placeholder rectangle
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // 3. Doctor info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Doctor:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`Dr. ${data.doctor.name}`, 50, y);
  y += 7;

  // 4. Patient info
  doc.setFont("helvetica", "bold");
  doc.text("Patient:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.patient.name}`, 50, y);
  doc.text(`Age: ${data.patient.age} | Gender: ${data.patient.gender}`, 120, y);
  y += 7;

  // Date
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 20, y);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date(data.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, 50, y);
  y += 10;

  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // 5. Medicines table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Prescription", 20, y);
  y += 8;

  // Table header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("#", 20, y);
  doc.text("Medicine", 30, y);
  doc.text("Dosage", 85, y);
  doc.text("Frequency", 120, y);
  doc.text("Duration", 160, y);
  y += 3;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, pageWidth - 20, y);
  y += 5;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  data.medicines.forEach((med, i) => {
    doc.text(`${i + 1}`, 20, y);
    doc.text(med.name || "-", 30, y);
    doc.text(med.dosage || "-", 85, y);
    doc.text(med.frequency || "-", 120, y);
    doc.text(med.duration || "-", 160, y);
    y += 7;
  });

  y += 5;
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // 6. Instructions
  if (data.instructions) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Instructions:", 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(data.instructions, pageWidth - 40);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 10;
  }

  // 7. Date + time at bottom
  y = Math.max(y, 240);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const now = new Date(data.createdAt);
  doc.text(
    `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    20,
    y
  );
  y += 10;

  // 8. Doctor's Signature
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Doctor's Signature: ___________________________", 20, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dr. ${data.doctor.name}`, 72, y);

  return doc.output("blob");
}
