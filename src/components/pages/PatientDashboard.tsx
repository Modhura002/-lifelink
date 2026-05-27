'use client';

import { useMemo } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore, useAuthStore, useUIStore } from '@/store';
import { DEMO_PATIENTS } from '@/lib/mock-data';
import { getRelativeTime, BLOOD_GROUP_LABELS } from '@/lib/constants';
import EnhancedStatCards from '@/components/dashboard/EnhancedStatCards';
import QuickActionButtons from '@/components/dashboard/QuickActionButtons';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

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
  const { user } = useAuthStore();
  const { notifications } = useUIStore();

  const patient = useMemo(() => DEMO_PATIENTS[0], []);
  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">
          Welcome back, {user?.name?.split(' ')[0] || patient.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1 break-words">Here&apos;s your health overview</p>
      </motion.div>

      {/* Enhanced Stat Cards */}
      <EnhancedStatCards />

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
                <div className="space-y-3">
                  {patient.emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">
                          {contact.name.split(' ').map((n) => n[0]).join('')}
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
                    {BLOOD_GROUP_LABELS[patient.bloodGroup || 'O_POS']}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Bug className="h-3 w-3 text-orange-500" />
                    {patient.allergies.length} Allergies
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Pill className="h-3 w-3 text-blue-500" />
                    {patient.currentMedications.length} Medications
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Stethoscope className="h-3 w-3 text-purple-500" />
                    {patient.chronicConditions.length} Conditions
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
