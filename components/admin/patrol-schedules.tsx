"use client";

import * as React from "react";
import { Calendar, Clock, MapPin, CheckCircle2, Filter, RotateCcw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { guards } from "@/lib/data/guards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ScheduleFilter = "all" | "assigned" | "active" | "off";

const statusColors = {
  "on-duty": "bg-green-500/15 text-green-400",
  "off-duty": "bg-gray-500/15 text-gray-400",
  "on-break": "bg-yellow-500/15 text-yellow-400",
};

const schedules = [
  {
    id: "SCH-001",
    guard: "Emmanuel N.",
    zone: "Kinyinya - Zone A",
    shift: "Morning",
    time: "06:00 - 14:00",
    status: "assigned",
  },
  {
    id: "SCH-002",
    guard: "Claude U.",
    zone: "Remera - Zone B",
    shift: "Morning",
    time: "06:00 - 14:00",
    status: "active",
  },
  {
    id: "SCH-003",
    guard: "Jean Bosco H.",
    zone: "Kacyiru - Zone C",
    shift: "Afternoon",
    time: "14:00 - 22:00",
    status: "assigned",
  },
  {
    id: "SCH-004",
    guard: "Patrick N.",
    zone: "Bumbogo - Zone D",
    shift: "Night",
    time: "22:00 - 06:00",
    status: "assigned",
  },
  {
    id: "SCH-005",
    guard: "Marie Claire U.",
    zone: "Gisozi - Zone E",
    shift: "Morning",
    time: "06:00 - 14:00",
    status: "off",
  },
];

export function PatrolSchedules() {
  const [filter, setFilter] = React.useState<ScheduleFilter>("all");

  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === "all") return true;
    if (filter === "assigned") return schedule.status === "assigned";
    if (filter === "active") return schedule.status === "active";
    return schedule.status === "off";
  });

  const metrics = {
    total: schedules.length,
    assigned: schedules.filter((schedule) => schedule.status === "assigned").length,
    active: schedules.filter((schedule) => schedule.status === "active").length,
    available: guards.filter((guard) => guard.status !== "off-duty").length,
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5 text-emerald-600" /> Patrol Schedules
            </CardTitle>
            <CardDescription className="text-gray-600">
              A UI-only schedule board for shift assignments, active coverage, and handoff visibility.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wide text-gray-600">
              <Users className="mr-1 h-3 w-3" /> {metrics.available} guards available
            </Badge>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[10px] uppercase tracking-wide text-blue-700">
              <Clock className="mr-1 h-3 w-3" /> {metrics.assigned} assigned
            </Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] uppercase tracking-wide text-emerald-700">
              <CheckCircle2 className="mr-1 h-3 w-3" /> {metrics.active} active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 lg:p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total shifts", value: metrics.total, tone: "text-gray-900" },
            { label: "Assigned", value: metrics.assigned, tone: "text-blue-600" },
            { label: "Active", value: metrics.active, tone: "text-emerald-600" },
            { label: "Available guards", value: metrics.available, tone: "text-gray-900" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-slate-50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className={cn("mt-1 text-2xl font-bold", item.tone)}>{item.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as ScheduleFilter)}>
          <TabsList className="grid h-11 w-full grid-cols-4 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="all" className="rounded-xl text-xs">All shifts</TabsTrigger>
            <TabsTrigger value="assigned" className="rounded-xl text-xs">Assigned</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl text-xs">Active</TabsTrigger>
            <TabsTrigger value="off" className="rounded-xl text-xs">Off duty</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-500" />
            <span>Showing {filteredSchedules.length} schedule cards</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-600">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset view
          </Button>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm font-medium text-gray-900">No schedules match this filter</p>
            <p className="mt-1 text-xs text-gray-500">Try another tab or switch back to all shifts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={schedule.status === "active" ? "default" : schedule.status === "assigned" ? "secondary" : "outline"}
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      schedule.status === "active" && "bg-emerald-600 text-white hover:bg-emerald-600",
                      schedule.status === "assigned" && "border-blue-200 bg-blue-50 text-blue-700",
                      schedule.status === "off" && "border-gray-200 bg-gray-50 text-gray-600"
                    )}
                  >
                    {schedule.status === "active" && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                    {schedule.shift}
                  </Badge>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {schedule.time}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{schedule.guard}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {schedule.zone}
                  </div>
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-gray-600">
                    {schedule.status === "active"
                      ? "Currently on duty and visible in the assignment board."
                      : schedule.status === "assigned"
                      ? "Ready to start at the scheduled handoff time."
                      : "Shift is currently inactive and available for reassignment."}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {schedule.status === "active" && (
                    <Button variant="outline" size="sm" className="h-8 flex-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Complete
                    </Button>
                  )}
                  {schedule.status === "assigned" && (
                    <Button size="sm" className="h-8 flex-1 bg-blue-600 hover:bg-blue-700">
                      <Clock className="mr-1.5 h-3.5 w-3.5" /> Start Shift
                    </Button>
                  )}
                  {schedule.status === "off" && (
                    <Button variant="outline" size="sm" className="h-8 flex-1 border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" /> Reassign
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}