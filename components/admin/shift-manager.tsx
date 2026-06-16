"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Clock3, Loader2, Plus, ShieldCheck, Trash2, UserRoundPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  createShift,
  listShifts,
  deactivateShift,
  assignGuardToShift,
  listShiftGuards,
  unassignGuard,
  ShiftResponse,
  ShiftAssignmentResponse,
} from "@/lib/services/shift-service";
import { listGuards, BackendUser } from "@/lib/services/user-service";
import { getAuthErrorMessage } from "@/lib/services/auth-service";

// 0=Mon … 6=Sun, matching the backend's days_of_week convention exactly.
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toHHMMSS(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

function toHHMM(time: string) {
  return time.slice(0, 5);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ShiftManager() {
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [guards, setGuards] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("14:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [saving, setSaving] = useState(false);

  const [manageShift, setManageShift] = useState<ShiftResponse | null>(null);
  const [assignedGuards, setAssignedGuards] = useState<ShiftAssignmentResponse[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignGuardId, setAssignGuardId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(todayISO());
  const [assignEndDate, setAssignEndDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let isUnmounted = false;
    (async () => {
      try {
        const [shiftList, guardList] = await Promise.all([listShifts(), listGuards()]);
        if (!isUnmounted) {
          setShifts(shiftList);
          setGuards(guardList);
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

  const metrics = {
    total: shifts.length,
    active: shifts.filter((shift) => shift.is_active).length,
  };

  const openCreateDialog = () => {
    setName("");
    setStart("06:00");
    setEnd("14:00");
    setSelectedDays([0, 1, 2, 3, 4]);
    setIsCreateOpen(true);
  };

  const toggleDay = (day: number) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort()
    );
  };

  const saveShift = async () => {
    if (!name.trim() || !start || !end || selectedDays.length === 0) return;

    setSaving(true);
    try {
      const created = await createShift({
        name: name.trim(),
        shift_start: toHHMMSS(start),
        shift_end: toHHMMSS(end),
        days_of_week: selectedDays.length === 7 ? null : selectedDays,
      });
      setShifts((current) => [created, ...current]);
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeShift = async (shift: ShiftResponse) => {
    if (!window.confirm(`Deactivate ${shift.name}?`)) return;

    try {
      await deactivateShift(shift.id);
      setShifts((current) => current.filter((s) => s.id !== shift.id));
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  const openManageGuards = async (shift: ShiftResponse) => {
    setManageShift(shift);
    setAssignGuardId("");
    setAssignStartDate(todayISO());
    setAssignEndDate("");
    setAssignmentsLoading(true);
    try {
      const assignments = await listShiftGuards(shift.id);
      setAssignedGuards(assignments);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const submitAssignment = async () => {
    if (!manageShift || !assignGuardId || !assignStartDate) return;

    setAssigning(true);
    try {
      const assignment = await assignGuardToShift(manageShift.id, {
        user_id: assignGuardId,
        start_date: assignStartDate,
        end_date: assignEndDate || null,
      });
      setAssignedGuards((current) => [assignment, ...current]);
      setAssignGuardId("");
      setAssignEndDate("");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const removeAssignment = async (assignment: ShiftAssignmentResponse) => {
    try {
      await unassignGuard(assignment.id);
      setAssignedGuards((current) => current.filter((a) => a.id !== assignment.id));
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Shift Planning
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage shifts</h1>
            <p className="text-sm text-gray-600">Create shift patterns and assign guards to them.</p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add shift
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total shifts</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active shifts</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{metrics.active}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg text-gray-900">Shifts table</CardTitle>
          <CardDescription className="text-gray-600">Deactivating a shift soft-removes it; manage guards to assign or unassign coverage.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : shifts.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">No shifts yet. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0" style={{ minWidth: 800 }}>
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Shift</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Time</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Days</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Status</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="align-top">
                      <td className="border-b border-gray-100 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{shift.name}</p>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-emerald-500" />
                          <span>{toHHMM(shift.shift_start)} - {toHHMM(shift.shift_end)}</span>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(shift.days_of_week ?? [0, 1, 2, 3, 4, 5, 6]).map((day) => (
                            <span key={day} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {dayLabels[day]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4">
                        <Badge variant="outline" className={cn("border text-[10px] uppercase tracking-wide", shift.is_active ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700")}>
                          {shift.is_active ? "Active" : "Paused"}
                        </Badge>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => openManageGuards(shift)}>
                            <UserRoundPlus className="mr-2 h-4 w-4" /> Manage guards
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => removeShift(shift)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create shift */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add shift</DialogTitle>
            <DialogDescription>Create a shift pattern with times and active days.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shift-name">Shift name</Label>
              <Input id="shift-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Morning Shift" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shift-start">Start time</Label>
                <Input id="shift-start" type="time" value={start} onChange={(event) => setStart(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">End time</Label>
                <Input id="shift-end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
                <p className="text-xs text-gray-500">If end is earlier than start, it&apos;s treated as an overnight shift.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Active days</Label>
                <span className="text-xs text-gray-500">Choose one or more days</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dayLabels.map((day, index) => {
                  const selected = selectedDays.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        selected
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-gray-200 bg-white" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={saveShift} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create shift"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage guards */}
      <Dialog open={!!manageShift} onOpenChange={(open) => !open && setManageShift(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage guards — {manageShift?.name}</DialogTitle>
            <DialogDescription>Assign a guard to this shift or remove an existing assignment.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-end">
              <div className="space-y-2">
                <Label>Guard</Label>
                <Select value={assignGuardId} onValueChange={setAssignGuardId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a guard" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {guards.map((guard) => (
                      <SelectItem key={guard.id} value={guard.id}>
                        {guard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-start">Start date</Label>
                <Input id="assign-start" type="date" value={assignStartDate} onChange={(event) => setAssignStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-end">End date</Label>
                <Input id="assign-end" type="date" value={assignEndDate} onChange={(event) => setAssignEndDate(event.target.value)} />
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={submitAssignment} disabled={assigning || !assignGuardId}>
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Assigned guards</Label>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                </div>
              ) : assignedGuards.length === 0 ? (
                <p className="text-sm text-gray-500">No guards assigned to this shift yet.</p>
              ) : (
                <div className="space-y-2">
                  {assignedGuards.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-slate-50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{assignment.guard_name}</p>
                        <p className="text-xs text-gray-500">
                          {assignment.start_date} {assignment.end_date ? `→ ${assignment.end_date}` : "(ongoing)"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => removeAssignment(assignment)}>
                        <X className="mr-1 h-3.5 w-3.5" /> Unassign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
