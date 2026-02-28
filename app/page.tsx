"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import { Stethoscope, LogIn, UserPlus, Shield, Brain, Calendar, FileText } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/${user.role}`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">SmartClinic</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Clinic Management
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Streamline appointments, prescriptions, and diagnostics with intelligent tools.
            Built for doctors, receptionists, and patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogIn size={20} />
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Role-Based Access", desc: "Admin, Doctor, Receptionist & Patient dashboards with secure authentication." },
            { icon: Brain, title: "AI Diagnostics", desc: "Smart symptom checker and prescription explanations powered by Gemini AI." },
            { icon: Calendar, title: "Appointment Booking", desc: "Seamless scheduling with double-booking prevention and real-time availability." },
            { icon: FileText, title: "E-Prescriptions", desc: "Digital prescriptions with PDF generation and full medical history timeline." },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-gray-500">
        SmartClinic &copy; {new Date().getFullYear()} &mdash; AI Clinic Management SaaS
      </footer>
    </div>
  );
}
