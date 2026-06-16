"use client";

import { useEffect, useState } from "react";
import { Camera, AlertCircle, ShieldCheck, MapPin as MapPinIcon, Users, Phone, Loader2 } from "lucide-react";
import { GuardTrackerMap } from "@/components/admin/guard-tracker-map";
import { useAuthStore } from "@/lib/auth/auth-store";
import { listGuards, BackendUser } from "@/lib/services/user-service";
import { getOnDutyGuards, OnDutyGuard } from "@/lib/services/shift-service";
import { getAuthErrorMessage } from "@/lib/services/auth-service";

export default function AdminDashboardPage() {
  const adminName = useAuthStore((state) => state.user?.name);

  const [guards, setGuards] = useState<BackendUser[]>([]);
  const [onDutyGuards, setOnDutyGuards] = useState<OnDutyGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isUnmounted = false;
    (async () => {
      try {
        const [guardList, onDuty] = await Promise.all([listGuards(), getOnDutyGuards()]);
        if (!isUnmounted) {
          setGuards(guardList);
          setOnDutyGuards(onDuty);
        }
      } catch (err) {
        if (!isUnmounted) setError(getAuthErrorMessage(err));
      } finally {
        if (!isUnmounted) setLoading(false);
      }
    })();
    return () => {
      isUnmounted = true;
    };
  }, []);

  const onDutyNames = new Set(onDutyGuards.map((g) => g.guard_name));
  const onDutyPercent = guards.length > 0 ? Math.round((onDutyGuards.length / guards.length) * 100) : 0;

  const kpis = [
    { title: "Total Guards", value: guards.length, change: undefined, icon: Users, color: "bg-blue-500" },
    { title: "Guards on Duty", value: onDutyGuards.length, change: `${onDutyPercent}% active`, icon: ShieldCheck, color: "bg-emerald-500" },
    { title: "Active Incidents", value: 2, change: "+1 new", icon: AlertCircle, color: "bg-orange-500" },
    { title: "Cameras Online", value: "3/4", change: "-1 offline", icon: Camera, color: "bg-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Good morning{adminName ? `, ${adminName}` : ""} <span className="text-emerald-600">👋</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here&apos;s your security operations overview for today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              System Active
            </div>
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4" />
              Kigali, Rwanda
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.title} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    {kpi.change && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.change.startsWith("+") ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {kpi.change}
                      </span>
                    )}
                  </div>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Map & Analytics */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live Guard Tracker Map */}
            <GuardTrackerMap />

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold mb-4 text-gray-900">Incident Analytics</h2>
              <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-400">Charts Component</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Alert Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Active Alerts</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 bg-amber-50 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">Suspicious activity detected</p>
                      <p className="text-xs text-gray-500 mt-0.5">Sector 4 • 10 min ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guard List */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Guard Status</h3>
              {loading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                </div>
              ) : error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : guards.length === 0 ? (
                <p className="text-xs text-gray-500">No guards added yet.</p>
              ) : (
                <div className="space-y-2">
                  {guards.map((guard) => {
                    const isOnDuty = onDutyNames.has(guard.name);
                    const statusLabel = !guard.is_active ? "Deactivated" : isOnDuty ? "On Duty" : "Off Duty";
                    const dotColor = !guard.is_active ? "bg-gray-400" : isOnDuty ? "bg-green-500" : "bg-gray-300";
                    return (
                      <div key={guard.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                          <span className="text-sm text-gray-700">{guard.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200 p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-700">
                <Phone className="h-4 w-4" /> Emergency Contacts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Police</span>
                  <span className="font-medium text-gray-900">112</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fire</span>
                  <span className="font-medium text-gray-900">112</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ambulance</span>
                  <span className="font-medium text-gray-900">912</span>
                </div>
                <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Emergency Alert
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patrol Logs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4 text-gray-900">Recent Patrol Logs</h2>
          <div className="space-y-2">
            {[
              { time: "10:30 AM", guard: "Emmanuel N.", sector: "Kinyinya", status: "Completed" },
              { time: "09:15 AM", guard: "Jean K.", sector: "Remera", status: "In Progress" },
              { time: "08:00 AM", guard: "Patrick M.", sector: "Gisozi", status: "Completed" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <MapPinIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.guard}</p>
                    <p className="text-xs text-gray-500">{log.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{log.time}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    log.status === "Completed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
