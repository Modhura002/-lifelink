'use client';
import { useSession } from 'next-auth/react';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Phone,
  Bell,
  ArrowRight,
  Stethoscope,
  Heart,
  Pill,
  Bug,
  ShoppingBag,
  Zap,
  Truck,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useNavigationStore, useUIStore } from '@/store';
import { getRelativeTime, BLOOD_GROUP_LABELS } from '@/lib/constants';
import EnhancedStatCards from '@/components/dashboard/EnhancedStatCards';
import QuickActionButtons from '@/components/dashboard/QuickActionButtons';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import EmergencyReadiness from '@/components/dashboard/EmergencyReadiness';
import DashboardHero from '@/components/dashboard/DashboardHero';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function PatientDashboard() {
  const { setCurrentPage } = useNavigationStore();
  const { data: session } = useSession();
  const user = session?.user;
  const { notifications } = useUIStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.id]);

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const patient = {
    ...profile,
    bloodGroup: profile?.patientProfile?.bloodGroup || 'O+',
    allergies: profile?.patientProfile?.allergies ? JSON.parse(profile.patientProfile.allergies) : [],
    chronicConditions: profile?.patientProfile?.chronicConditions ? JSON.parse(profile.patientProfile.chronicConditions) : [],
    currentMedications: profile?.patientProfile?.currentMedications ? JSON.parse(profile.patientProfile.currentMedications) : [],
    emergencyContacts: profile?.emergencyContacts || [],
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Hero Header */}
      <DashboardHero
        greeting="Welcome back"
        name={user?.name?.split(' ')[0] || 'Patient'}
        subtitle="Your health overview · Stay prepared for emergencies"
        gradient="linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f172a 100%)"
        accentColor="rgba(16,185,129,0.3)"
        icon={<Heart className="w-6 h-6 text-emerald-300" fill="currentColor" />}
        badge="Patient Portal"
        stats={[
          {
            value: patient?.emergencyContacts?.length
              ? String(patient.emergencyContacts.length)
              : '—',
            label: 'Emergency contacts',
          },
          {
            value: patient?.allergies?.length
              ? String(patient.allergies.length)
              : '—',
            label: 'Known allergies',
          },
          {
            value: patient?.currentMedications?.length
              ? String(patient.currentMedications.length)
              : '—',
            label: 'Active medications',
          },
          {
            value: patient?.bloodGroup
              ? patient.bloodGroup.replace('_POS', '+').replace('_NEG', '−')
              : '—',
            label: 'Blood group',
          },
        ]}
      />

      {/* Enhanced Stat Cards */}
      <EnhancedStatCards patient={patient} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Action Buttons */}
          <motion.div variants={fadeUp}>
            <QuickActionButtons />
          </motion.div>

          {/* Activity Feed */}
          <ActivityFeed />

          {/* Emergency Contacts */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {!patient?.emergencyContacts?.length ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <Phone className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">No emergency contacts added</p>
                    <p className="text-xs text-muted-foreground/60">Add contacts in your profile settings.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patient.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <span className="text-xs font-medium">
                            {contact.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mini QR Card Preview */}
          <motion.div variants={fadeUp}>
            <Card
              className="card-hover cursor-pointer overflow-hidden"
              onClick={() => setCurrentPage('qr-card')}
            >
              <CardContent className="p-4">
                <div className="bg-gradient-to-br from-primary/90 to-primary p-4 rounded-xl text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xs font-semibold opacity-70">LifeLink</div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{patient.name}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {BLOOD_GROUP_LABELS[patient.bloodGroup || 'O_POS']}
                      </Badge>
                      <QrCode className="h-10 w-10 opacity-40" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Tap to view full QR Card</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medical Summary */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Medical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    {BLOOD_GROUP_LABELS[patient?.bloodGroup || 'O_POS']}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Bug className="h-3 w-3 text-orange-500" />
                    {patient?.allergies?.length ?? 0} Allergies
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Pill className="h-3 w-3 text-blue-500" />
                    {patient?.currentMedications?.length ?? 0} Medications
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Stethoscope className="h-3 w-3 text-purple-500" />
                    {patient?.chronicConditions?.length ?? 0} Conditions
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => setCurrentPage('medical-records')}
                >
                  View Full Records <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Readiness */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardContent className="p-4">
                <EmergencyReadiness patient={patient} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Pharmacy Quick Access */}
          <motion.div variants={fadeUp}>
            <Card
              className="card-hover cursor-pointer overflow-hidden border-0"
              onClick={() => setCurrentPage('pharmacy-store')}
            >
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-white/5 -translate-y-4 translate-x-4" />
                  <div className="absolute right-6 bottom-0 w-16 h-16 rounded-full bg-white/5 translate-y-3" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="size-4 text-white" />
                      </div>
                      <span className="text-white font-bold text-sm">LifeLink Pharmacy</span>
                    </div>

                    <p className="text-white/80 text-xs mb-4 leading-relaxed">
                      Order authentic medicines & healthcare products delivered to your door.
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                      {[
                        { icon: Truck, label: 'Fast Delivery' },
                        { icon: Zap, label: '100% Genuine' },
                        { icon: Clock, label: '24hr Delivery' },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1 text-white/70 text-[10px]">
                          <Icon className="size-2.5" />
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">22+ medicine categories</span>
                      <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-white text-xs font-semibold">Shop Now</span>
                        <ArrowRight className="size-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Feed */}
          <motion.div variants={fadeUp}>
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setCurrentPage('notifications')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                  {recentNotifications.map((n) => {
                    const colorMap: Record<string, string> = {
                      EMERGENCY: 'text-red-500',
                      AMBULANCE: 'text-blue-500',
                      HOSPITAL: 'text-emerald-500',
                      SYSTEM: 'text-gray-500',
                    };
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setCurrentPage('notifications')}
                      >
                        <div className={`mt-0.5 ${colorMap[n.type] || 'text-gray-500'}`}>
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium truncate">{n.title}</p>
                            {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{getRelativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
