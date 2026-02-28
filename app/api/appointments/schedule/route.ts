// GET /api/appointments/schedule – doctor schedule for a specific date
// Returns all time slots with availability status
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Appointment from "@/lib/db/models/Appointment";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES, TIME_SLOTS } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request) => {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const date = searchParams.get("date");

  if (!doctorId || !date) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "doctorId and date are required." },
      { status: 400 }
    );
  }

  await connectDB();

  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: start, $lt: end },
  })
    .populate("patientId", "name")
    .lean();

  const bookedMap: Record<string, { patientName: string; appointmentId: string; status: string }> = {};
  for (const apt of appointments as Array<{
    timeSlot: string;
    _id: { toString(): string };
    status: string;
    patientId: { name: string } | null;
  }>) {
    bookedMap[apt.timeSlot] = {
      patientName: apt.patientId?.name || "Unknown",
      appointmentId: apt._id.toString(),
      status: apt.status,
    };
  }

  const schedule = TIME_SLOTS.map((slot) => ({
    timeSlot: slot,
    available: !bookedMap[slot],
    ...(bookedMap[slot] || {}),
  }));

  return NextResponse.json<ApiResponse>({ success: true, data: schedule });
};

export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]);
