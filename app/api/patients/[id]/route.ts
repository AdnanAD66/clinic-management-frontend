// GET /api/patients/[id] – single patient (admin, doctor, receptionist)
// PUT /api/patients/[id] – update patient (receptionist)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Patient from "@/lib/db/models/Patient";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (_request, { params }) => {
  await connectDB();
  const patient = await Patient.findById(params?.id).lean();
  if (!patient) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient not found." },
      { status: 404 }
    );
  }
  return NextResponse.json<ApiResponse>({ success: true, data: patient });
};

const handlePut: AuthenticatedHandler = async (request, { params }) => {
  const body = await request.json();
  const { name, age, gender, contact } = body;

  await connectDB();
  const patient = await Patient.findById(params?.id);
  if (!patient) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Patient not found." },
      { status: 404 }
    );
  }

  if (name) patient.name = name;
  if (age !== undefined) patient.age = age;
  if (gender) patient.gender = gender;
  if (contact) patient.contact = contact;

  await patient.save();

  return NextResponse.json<ApiResponse>({
    success: true,
    data: patient,
    message: "Patient updated successfully.",
  });
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]);
export const PUT = withAuth(handlePut, [ROLES.RECEPTIONIST]);
