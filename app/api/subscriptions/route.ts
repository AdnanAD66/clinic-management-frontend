// GET/PUT /api/subscriptions – Subscription management (admin only)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async () => {
  await connectDB();
  const users = await User.find()
    .select("name email role subscriptionPlan")
    .sort({ role: 1, name: 1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: users });
};

const handlePut: AuthenticatedHandler = async (request) => {
  const body = await request.json();
  const { userId, plan } = body;

  if (!userId || !plan || !["free", "pro"].includes(plan)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Valid userId and plan (free/pro) required." },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { subscriptionPlan: plan },
    { new: true }
  ).select("name email role subscriptionPlan");

  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: user,
    message: `Subscription updated to ${plan}.`,
  });
};

export const GET = withAuth(handleGet, [ROLES.ADMIN]);
export const PUT = withAuth(handlePut, [ROLES.ADMIN]);
