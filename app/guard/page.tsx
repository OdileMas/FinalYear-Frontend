"use client";

import * as React from "react";
import {
  Eye,
  AlertCircle,
  Phone,
  MapPin,
  Send,
  Bell,
  Shield,
  Navigation,
  WifiOff,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGuardLocation } from "@/lib/hooks/useGuardLocation";

// ---------------------------------------------------------------------------
// Mini self-map — loaded dynamically so Leaflet (browser-only) doesn't crash SSR
// ---------------------------------------------------------------------------
const GuardSelfMap = dynamic(() => import("@/components/guard/guard-self-map"), {
  ssr: false,
  loading: () => (
    <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
    </div>
  ),
});

export default function GuardDashboardPage() {
  const { lat, lng, error, isTracking } = useGuardLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900">On Duty</h1>
              <p className="text-xs text-gray-600">Emmanuel Nsabimana • Kinyinya Sector</p>
            </div>
          </div>

          {/* GPS Tracking Status Badge */}
          {isTracking ? (
            <div
              id="gps-active-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium border border-emerald-200"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>GPS Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ) : error ? (
            <div
              id="gps-error-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium border border-red-200"
            >
              <WifiOff className="h-3.5 w-3.5" />
              GPS Unavailable
            </div>
          ) : (
            <div
              id="gps-loading-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Locating…
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Report Incident", color: "bg-red-500 hover:bg-red-600" },
              { label: "Request Backup", color: "bg-amber-500 hover:bg-amber-600" },
              { label: "Submit Patrol", color: "bg-blue-500 hover:bg-blue-600" },
              { label: "Send Report", color: "bg-emerald-500 hover:bg-emerald-600" },
            ].map((action, i) => (
              <button
                key={i}
                className={`${action.color} text-white py-2.5 rounded-xl text-sm font-medium transition-colors`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { title: "Today's Incidents", value: 4, icon: AlertCircle, color: "bg-orange-500" },
            { title: "Responded", value: 3, icon: Eye, color: "bg-green-500" },
            { title: "Calls", value: 1, icon: Phone, color: "bg-red-500" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Alerts + Duty Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Alerts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                <AlertCircle className="h-4 w-4 text-orange-500" /> Active Alerts
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Real-time alerts from AI detection and patrol reports</p>
            </div>
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl border border-gray-100 bg-amber-50 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Motion detected - Sector 4</p>
                    <p className="text-xs text-gray-500 mt-0.5">5 min ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duty Status & Shift Timer */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Duty Status</h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="text-sm font-medium text-green-700">On Duty</span>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Shift Timer</h3>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-emerald-600">3h 42m</div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm text-gray-600 mt-2">Started: 08:00 AM</p>
                <p className="text-sm text-gray-600">Ends: 05:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patrol Route + Live Position */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
              <MapPin className="h-4 w-4 text-emerald-500" /> Patrol Route
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Assigned checkpoints for today</p>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Self-position map */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Navigation className="h-3 w-3" />
                Your Live Position
                {isTracking && (
                  <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-medium">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </h3>

              {/* Render self-map or error/loading states */}
              {lat !== null && lng !== null ? (
                <GuardSelfMap lat={lat} lng={lng} />
              ) : error ? (
                <div className="h-40 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center gap-2">
                  <WifiOff className="h-6 w-6 text-red-400" />
                  <p className="text-xs text-red-500 text-center max-w-[180px]">{error}</p>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                </div>
              )}

              {/* GPS coordinates display */}
              {lat !== null && lng !== null && (
                <p className="text-[10px] text-gray-400 mt-1.5 font-mono text-center">
                  {lat.toFixed(5)}, {lng.toFixed(5)} · uploading every 30s
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Activity</h3>
              <div className="space-y-2">
                {[
                  { time: "10:30 AM", action: "Checkpoint A verified", sector: "Kinyinya" },
                  { time: "09:45 AM", action: "Patrol route updated", sector: "Kacyiru" },
                  { time: "08:20 AM", action: "Shift started", sector: "Kinyinya" },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.sector}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HQ Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
              <Bell className="h-4 w-4 text-blue-500" /> Recent Alerts from HQ
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { type: "Dispatch Order", desc: "Respond to Sector 15 north perimeter", time: "10 min ago", unread: true },
              { type: "Shift Change", desc: "Morning handoff at 14:00", time: "1 hr ago", unread: false },
              { type: "Equipment Update", desc: "Camera firmware v2.4.1 ready", time: "3 hrs ago", unread: false },
              { type: "Incident Report", desc: "INC-003 resolved - file closing notes", time: "5 hrs ago", unread: false },
            ].map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                  !alert.unread ? "bg-emerald-50/50" : ""
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.type}</p>
                  <p className="text-xs text-gray-500 truncate">{alert.desc}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{alert.time}</span>
                {!alert.unread && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-medium">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}