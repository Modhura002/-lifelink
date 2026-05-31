'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SosAlert {
  emergencyId: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  patientBloodGroup: string | null;
  severity: number;
  pinCode: string | null;
  city: string;
  country: string | null;
  matchTier: number | null;
  description: string | null;
  location: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  dismissed?: boolean;
}

export interface DriverInfo {
  pinCode: string | null;
  city: string | null;
  country: string | null;
}

interface UseSosStreamOptions {
  isOnline: boolean;
  onAssigned?: (emergencyId: string) => void;
  onSetupRequired?: () => void;
  onDriverInfo?: (info: DriverInfo) => void;
}

export function useSosStream({ isOnline, onAssigned, onSetupRequired, onDriverInfo }: UseSosStreamOptions) {
  const [pendingAlerts, setPendingAlerts] = useState<SosAlert[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const dismissAlert = useCallback((emergencyId: string) => {
    setPendingAlerts((prev) => prev.filter((a) => a.emergencyId !== emergencyId));
  }, []);

  const onAssignedRef = useRef(onAssigned);
  useEffect(() => { onAssignedRef.current = onAssigned; }, [onAssigned]);

  const onSetupRequiredRef = useRef(onSetupRequired);
  useEffect(() => { onSetupRequiredRef.current = onSetupRequired; }, [onSetupRequired]);

  const onDriverInfoRef = useRef(onDriverInfo);
  useEffect(() => { onDriverInfoRef.current = onDriverInfo; }, [onDriverInfo]);

  useEffect(() => {
    if (!isOnline) {
      esRef.current?.close();
      esRef.current = null;
      setPendingAlerts((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const url = `/api/driver/sos-stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'SETUP_REQUIRED') {
          onSetupRequiredRef.current?.();
          return;
        }

        if (data.type === 'DRIVER_INFO') {
          onDriverInfoRef.current?.({
            pinCode: data.pinCode,
            city: data.city,
            country: data.country,
          });
          return;
        }

        if (data.type === 'SOS') {
          setPendingAlerts((prev) => {
            if (prev.some((a) => a.emergencyId === data.emergencyId)) return prev;
            return [
              {
                emergencyId: data.emergencyId,
                patientId: data.patientId,
                patientName: data.patientName,
                patientPhone: data.patientPhone ?? null,
                patientBloodGroup: data.patientBloodGroup ?? null,
                severity: data.severity,
                pinCode: data.pinCode ?? null,
                city: data.city,
                country: data.country ?? null,
                matchTier: data.matchTier ?? null,
                description: data.description ?? null,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                createdAt: data.createdAt,
              },
              ...prev,
            ];
          });
        }

        if (data.type === 'ASSIGNED') {
          setPendingAlerts((prev) =>
            prev.filter((a) => a.emergencyId !== data.emergencyId)
          );
          onAssignedRef.current?.(data.emergencyId);
        }
      } catch {
        // ignore malformed JSON
      }
    };

    es.onerror = () => {};

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [isOnline]);

  return { pendingAlerts, dismissAlert };
}
