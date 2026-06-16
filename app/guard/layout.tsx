"use client";

import * as React from "react";
import { LayoutDashboard, Users, MapPin } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { useSidebarStore } from "@/lib/store";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { cn } from "@/lib/utils";

interface GuardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/guard",
  },
  {
    icon: MapPin,
    label: "Patrol",
    href: "/guard/patrol",
  },
  {
    icon: Users,
    label: "Team",
    href: "/guard/team",
  },
];

export default function GuardLayout({ children }: GuardLayoutProps) {
  const { isOpen } = useSidebarStore();
  const { user, isAuthorized } = useRequireAuth("GUARD");

  if (!isAuthorized || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar navItems={navItems} userRole={user.role} userName={user.name} />

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
