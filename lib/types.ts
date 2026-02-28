// ==========================================
// Shared TypeScript Interfaces
// ==========================================

import type { UserRole, SubscriptionPlan, AppointmentStatus } from "./constants";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDocument {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  createdBy: string;
  isRiskFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDocument {
  _id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionDocument {
  _id: string;
  patientId: string;
  doctorId: string;
  medicines: Medicine[];
  instructions: string;
  aiExplanation?: string;
  createdAt: Date;
}

export interface DiagnosisLogDocument {
  _id: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  aiResponse: Record<string, unknown> | null;
  riskLevel: "Low" | "Medium" | "High" | null;
  createdAt: Date;
}

export interface TimelineEvent {
  type: "appointment" | "diagnosis" | "prescription";
  date: Date;
  summary: string;
  details: Record<string, unknown>;
}

// Auth context types
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
}
