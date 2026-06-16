"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  Plus,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobileNavStore } from "@/lib/store";
import { useNotificationStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth/auth-store";

interface NavbarProps {
  userRole: string;
  userName: string;
  onMenuClick: () => void;
}

const adminQuickActions: { label: string; icon: React.ElementType; href: string }[] = [];

export function Navbar({ userRole, userName, onMenuClick }: NavbarProps) {
  const { count, readAll } = useNotificationStore();
  const { isOpen, toggle: toggleMobileNav } = useMobileNavStore();

  const roleLabel =
    userRole === "HEAD_OF_SECURITY" ? "Head of Security" : "Security Guard";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200 transition-colors duration-300">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={toggleMobileNav}
          >
            <User className="h-4 w-4" />
          </Button>

          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patrol logs or incidents..."
              className="pl-8 h-8 bg-gray-50 border-gray-200 focus:ring-1 focus:ring-emerald-500/50 text-gray-900 placeholder:text-gray-500 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Center - Quick actions for admin */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-md">
          {userRole === "HEAD_OF_SECURITY" &&
            adminQuickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <ActionIcon className="h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200">
              <DropdownMenuLabel className="font-medium text-gray-900 flex justify-between items-center">
                Notifications
                {count > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => readAll()} className="h-auto p-0 text-xs text-emerald-600 hover:text-emerald-700">Mark all read</Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <div className="max-h-[300px] overflow-y-auto">
                {count > 0 ? (
                  <>
                    <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3 hover:bg-gray-50 focus:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">New Incident Reported</p>
                      <p className="text-xs text-gray-500">Sector 4, Camera 2 detected unauthorized access.</p>
                      <span className="text-[10px] text-gray-400 mt-1">2 mins ago</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3 hover:bg-gray-50 focus:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Patrol Missed</p>
                      <p className="text-xs text-gray-500">Guard Emmanuel missed checkpoint at Gate B.</p>
                      <span className="text-[10px] text-gray-400 mt-1">15 mins ago</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1 bg-gray-200" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-full flex items-center gap-2 px-2 hover:bg-gray-100 transition-colors">
                <Avatar className="h-6 w-6 bg-emerald-100">
                  <AvatarFallback className="text-[10px] text-emerald-700">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="text-xs font-medium text-gray-900">{userName}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    {roleLabel}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900">{userName}</p>
                  <p className="text-xs leading-none text-gray-500">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50" asChild>
                <Link href="/admin/settings" className="flex items-center text-gray-700 w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Update Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50" asChild>
                <Link href="/admin/settings" className="flex items-center text-gray-700 w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50" asChild>
                <Link href="/auth/login" className="flex items-center w-full" onClick={() => useAuthStore.getState().clearSession()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2 bg-white border-b border-gray-100 transition-colors duration-300">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search patrol logs or incidents..."
            className="pl-8 h-8 bg-gray-50 text-sm border-gray-200 text-gray-900 placeholder:text-gray-500 transition-colors duration-300"
          />
        </div>
      </div>
    </header>
  );
}