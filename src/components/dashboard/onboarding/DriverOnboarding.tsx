'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DriverOnboardingProps {
  onComplete: () => void;
}

export default function DriverOnboarding({ onComplete }: DriverOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    experience: '',
    certificationDetails: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'DRIVER' })
      });
      
      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        alert('Failed to save profile: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Driver Verification</h3>
        <p className="text-sm text-muted-foreground mb-4">Please provide your professional driver details.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Driving License Number</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. DL-1420110012345"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Years of Experience</label>
        <input
          type="number"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. 5"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Medical Certifications</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. Basic Life Support (BLS), First Aid"
          value={formData.certificationDetails}
          onChange={(e) => setFormData({ ...formData, certificationDetails: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
        {loading ? 'Submitting...' : 'Submit Credentials'}
      </Button>
    </form>
  );
}
