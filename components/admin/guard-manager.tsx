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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Plus, ShieldCheck, UserRoundPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import { listGuards, createGuard, updateUser, deactivateUser, BackendUser } from "@/lib/services/user-service";
import { listShifts, assignGuardToShift, ShiftResponse } from "@/lib/services/shift-service";
import { getAuthErrorMessage } from "@/lib/services/auth-service";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function GuardManager() {
  const [guards, setGuards] = useState<BackendUser[]>([]);
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isGuardDialogOpen, setIsGuardDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGuardId, setEditingGuardId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignGuard, setAssignGuard] = useState<BackendUser | null>(null);
  const [assignShiftId, setAssignShiftId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(todayISO());
  const [assignEndDate, setAssignEndDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let isUnmounted = false;
    (async () => {
      try {
        const [guardList, shiftList] = await Promise.all([listGuards(), listShifts()]);
        if (!isUnmounted) {
          setGuards(guardList);
          setShifts(shiftList);
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
    total: guards.length,
    active: guards.filter((guard) => guard.is_active).length,
  };

  const openCreateGuard = () => {
    setIsEditing(false);
    setEditingGuardId("");
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setIsActive(true);
    setIsGuardDialogOpen(true);
  };

  const openEditGuard = (guard: BackendUser) => {
    setIsEditing(true);
    setEditingGuardId(guard.id);
    setName(guard.name);
    setEmail(guard.email);
    setPassword("");
    setPhone(guard.phone ?? "");
    setIsActive(guard.is_active);
    setIsGuardDialogOpen(true);
  };

  const saveGuard = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEditing) {
        const updated = await updateUser(editingGuardId, {
          name: name.trim(),
          phone: phone.trim() || null,
          is_active: isActive,
        });
        setGuards((current) => current.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        if (!email.trim() || !password.trim()) return;
        const created = await createGuard({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || null,
        });
        setGuards((current) => [created, ...current]);
      }
      setIsGuardDialogOpen(false);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openAssignDialog = (guard: BackendUser) => {
    setAssignGuard(guard);
    setAssignShiftId("");
    setAssignStartDate(todayISO());
    setAssignEndDate("");
    setIsAssignDialogOpen(true);
  };

  const submitAssignment = async () => {
    if (!assignGuard || !assignShiftId || !assignStartDate) return;
    setAssigning(true);
    try {
      await assignGuardToShift(assignShiftId, {
        user_id: assignGuard.id,
        start_date: assignStartDate,
        end_date: assignEndDate || null,
      });
      toast.success(`${assignGuard.name} assigned to shift.`);
      setIsAssignDialogOpen(false);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const deactivateGuard = async (guard: BackendUser) => {
    if (!window.confirm(`Deactivate ${guard.name}?`)) return;
    try {
      await deactivateUser(guard.id);
      setGuards((current) => current.map((g) => (g.id === guard.id ? { ...g, is_active: false } : g)));
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
            Guard Registry
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage guards</h1>
            <p className="text-sm text-gray-600">Add guards to your organization and assign them to shifts.</p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreateGuard}>
          <Plus className="mr-2 h-4 w-4" /> Add guard
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total guards</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active guards</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{metrics.active}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg text-gray-900">Guards table</CardTitle>
          <CardDescription className="text-gray-600">Assign a guard to a shift, edit their details, or deactivate the account.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : guards.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">No guards yet. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0" style={{ minWidth: 900 }}>
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Guard</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Contact</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Status</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.map((guard) => (
                    <tr key={guard.id} className="align-top">
                      <td className="border-b border-gray-100 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{guard.name}</p>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4 text-sm text-gray-700">
                        <div className="space-y-1">
                          <p>{guard.email}</p>
                          <p className="text-xs text-gray-500">{guard.phone ?? "No phone on file"}</p>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4">
                        <Badge variant="outline" className={cn("border text-[10px] uppercase tracking-wide", guard.is_active ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700")}>
                          {guard.is_active ? "Active" : "Deactivated"}
                        </Badge>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => openAssignDialog(guard)} disabled={shifts.length === 0}>
                            <UserRoundPlus className="mr-2 h-4 w-4" /> Assign shift
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-200 bg-white" onClick={() => openEditGuard(guard)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          {guard.is_active && (
                            <Button variant="outline" size="sm" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => deactivateGuard(guard)}>
                              <UserX className="mr-2 h-4 w-4" /> Deactivate
                            </Button>
                          )}
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

      {/* Create / Edit guard */}
      <Dialog open={isGuardDialogOpen} onOpenChange={setIsGuardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit guard" : "Add guard"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update this guard's details." : "Create a new guard account tied to your organization."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guard-name">Full name</Label>
                <Input id="guard-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Emmanuel Nsabimana" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guard-phone">Phone</Label>
                <Input id="guard-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+250..." />
              </div>
            </div>

            {!isEditing && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guard-email">Email</Label>
                  <Input id="guard-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="guard@irondo.rw" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guard-password">Password</Label>
                  <Input id="guard-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Account active</p>
                  <p className="text-xs text-gray-500">Deactivated guards can&apos;t log in or be assigned to shifts.</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-gray-200 bg-white" onClick={() => setIsGuardDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={saveGuard} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save changes" : "Create guard"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign shift */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign guard to shift</DialogTitle>
            <DialogDescription>Pick the shift {assignGuard?.name} should be linked to.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Selected guard</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{assignGuard?.name}</p>
              <p className="text-xs text-gray-500">{assignGuard?.email}</p>
            </div>

            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={assignShiftId} onValueChange={setAssignShiftId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a shift" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assign-start">Start date</Label>
                <Input id="assign-start" type="date" value={assignStartDate} onChange={(event) => setAssignStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-end">End date</Label>
                <Input id="assign-end" type="date" value={assignEndDate} onChange={(event) => setAssignEndDate(event.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-gray-200 bg-white" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={submitAssignment} disabled={assigning || !assignShiftId}>
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign shift"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
