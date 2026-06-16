"use client";

// ============================================================================
// useGuardLocation — Custom hook
// Grabs the guard's GPS from the browser and uploads it every 30s via
// POST /guard/location
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { uploadGuardLocation } from "@/lib/services/location-service";
import { useAuthStore } from "@/lib/auth/auth-store";

export interface GuardLocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isTracking: boolean;
}

const UPLOAD_INTERVAL_MS = 30_000; // 30 seconds

export function useGuardLocation(): GuardLocationState {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUnmountedRef = useRef(false);
  const userId = useAuthStore((state) => state.user?.id);

  // Fetch the current GPS position and forward it to the backend
  const fetchAndUpload = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    if (!userId) {
      setError("No authenticated guard to track.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (isUnmountedRef.current) return;

        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setIsTracking(true);
        setError(null);

        try {
          await uploadGuardLocation(userId, latitude, longitude);
        } catch (uploadErr) {
          // Don't kill tracking if a single upload fails — just log it
          console.error("[useGuardLocation] Upload failed:", uploadErr);
        }
      },
      (geoError) => {
        if (isUnmountedRef.current) return;
        setIsTracking(false);
        setError(geoError.message || "Unable to retrieve location.");
        console.warn("[useGuardLocation] Geolocation error:", geoError.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    isUnmountedRef.current = false;

    // First upload immediately on mount
    fetchAndUpload();

    // Then repeat every 30 seconds
    intervalRef.current = setInterval(fetchAndUpload, UPLOAD_INTERVAL_MS);

    return () => {
      isUnmountedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { lat, lng, error, isTracking };
}
