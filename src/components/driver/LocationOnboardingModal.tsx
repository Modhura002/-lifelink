'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface LocationOnboardingModalProps {
  open: boolean;
  onSuccess: (data: { pinCode: string; city: string; country: string }) => void;
  onClose?: () => void;
  initialData?: { pinCode: string | null; city: string | null; country: string | null };
}

export default function LocationOnboardingModal({ open, onSuccess, onClose, initialData }: LocationOnboardingModalProps) {
  const [pinCode, setPinCode] = useState(initialData?.pinCode ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [country, setCountry] = useState(initialData?.country ?? '');
  
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Sync initial data when modal opens
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen && initialData) {
    setPinCode(initialData.pinCode ?? '');
    setCity(initialData.city ?? '');
    setCountry(initialData.country ?? '');
  }
  if (open !== lastOpen) setLastOpen(open);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Error', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const res = await fetch(url, { headers: { 'User-Agent': 'LifeLink-Emergency-App' } });
          const data = await res.json();
          const addr = data?.address;
          
          const detectedPin = addr?.postcode || '';
          const detectedCity = addr?.city || addr?.town || addr?.suburb || addr?.village || addr?.county || '';
          const detectedCountry = addr?.country || '';
          
          if (detectedPin) setPinCode(detectedPin);
          if (detectedCity) setCity(detectedCity);
          if (detectedCountry) setCountry(detectedCountry);

          if (detectedCity || detectedPin) {
            toast({ title: 'Location Found', description: `Detected ${detectedCity}, ${detectedCountry}.` });
          } else {
            toast({ title: 'Location Error', description: 'Could not fully determine your location.', variant: 'destructive' });
          }
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to reverse geocode.', variant: 'destructive' });
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        toast({ title: 'Permission Denied', description: 'Please allow location access or type manually.', variant: 'destructive' });
        setLoadingLocation(false);
      }
    );
  };

  const handleSave = async () => {
    if (!pinCode.trim() || !city.trim() || !country.trim()) {
      toast({ title: 'Required Fields', description: 'Please fill in PIN Code, City, and Country.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/driver/service-area', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode, city, country }),
      });

      if (!res.ok) throw new Error('Failed to save location');

      toast({ title: 'Service Area Set', description: `You are now receiving SOS broadcasts in ${city}.` });
      
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
      
      router.refresh();
      onSuccess({
        pinCode: pinCode.trim().toLowerCase(),
        city: city.trim().toLowerCase(),
        country: country.trim().toLowerCase(),
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not save location.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onClose) onClose(); }}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            Set Your Service Area
          </DialogTitle>
          <DialogDescription>
            You must set your PIN code and city to receive precise emergency SOS broadcasts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            className="w-full h-12 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation || saving}
          >
            {loadingLocation ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 mr-2" />
            )}
            Use My Current Location
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">PIN Code / Zip Code</label>
              <Input
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. 700001"
                disabled={loadingLocation || saving}
                className="h-10"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium mb-1 block">City</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kolkata"
                disabled={loadingLocation || saving}
                className="h-10"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Country</label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
                disabled={loadingLocation || saving}
                className="h-10"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!pinCode.trim() || !city.trim() || !country.trim() || saving || loadingLocation}
            className="w-full h-12 mt-2"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
