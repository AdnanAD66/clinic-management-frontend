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
      <div className="flex min-h-screen items-center justify-center bg-[#050810]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen animated-gradient">
      {/* Hero */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-indigo-400" />
          <span className="text-xl font-bold text-white">SmartClinic</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-6">
            <Brain size={14} />
            AI-Powered Healthcare
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Next-Gen Clinic<br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Management System</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Streamline appointments, prescriptions, and diagnostics with intelligent tools.
            Built for doctors, receptionists, and patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25"
            >
              <UserPlus size={20} />
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              <LogIn size={20} />
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Role-Based Access", desc: "Admin, Doctor, Receptionist & Patient dashboards with secure authentication.", color: "text-indigo-400 bg-indigo-500/10" },
            { icon: Brain, title: "AI Diagnostics", desc: "Smart symptom checker and prescription explanations powered by Gemini AI.", color: "text-purple-400 bg-purple-500/10" },
            { icon: Calendar, title: "Appointment Booking", desc: "Seamless scheduling with double-booking prevention and real-time availability.", color: "text-cyan-400 bg-cyan-500/10" },
            { icon: FileText, title: "E-Prescriptions", desc: "Digital prescriptions with PDF generation and full medical history timeline.", color: "text-emerald-400 bg-emerald-500/10" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-white/[0.06] bg-[#0F1629]/80 p-6 hover:border-white/10 hover:bg-[#0F1629] transition-all group"
            >
              <div className={`inline-flex rounded-lg p-2.5 mb-4 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-slate-500 border-t border-white/[0.06]">
        SmartClinic &copy; {new Date().getFullYear()} &mdash; AI Clinic Management SaaS
      </footer>
    </div>
  );
}
