'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Bell,
  Stethoscope,
  Shield,
  Settings2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigationStore, useUIStore } from '@/store';
import { getRelativeTime } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ActivityType = 'emergency' | 'medical' | 'system' | 'notification';

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  type: ActivityType;
}

const ACTIVITY_STYLES: Record<ActivityType, { barColor: string; iconBg: string; iconColor: string }> = {
  emergency: {
    barColor: 'bg-red-500',
    iconBg: 'bg-red-50 dark:bg-red-950/40',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  medical: {
    barColor: 'bg-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  system: {
    barColor: 'bg-gray-400 dark:bg-gray-500',
    iconBg: 'bg-gray-50 dark:bg-gray-950/40',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  notification: {
    barColor: 'bg-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const itemFade = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function ActivityFeed() {
  const { setCurrentPage } = useNavigationStore();
  const { notifications } = useUIStore();

  const activities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Notification items - map types to activity types
    notifications.slice(0, 4).forEach((n) => {
      const typeMap: Record<string, ActivityType> = {
        EMERGENCY: 'emergency',
        AMBULANCE: 'notification',
        HOSPITAL: 'notification',
        SYSTEM: 'system',
      };
      const iconMap: Record<string, React.ElementType> = {
        EMERGENCY: Shield,
        AMBULANCE: Bell,
        HOSPITAL: Stethoscope,
        SYSTEM: Settings2,
      };
      items.push({
        id: n.id,
        icon: iconMap[n.type] || Bell,
        title: n.title,
        description: n.message,
        time: getRelativeTime(n.createdAt),
        type: typeMap[n.type] || 'system',
      });
    });

    return items;
  }, [notifications]);

  const displayItems = activities.slice(0, 6);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin"
          >
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Activity className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Your emergency events and system notifications will appear here.
                </p>
              </div>
            ) : (
              displayItems.map((item, index) => {
                const style = ACTIVITY_STYLES[item.type];
                return (
                  <motion.div
                    key={item.id}
                    variants={itemFade}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    {/* Left colored bar */}
                    <div className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full', style.barColor)} />

                    {/* Icon */}
                    <div className={cn('p-1.5 rounded-full shrink-0 ml-1', style.iconBg)}>
                      <item.icon className={cn('h-3.5 w-3.5', style.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* View All Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentPage('notifications')}
          >
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
