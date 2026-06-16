"use client";

import { patrolCheckpoints } from "@/lib/data/patrol";
import { guards } from "@/lib/data/guards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, MapPin, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GuardTrackerMap } from "@/components/admin/guard-tracker-map";
import { PatrolSchedules } from "@/components/admin/patrol-schedules";

const statusConfig = {
  completed: { badge: "bg-green-100 text-green-700 border-green-200", icon: "text-green-500" },
  pending: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "text-yellow-500 animate-pulse" },
  missed: { badge: "bg-red-100 text-red-700 border-red-200", icon: "text-red-500" },
};

export default function PatrolPage() {
  const completed = patrolCheckpoints.filter((p) => p.status === "completed").length;
  const completionRate = Math.round((completed / patrolCheckpoints.length) * 100);

  return (
    <div className="p-6">
      <div className="mb-6">
        <PatrolSchedules />
      </div>

      {/* Live Guard Map — Phase 2 stub */}
      <div className="mb-6">
        <GuardTrackerMap />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Patrol Logs</h1>
        <p className="text-sm text-gray-600">Monitor patrol schedules and checkpoints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-[11px] text-gray-500 uppercase font-medium">Total Checkpoints</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patrolCheckpoints.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-[11px] text-gray-500 uppercase font-medium">Completion Rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completionRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-[11px] text-gray-500 uppercase font-medium">Active Guards</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{guards.filter((g) => g.status === "on-duty").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkpoint List */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                <Clock className="h-5 w-5 text-emerald-600" /> Today&apos;s Patrol Checkpoints
              </CardTitle>
              <CardDescription className="text-gray-600">Track scheduled and completed checkpoints</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-gray-100">
                  {patrolCheckpoints.map((checkpoint) => {
                    const guard = guards.find((g) => g.id === checkpoint.guardId);
                    return (
                      <div
                        key={checkpoint.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          checkpoint.status === "completed" ? "bg-green-500" :
                          checkpoint.status === "pending" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{checkpoint.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {checkpoint.sector} • {checkpoint.scheduledTime}
                            {guard && ` • ${guard.name.split(" ").slice(0,2).join(" ")}`}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn("border text-[10px] h-5 px-2", statusConfig[checkpoint.status].badge)}>
                          {checkpoint.status}
                        </Badge>
                        {checkpoint.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        {checkpoint.status === "missed" && (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Summary Chart Placeholder */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-blue-600" /> Status Overview
            </CardTitle>
            <CardDescription className="text-gray-600">Patrol completion statistics</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{completionRate}%</div>
              <p className="text-xs text-gray-500 uppercase font-medium">Completion Rate</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">{completed}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-gray-900">{patrolCheckpoints.filter((p) => p.status === "pending").length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Missed</span>
                  <span className="font-semibold text-gray-900">{patrolCheckpoints.filter((p) => p.status === "missed").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
