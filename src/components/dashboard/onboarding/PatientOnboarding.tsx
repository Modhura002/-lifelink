'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PatientOnboardingProps {
  onComplete: () => void;
}

export default function PatientOnboarding({ onComplete }: PatientOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
        emergencyContacts: formData.emergencyContactName ? [
          {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelation,
            phone: formData.emergencyContactPhone,
          }
        ] : [],
      };

      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, role: 'PATIENT' })
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
        <h3 className="text-lg font-semibold">Patient Profile Setup</h3>
        <p className="text-sm text-muted-foreground mb-4">Please provide your medical details for emergencies.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Age</label>
          <input
            type="number"
            className="w-full p-2 rounded-md border bg-background"
            placeholder="e.g. 30"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Gender</label>
          <select
            className="w-full p-2 rounded-md border bg-background"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Blood Group</label>
        <select
          className="w-full p-2 rounded-md border bg-background"
          value={formData.bloodGroup}
          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          required
        >
          <option value="">Select Blood Group</option>
          <option value="A_POS">A+</option>
          <option value="A_NEG">A-</option>
          <option value="B_POS">B+</option>
          <option value="B_NEG">B-</option>
          <option value="O_POS">O+</option>
          <option value="O_NEG">O-</option>
          <option value="AB_POS">AB+</option>
          <option value="AB_NEG">AB-</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Allergies (comma separated)</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. Peanuts, Penicillin"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Chronic Conditions (comma separated)</label>
        <input
          type="text"
          className="w-full p-2 rounded-md border bg-background"
          placeholder="e.g. Asthma, Diabetes"
          value={formData.chronicConditions}
          onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
        />
      </div>

      <div className="pt-2 border-t">
        <h4 className="text-sm font-semibold mb-2">Emergency Contact</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full p-2 rounded-md border bg-background"
              placeholder="Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Relationship</label>
            <input
              type="text"
              className="w-full p-2 rounded-md border bg-background"
              placeholder="e.g. Spouse, Parent"
              value={formData.emergencyContactRelation}
              onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              className="w-full p-2 rounded-md border bg-background"
              placeholder="Phone Number"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
        {loading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
