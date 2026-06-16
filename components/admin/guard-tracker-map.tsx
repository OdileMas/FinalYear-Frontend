"use client";

// ============================================================================
// GuardTrackerMap — Admin live guard location map
// Polls GET /guards/locations every 7s and plots one marker per on-duty guard
// ============================================================================

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Radio, Loader2 } from "lucide-react";
import { getGuardLocations } from "@/lib/services/location-service";
import { GuardLocationResponse } from "@/types/auth";

const GuardsLeafletMap = dynamic(() => import("./guards-leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-72 bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
    </div>
  ),
});

const POLL_INTERVAL_MS = 7_000;

export function GuardTrackerMap() {
  const [guards, setGuards] = useState<GuardLocationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    const poll = async () => {
      try {
        const data = await getGuardLocations();
        console.log("[GuardTrackerMap] Fetched guard locations44444444444444444444444:", data);
        if (!isUnmounted) {
          setGuards(data);
          setError(null);
        }
      } catch (err) {
        if (!isUnmounted) {
          setError(err instanceof Error ? err.message : "Failed to load guard locations.");
        }
      } finally {
        if (!isUnmounted) setLoading(false);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      isUnmounted = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900">
          <MapPin className="h-5 w-5 text-emerald-500" />
          Live Guard Tracking
        </h2>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium">
          <Radio className="h-3 w-3" />
          {guards.length} on duty
        </div>
      </div>

      <div className="h-72 relative">
        {loading ? (
          <div className="h-full bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-100 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full bg-red-50 flex flex-col items-center justify-center gap-1">
            <p className="text-sm font-medium text-red-600">Couldn't load guard locations</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : guards.length === 0 ? (
          <div className="h-full bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-100 flex flex-col items-center justify-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <MapPin className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No guards on duty right now</p>
          </div>
        ) : (
          <GuardsLeafletMap guards={guards} />
        )}
      </div>
    </div>
  );
}
