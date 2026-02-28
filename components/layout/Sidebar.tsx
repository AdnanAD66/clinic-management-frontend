"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLES } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  Stethoscope,
  FileText,
  Brain,
  CreditCard,
  User,
  CalendarPlus,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: Record<UserRole, NavItem[]> = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Doctors", href: "/admin/doctors", icon: <Stethoscope size={20} /> },
    { label: "Receptionists", href: "/admin/receptionists", icon: <UserPlus size={20} /> },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: <CreditCard size={20} /> },
  ],
  [ROLES.DOCTOR]: [
    { label: "Dashboard", href: "/doctor", icon: <LayoutDashboard size={20} /> },
    { label: "Appointments", href: "/doctor/appointments", icon: <Calendar size={20} /> },
    { label: "Prescriptions", href: "/doctor/prescriptions/new", icon: <FileText size={20} /> },
    { label: "AI Checker", href: "/doctor/ai-checker", icon: <Brain size={20} /> },
  ],
  [ROLES.RECEPTIONIST]: [
    { label: "Dashboard", href: "/receptionist", icon: <LayoutDashboard size={20} /> },
    { label: "Patients", href: "/receptionist/patients", icon: <Users size={20} /> },
    { label: "Appointments", href: "/receptionist/appointments", icon: <Calendar size={20} /> },
  ],
  [ROLES.PATIENT]: [
    { label: "Profile", href: "/patient", icon: <User size={20} /> },
    { label: "Appointments", href: "/patient/appointments", icon: <Calendar size={20} /> },
    { label: "Prescriptions", href: "/patient/prescriptions", icon: <FileText size={20} /> },
    { label: "Book Appointment", href: "/patient/book", icon: <CalendarPlus size={20} /> },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = MENU_ITEMS[user.role] || [];

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#0F1629] border border-white/10 p-2 shadow-lg shadow-black/30 md:hidden text-slate-300"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-white/[0.06] bg-[#0A0E1A] transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/[0.06] px-6">
          <Stethoscope className="h-6 w-6 text-indigo-400" />
          <span className="ml-2 text-lg font-bold text-white">SmartClinic</span>
        </div>
        {navContent}
      </aside>
    </>
  );
}
