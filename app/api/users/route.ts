// GET /api/users – list users filtered by role (admin only, or limited for other roles)
// POST /api/users – create user (admin only)
// DELETE /api/users – remove user (admin only)
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { withAuth, type AuthenticatedHandler } from "@/lib/auth/middleware";
import { ROLES } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

const handleGet: AuthenticatedHandler = async (request, { user }) => {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: users });
};

const handlePost: AuthenticatedHandler = async (request) => {
  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "All fields required: name, email, password, role." },
      { status: 400 }
    );
  }

  if (!["doctor", "receptionist"].includes(role)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Admin can only create doctor or receptionist accounts." },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Email already registered." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
  });

  return NextResponse.json<ApiResponse>(
    {
      success: true,
      data: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      message: `${role} created successfully.`,
    },
    { status: 201 }
  );
};

const handleDelete: AuthenticatedHandler = async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "User ID required." },
      { status: 400 }
    );
  }

  await connectDB();
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse>({ success: true, message: "User deleted." });
};

// GET is accessible to all authenticated users (for doctor dropdowns, etc.)
export const GET = withAuth(handleGet, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]);
export const POST = withAuth(handlePost, [ROLES.ADMIN]);
export const DELETE = withAuth(handleDelete, [ROLES.ADMIN]);
