"use client";

import { GuardManager } from "@/components/admin/guard-manager";

export default function GuardsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Guard Management</h1>
          <p className="text-sm text-gray-600">Manage guards, assign them to shifts, and keep editing simple.</p>
        </div>
      </div>

      <GuardManager />
    </div>
  );
}
