"use client";

import { incidents } from "@/lib/data/incidents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, ShieldAlert, XCircle, CheckCircle2, Eye, MapPin, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const severityIcons = {
  low: AlertCircle,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: XCircle,
};

const severityConfig = {
  low: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600" },
  high: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-600" },
  critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-600" },
};

const statusConfig = {
  active: { color: "bg-red-100 text-red-700 border-red-200" },
  investigating: { color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved: { color: "bg-green-100 text-green-700 border-green-200" },
  "false-alarm": { color: "bg-gray-100 text-gray-600 border-gray-200" },
};

export default function IncidentsPage() {
  const activeCount = incidents.filter((i) => i.status === "active").length;
  const investigatingCount = incidents.filter((i) => i.status === "investigating").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Incident Reports</h1>
          <p className="text-sm text-gray-600">Review and manage all security incidents</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" /> Report Incident
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {activeCount} Active
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {investigatingCount} Investigating
        </Badge>
      </div>

      {/* Incident Cards */}
      <div className="space-y-3 mb-6">
        {incidents.map((incident) => {
          const SeverityIcon = severityIcons[incident.severity];
          const style = severityConfig[incident.severity];
          const isResolved = incident.status === "resolved" || incident.status === "false-alarm";

          return (
            <Card
              key={incident.id}
              className={cn("border", style.border, isResolved ? "opacity-70" : "")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-white border", style.border)}>
                      <SeverityIcon className={cn("h-5 w-5", style.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{incident.type}</p>
                        <Badge variant="outline" className={cn("text-[9px] border", style.bg, style.text)}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </span>
                        <span>•</span>
                        <span>{incident.sector}</span>
                        <span>•</span>
                        <span>{new Date(incident.reportedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px] border", statusConfig[incident.status].color)}>
                    {incident.status.replace("-", " ")}
                  </Badge>
                </div>

                {!isResolved && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> View Details
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Resolved
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(["active", "investigating", "resolved", "false-alarm"] as const).map((status) => (
          <Card key={status} className="border-gray-200 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-medium">{status.replace("-", " ")}</p>
                <p className="text-2xl font-bold text-gray-900">{incidents.filter((i) => i.status === status).length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                {status === "active" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {status === "investigating" && <ShieldAlert className="h-5 w-5 text-blue-500" />}
                {status === "resolved" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {status === "false-alarm" && <XCircle className="h-5 w-5 text-gray-500" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
