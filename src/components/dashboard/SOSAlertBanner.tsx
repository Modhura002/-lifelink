'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X, Siren, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmergencyStore, useNavigationStore } from '@/store';
import { useSession } from 'next-auth/react';
import { SEVERITY_LABELS } from '@/lib/mock-data';

export default function SOSAlertBanner() {
  const { activeEmergency, sosActivated } = useEmergencyStore();
  const { setCurrentPage, currentPage } = useNavigationStore();
  const { data: session } = useSession();
  const user = session?.user;
  const [dismissed, setDismissed] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Reset dismiss when a new emergency starts
  useEffect(() => {
    if (activeEmergency) {
      setDismissed(false);
    }
  }, [activeEmergency?.requestId]);

  // Live elapsed timer
  useEffect(() => {
    if (!activeEmergency) return;
    const start = new Date(activeEmergency.startedAt).getTime();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [activeEmergency?.startedAt]);

  // Don't show on the SOS or tracking pages themselves (they have their own UI)
  const hiddenPages = ['sos', 'tracking', 'landing', 'login', 'signup', 'ai-chat'];
  if (!activeEmergency || dismissed || hiddenPages.includes(currentPage)) return null;

  const severity = SEVERITY_LABELS[activeEmergency.severity];
  const isPatient = user?.role === 'PATIENT';
  const isDriver = user?.role === 'DRIVER';
  const isHospital = user?.role === 'HOSPITAL_STAFF';
  const isAdmin = user?.role === 'ADMIN';

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const navigateTo = () => {
    if (isPatient) setCurrentPage('tracking');
    else if (isDriver) setCurrentPage('driver-navigation');
    else if (isHospital) setCurrentPage('hospital-patients');
    else setCurrentPage('admin-emergencies');
  };

  const actionLabel = isPatient
    ? 'Track Ambulance'
    : isDriver
    ? 'View Assignment'
    : isHospital
    ? 'Prepare for Patient'
    : 'View Emergency';

  return (
    <AnimatePresence>
      <motion.div
        key={activeEmergency.requestId}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[200] shadow-2xl"
      >
        <div className="bg-red-600 dark:bg-red-700 text-white">
          <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-3">
            {/* Pulsing siren icon */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex-shrink-0"
            >
              <Siren className="w-5 h-5" />
            </motion.div>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-bold text-sm tracking-wide uppercase whitespace-nowrap">
                🚨 SOS EMERGENCY ACTIVE
              </span>

              {severity && (
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold px-2">
                  {severity.label}
                </Badge>
              )}

              <span className="text-white/80 text-xs hidden sm:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsed)}
              </span>

              {activeEmergency.patientName && (
                <span className="text-white/80 text-xs hidden md:block">
                  Patient: <span className="text-white font-medium">{activeEmergency.patientName}</span>
                </span>
              )}

              <span className="text-white/70 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activeEmergency.patientLatitude.toFixed(4)}, {activeEmergency.patientLongitude.toFixed(4)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={navigateTo}
                className="h-7 px-3 text-xs bg-white text-red-600 hover:bg-white/90 border-0 font-semibold gap-1"
              >
                {actionLabel}
                <ArrowRight className="w-3 h-3" />
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Severity color bar */}
        <motion.div
          className="h-0.5 bg-white/40"
          animate={{ scaleX: [0, 1] }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
