'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/store';
import { isDemoUser } from '@/lib/is-demo';

const DEMO_NOTIFICATIONS = [
  { id: 'demo-1', title: 'SOS Alert Test', message: 'A test emergency was triggered in your area.', type: 'EMERGENCY', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'demo-2', title: 'Ambulance Update', message: 'Your assigned ambulance is 2km away.', type: 'AMBULANCE', isRead: false, createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'demo-3', title: 'Hospital Bed Reserved', message: 'AIIMS has reserved an emergency bed for you.', type: 'HOSPITAL', isRead: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'demo-4', title: 'Medical Record Update', message: 'Your prescription was updated by Dr. Sharma.', type: 'SYSTEM', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'demo-5', title: 'Feedback Request', message: 'Please rate your last emergency experience.', type: 'SYSTEM', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

/**
 * Seeds the UIStore notification list with demo data — but ONLY for demo accounts.
 * Call this hook once inside DashboardLayout or a top-level authenticated component.
 * Real users are left with an empty, clean notification list.
 */
export function useDemoNotifications() {
  const { data: session } = useSession();
  const { notifications, addNotification } = useUIStore();

  useEffect(() => {
    // Only seed for demo users AND only if not already seeded
    if (!isDemoUser(session?.user?.email)) return;
    if (notifications.some((n) => n.id.startsWith('demo-'))) return;

    // Inject demo notifications directly into the store
    useUIStore.setState({
      notifications: [...DEMO_NOTIFICATIONS],
      unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.isRead).length,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);
}
