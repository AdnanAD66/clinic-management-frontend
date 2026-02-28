// GET /api/patients – list patients (admin, doctor, receptionist)
// POST /api/patients – create patient (receptionist only, with Free Plan limit)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Patient from "@/lib/db/models/Patient";
import User from "@/lib/db/models/User";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES, FREE_PLAN_PATIENT_LIMIT, SUBSCRIPTION_PLANS } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: patients });
};

const handlePost: AuthenticatedHandler = async (request, { user }) => {
  const body = await request.json();
  const { name, age, gender, contact } = body;

  if (!name || age === undefined || !gender || !contact) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "All fields are required: name, age, gender, contact." },
      { status: 400 }
    );
  }

  if (typeof age !== "number" || age < 0) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Age must be a positive number." },
      { status: 400 }
    );
  }

  await connectDB();

  // Free Plan patient limit check (T029)
  const dbUser = await User.findById(user.userId).select("subscriptionPlan").lean();
  if (dbUser && (dbUser as { subscriptionPlan: string }).subscriptionPlan === SUBSCRIPTION_PLANS.FREE) {
    const patientCount = await Patient.countDocuments();
    if (patientCount >= FREE_PLAN_PATIENT_LIMIT) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Patient limit reached. Upgrade to Pro." },
        { status: 403 }
      );
    }
  }

  const patient = await Patient.create({
    name,
    age,
    gender,
    contact,
    createdBy: user.userId,
  });

  return NextResponse.json<ApiResponse>(
    { success: true, data: patient, message: "Patient created successfully." },
    { status: 201 }
  );
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]);
export const POST = withAuth(handlePost, [ROLES.RECEPTIONIST]);
