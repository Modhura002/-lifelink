'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SosStatusData {
  emergencyId: string;
  status: string;
  severity: number;
  city: string;
  description: string | null;
  patientLatitude: number;
  patientLongitude: number;
  assignedDriverId: string | null;
  assignedAt: string | null;
  assignedDriver: {
    name: string | null;
    phone: string | null;
    vehicle: string | null;
  } | null;
  hospitalId: string | null;
  hospitalName: string | null;
  hospitalAddress: string | null;
  hospitalPhone: string | null;
  timeline: { id: string; event: string; description?: string; timestamp: string }[];
  elapsedSeconds: number;
  createdAt: string;
}

const POLL_INTERVAL = 3000;

export function useSosStatus(emergencyId: string | null) {
  const [data, setData] = useState<SosStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeIdRef = useRef(emergencyId);

  // Keep the ref in sync
  useEffect(() => {
    activeIdRef.current = emergencyId;
  }, [emergencyId]);

  const fetchStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/sos/status?emergencyId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json: SosStatusData = await res.json();
      // Only set state if this is still the active emergency
      if (activeIdRef.current === id) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (activeIdRef.current === id) {
        setError((err as Error).message);
      }
    }
  }, []);

  useEffect(() => {
    // Cleanup previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!emergencyId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Initial fetch
    setLoading(true);
    fetchStatus(emergencyId).finally(() => setLoading(false));

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchStatus(emergencyId);
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [emergencyId, fetchStatus]);

  return { data, loading, error };
}
