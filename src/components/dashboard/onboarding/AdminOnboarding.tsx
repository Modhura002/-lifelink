'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AdminOnboardingProps {
  onComplete: () => void;
}

export default function AdminOnboarding({ onComplete }: AdminOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'ADMIN' })
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
        <h3 className="text-lg font-semibold">Admin Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">Set up your administrative context.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Organization / Network Name</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. State Health Department"
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
        {loading ? 'Submitting...' : 'Initialize Admin Console'}
      </Button>
    </form>
  );
}
