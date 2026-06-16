"use client";

import * as React from "react";
import { LayoutDashboard, Users, FileWarning, Calendar, Camera, Settings, Clock3 } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { useSidebarStore } from "@/lib/store";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Guards", href: "/admin/guards" },
  { icon: Clock3, label: "Shifts", href: "/admin/shifts" },
  { icon: FileWarning, label: "Incidents", href: "/admin/incidents" },
  { icon: Calendar, label: "Patrol", href: "/admin/patrol" },
  { icon: Camera, label: "Cameras", href: "/admin/cameras" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isOpen } = useSidebarStore();
  const { user, isAuthorized } = useRequireAuth("HEAD_OF_SECURITY");

  if (!isAuthorized || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white transition-colors duration-300">
      <Sidebar navItems={adminNavItems} userRole={user.role} userName={user.name} />

      <div
        className={cn(
          "flex flex-col h-screen transition-all duration-300",
          isOpen ? "lg:pl-64" : "lg:pl-[72px]"
        )}
      >
        <Navbar userRole={user.role} userName={user.name} onMenuClick={() => {}} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
