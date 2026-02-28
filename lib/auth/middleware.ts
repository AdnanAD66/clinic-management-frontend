// ==========================================
// Role-Based Auth Middleware for API Routes
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import type { JwtPayload, ApiResponse } from "@/lib/types";
import type { UserRole, SubscriptionPlan } from "@/lib/constants";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

function errorResponse(message: string, status: number): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status });
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: { user: JwtPayload; params?: Record<string, string> }
) => Promise<NextResponse>;

export function withAuth(
  handler: AuthenticatedHandler,
  allowedRoles: UserRole[]
) {
  return async (
    request: NextRequest,
    routeContext: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const user = getUserFromRequest(request);

    if (!user) {
      return errorResponse("Authentication required. Please log in.", 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return errorResponse("Access denied. Insufficient permissions.", 403);
    }

    const resolvedParams = routeContext?.params ? await routeContext.params : undefined;
    return handler(request, { user, params: resolvedParams });
  };
}

export function withProPlan(
  handler: AuthenticatedHandler,
  allowedRoles: UserRole[]
) {
  return withAuth(async (request, context) => {
    await connectDB();
    const dbUser = await User.findById(context.user.userId).select("subscriptionPlan").lean();

    if (!dbUser || (dbUser as { subscriptionPlan: SubscriptionPlan }).subscriptionPlan === SUBSCRIPTION_PLANS.FREE) {
      return errorResponse("Upgrade to Pro to access AI features.", 403);
    }

    return handler(request, context);
  }, allowedRoles);
}
