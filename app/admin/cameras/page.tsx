"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Video, Wifi, WifiOff, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const cameras = [
  { id: 1, name: "Main Gate", sector: "Kinyinya", status: "online", feed: "Front Entrance" },
  { id: 2, name: "Parking Lot", sector: "Kinyinya", status: "online", feed: "Vehicle Area" },
  { id: 3, name: "Building A", sector: "Remera", status: "offline", feed: "No Signal" },
  { id: 4, name: "Perimeter North", sector: "Kacyiru", status: "online", feed: "North Fence" },
  { id: 5, name: "Perimeter South", sector: "Gisozi", status: "online", feed: "South Fence" },
  { id: 6, name: "Storage Yard", sector: "Bumbogo", status: "maintenance", feed: "Under Maintenance" },
];

export default function CamerasPage() {
  const online = cameras.filter((c) => c.status === "online").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Camera Management</h1>
          <p className="text-sm text-gray-600">Monitor and manage all surveillance cameras</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Camera
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Total Cameras</p>
              <p className="text-2xl font-bold text-gray-900">{cameras.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Online</p>
              <p className="text-2xl font-bold text-gray-900">{online}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <WifiOff className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Offline</p>
              <p className="text-2xl font-bold text-gray-900">{cameras.filter((c) => c.status === "offline").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Grid */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
            <Video className="h-5 w-5 text-blue-600" /> Live Camera Feeds
          </CardTitle>
          <CardDescription className="text-gray-600">Real-time surveillance cameras</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.map((cam) => (
              <div
                key={cam.id}
                className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-900 aspect-video group"
              >
                {/* Simulated camera feed placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">{cam.feed}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    cam.status === "online" ? "bg-green-500" :
                    cam.status === "offline" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
                  )} />
                  <span className="text-[10px] text-white font-medium uppercase">{cam.status}</span>
                </div>

                {/* Camera label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-sm font-medium text-white">{cam.name}</p>
                  <p className="text-xs text-gray-300">{cam.sector} Sector</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Video className="h-4 w-4 mr-2" /> View Feed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
