// GET /api/analytics/doctor – Doctor dashboard analytics
// Protected: doctor only
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Appointment from "@/lib/db/models/Appointment";
import Prescription from "@/lib/db/models/Prescription";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request, { user }) => {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Optional date range
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : startOfMonth;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : now;

  // Today's appointments
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayAppointments = await Appointment.find({
    doctorId: user.userId,
    date: { $gte: todayStart, $lt: todayEnd },
  })
    .populate("patientId", "name age gender")
    .sort({ timeSlot: 1 })
    .lean();

  // Monthly appointment count
  const monthlyAppointmentCount = await Appointment.countDocuments({
    doctorId: user.userId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Monthly prescription count
  const monthlyPrescriptionCount = await Prescription.countDocuments({
    doctorId: user.userId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Appointments by day (last 30 days)
  const appointmentsByDay = await Appointment.aggregate([
    {
      $match: {
        doctorId: user.userId,
        date: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      todayAppointments,
      monthlyAppointmentCount,
      monthlyPrescriptionCount,
      appointmentsByDay,
    },
  });
};

export const GET = withAuth(handleGet, [ROLES.DOCTOR]);
