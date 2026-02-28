// ==========================================
// App Constants – No Magic Numbers
// ==========================================

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;

export type SubscriptionPlan =
  (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const APPOINTMENT_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUSES)[keyof typeof APPOINTMENT_STATUSES];

export const REVENUE_PER_APPOINTMENT = 500;
export const FREE_PLAN_PATIENT_LIMIT = 25;

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
] as const;

export const GENDERS = ["Male", "Female", "Other"] as const;

export const JWT_EXPIRY = "24h";
