// GET /api/analytics/admin – Admin dashboard analytics
// Protected: admin only
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Patient from "@/lib/db/models/Patient";
import User from "@/lib/db/models/User";
import Appointment from "@/lib/db/models/Appointment";
import DiagnosisLog from "@/lib/db/models/DiagnosisLog";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES, REVENUE_PER_APPOINTMENT } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async () => {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Basic counts
  const [totalPatients, totalDoctors, totalReceptionists] = await Promise.all([
    Patient.countDocuments(),
    User.countDocuments({ role: "doctor" }),
    User.countDocuments({ role: "receptionist" }),
  ]);

  // Monthly appointments
  const monthlyAppointments = await Appointment.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  // Completed appointments this month for revenue
  const completedThisMonth = await Appointment.countDocuments({
    status: "completed",
    createdAt: { $gte: startOfMonth },
  });
  const revenue = completedThisMonth * REVENUE_PER_APPOINTMENT;

  // Top diagnoses this month
  const topDiagnoses = await DiagnosisLog.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    {
      $group: {
        _id: "$symptoms",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $project: {
        diagnosis: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  // Flagged patients
  const flaggedPatients = await Patient.find({ isRiskFlagged: true })
    .select("name age gender contact")
    .lean();

  // Appointment trends: 7-day and 30-day
  const appointmentTrend30 = await Appointment.aggregate([
    { $match: { date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);

  const appointmentTrend7 = appointmentTrend30.filter((d) => {
    return new Date(d.date) >= sevenDaysAgo;
  });

  // Doctor performance
  const doctorPerformance = await Appointment.aggregate([
    { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
    {
      $group: {
        _id: "$doctorId",
        completed: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },
    {
      $project: {
        _id: 0,
        name: "$doctor.name",
        completed: 1,
        avgPerDay: {
          $round: [{ $divide: ["$completed", { $max: [now.getDate(), 1] }] }, 1],
        },
      },
    },
    { $sort: { completed: -1 } },
  ]);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalReceptionists,
      monthlyAppointments,
      completedThisMonth,
      revenue,
      topDiagnoses,
      flaggedPatients,
      appointmentTrend7,
      appointmentTrend30,
      doctorPerformance,
    },
  });
};

export const GET = withAuth(handleGet, [ROLES.ADMIN]);
