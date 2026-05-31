'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import PatientOnboarding from './onboarding/PatientOnboarding';
import DriverOnboarding from './onboarding/DriverOnboarding';
import StaffOnboarding from './onboarding/StaffOnboarding';
import AdminOnboarding from './onboarding/AdminOnboarding';

export default function OnboardingFlow() {
  const { data: session, update } = useSession();
  const user = session?.user;
  
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        
        let hasProfile = false;
        switch (user.role) {
          case 'PATIENT':
            hasProfile = !!data.patientProfile;
            break;
          case 'DRIVER':
            hasProfile = !!data.driverProfile;
            break;
          case 'HOSPITAL_STAFF':
            hasProfile = !!data.staffProfile;
            break;
          case 'ADMIN':
            hasProfile = !!data.adminProfile;
            break;
        }

        if (!hasProfile) {
          setIsVisible(true);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      checkProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleComplete = useCallback(async () => {
    // Optionally update session if we want to reflect isVerified, etc.
    await update();
    
    setExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setExiting(false);
    }, 400);
  }, [update]);

  if (!isVisible || loading || !user) return null;

  const renderForm = () => {
    switch (user.role) {
      case 'PATIENT':
        return <PatientOnboarding onComplete={handleComplete} />;
      case 'DRIVER':
        return <DriverOnboarding onComplete={handleComplete} />;
      case 'HOSPITAL_STAFF':
        return <StaffOnboarding onComplete={handleComplete} />;
      case 'ADMIN':
        return <AdminOnboarding onComplete={handleComplete} />;
      default:
        return <PatientOnboarding onComplete={handleComplete} />;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0"
      initial={{ opacity: 0 }}
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Content Modal */}
      <motion.div
        className="relative z-10 flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl mx-auto"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={exiting ? { scale: 0.95, opacity: 0, y: 20 } : { scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderForm()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
