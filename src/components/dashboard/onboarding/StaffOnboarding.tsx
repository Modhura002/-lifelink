'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface StaffOnboardingProps {
  onComplete: () => void;
}

export default function StaffOnboarding({ onComplete }: StaffOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    employeeId: '',
    hospitalId: 'hosp-3', // Default for now
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'HOSPITAL_STAFF' })
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
        <h3 className="text-lg font-semibold">Hospital Staff Profile</h3>
        <p className="text-sm text-muted-foreground mb-4">Set up your employment credentials.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Employee ID</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. EMP-2023-001"
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Department</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. Emergency Response"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Designation</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. Head Nurse, Trauma Surgeon"
          value={formData.designation}
          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
        {loading ? 'Submitting...' : 'Link to Hospital'}
      </Button>
    </form>
  );
}
