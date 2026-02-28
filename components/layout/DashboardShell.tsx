"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import Sidebar from "./Sidebar";
import { LogOut } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { UserRole } from "@/lib/constants";

interface DashboardShellProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function DashboardShell({ children, allowedRoles }: DashboardShellProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(`/${user.role}`);
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#050810]">
      <Sidebar />
      <div className="md:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl px-6">
          <div className="md:hidden w-8" /> {/* Space for mobile hamburger */}
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs capitalize text-slate-400">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
