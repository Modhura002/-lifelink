'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  pinCode: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; pinCode: string | null; country: string | null }> {
  try {
    const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'LifeLink-Emergency-App' },
    });
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    const addr = data?.address;
    
    const city = (
      addr?.city ||
      addr?.town ||
      addr?.suburb ||
      addr?.village ||
      addr?.county ||
      addr?.state_district ||
      addr?.state ||
      'Unknown'
    );
    
    const pinCode = addr?.postcode || null;
    const country = addr?.country || null;
    
    return { city, pinCode, country };
  } catch {
    return { city: 'Unknown', pinCode: null, country: null };
  }
}

export function useGeolocation(): GeoLocation & { refresh: () => void } {
  const [state, setState] = useState<GeoLocation>({
    latitude: 0,
    longitude: 0,
    city: 'Unknown',
    pinCode: null,
    country: null,
    loading: true,
    error: null,
  });

  const detect = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Geolocation not supported',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { city, pinCode, country } = await reverseGeocode(latitude, longitude);
        setState({ latitude, longitude, city, pinCode, country, loading: false, error: null });
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message,
        }));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { ...state, refresh: detect };
}
