"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileWarning,
  Calendar,
  Camera,
  Settings,
  Menu,
  X,
  MapPin,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSidebarStore } from "@/lib/store";
import { useThemeStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth/auth-store";

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  userRole: string;
  userName: string;
}

export function Sidebar({ navItems, userRole, userName }: SidebarProps) {
  const { isOpen, toggle } = useSidebarStore();
  const pathname = usePathname();
  const { isDark, toggle: toggleTheme } = useThemeStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => useSidebarStore.getState().close()}
        />
      )}

        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
            isOpen ? "w-64" : "w-18"
          )}
        >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0 bg-white transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-sm leading-tight text-gray-900">
                  Irondo
                </h2>
                <p className="text-[10px] text-gray-500">
                  Security System
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={toggle}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col overflow-y-auto py-2">
          <div className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={cn(
                     "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                     isOpen ? "justify-start" : "justify-center px-2",
                     isActive
                         ? "bg-emerald-50 text-emerald-700"
                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                   )}
                 >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          variant={
                            item.badge > 5 ? "destructive" : "secondary"
                          }
                          className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        {isOpen && (
          <div className="p-3 border-t border-gray-200 shrink-0 bg-white transition-colors duration-300">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-8 w-8 bg-emerald-100">
                <AvatarFallback className="text-xs text-emerald-700">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {userRole}
                </p>
              </div>
               <div className="flex flex-col gap-1">
                 <Link href="/auth/login" title="Logout">
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
                     onClick={() => useAuthStore.getState().clearSession()}
                   >
                     <LogOut className="h-4 w-4" />
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        )}

         {/* Mobile toggle button */}
         {!isOpen && (
           <div className="p-2 border-t border-gray-200 bg-white transition-colors duration-300">
             <Button
               variant="ghost"
               size="icon"
               className="h-8 w-8 mx-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100"
               onClick={toggle}
             >
               <Menu className="h-4 w-4" />
             </Button>
           </div>
         )}
      </aside>
    </>
  );
}