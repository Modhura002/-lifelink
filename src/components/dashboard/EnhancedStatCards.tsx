'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Droplets,
  Building2,
  Users,
  Bug,
  Pill,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEmergencyStore } from '@/store';
import { DEMO_HOSPITALS } from '@/lib/mock-data';
import { haversineDistance, BLOOD_GROUP_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface StatCardData {
  id: string;
  icon: React.ElementType;
  title: string;
  borderColor: string;
  content: React.ReactNode;
}

export default function EnhancedStatCards({ patient }: { patient?: any }) {
  const { sosActivated } = useEmergencyStore();

  const p = patient || { bloodGroup: 'O+', allergies: [], currentMedications: [], emergencyContacts: [] };
  const bloodGroupLabel = BLOOD_GROUP_LABELS[p.bloodGroup || 'O_POS'];

  const nearbyHospitals = useMemo(() => {
    const delhiLat = 28.6139;
    const delhiLng = 77.209;
    return DEMO_HOSPITALS.filter(
      (h) => haversineDistance(delhiLat, delhiLng, h.latitude, h.longitude) <= 50
    );
  }, []);

  const cards: StatCardData[] = useMemo(
    () => [
      {
        id: 'emergency-status',
        icon: ShieldCheck,
        title: 'Emergency Status',
        borderColor: sosActivated
          ? 'border-l-red-500 dark:border-l-red-400'
          : 'border-l-emerald-500 dark:border-l-emerald-400',
        content: (
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                'gap-1.5 font-semibold',
                sosActivated
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  sosActivated ? 'bg-red-500' : 'bg-emerald-500'
                )}
              >
                {sosActivated && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </span>
              {sosActivated ? 'ACTIVE' : 'READY'}
            </Badge>
            {sosActivated && (
              <span className="text-xs text-red-600 dark:text-red-400 status-pulse font-medium">
                Emergency in progress
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'medical-profile',
        icon: Droplets,
        title: 'Medical Profile',
        borderColor: 'border-l-rose-500 dark:border-l-rose-400',
        content: (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-lg font-bold px-3 py-1 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400"
              >
                {bloodGroupLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bug className="h-3 w-3 text-orange-500" />
                {p.allergies.length} {p.allergies.length === 1 ? 'allergy' : 'allergies'}
              </span>
              <span className="flex items-center gap-1">
                <Pill className="h-3 w-3 text-sky-500" />
                {p.currentMedications.length} {p.currentMedications.length === 1 ? 'med' : 'meds'}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'nearby-hospitals',
        icon: Building2,
        title: 'Nearby Hospitals',
        borderColor: 'border-l-teal-500 dark:border-l-teal-400',
        content: (
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {nearbyHospitals.length}
              </span>
              <span className="text-xs text-muted-foreground">hospitals</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-teal-500" />
              <span>within 5km radius</span>
            </div>
          </div>
        ),
      },
      {
        id: 'next-of-kin',
        icon: Users,
        title: 'Next of Kin',
        borderColor: 'border-l-amber-500 dark:border-l-amber-400',
        content: (
          <div className="space-y-2">
            {p.emergencyContacts.map((contact: any) => (
              <div key={contact.id} className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{contact.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {contact.relationship}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [sosActivated, bloodGroupLabel, nearbyHospitals.length, p]
  );

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={fadeUp}
          whileHover={{
            scale: 1.04,
            rotateX: -4,
            rotateY: 4,
            z: 20,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          style={{ perspective: 800, transformStyle: 'preserve-3d' }}
        >
          <Card className={cn('card-hover border-l-4 shadow-sm hover:shadow-lg transition-shadow', card.borderColor)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </span>
              </div>
              {card.content}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
