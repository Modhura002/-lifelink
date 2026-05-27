'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Ambulance,
  Building2,
  Settings2,
  CheckCheck,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store';
import { getRelativeTime } from '@/lib/constants';
import { cn } from '@/lib/utils';

type FilterTab = 'ALL' | 'EMERGENCY' | 'AMBULANCE' | 'HOSPITAL' | 'SYSTEM';

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'Ambulance', value: 'AMBULANCE' },
  { label: 'Hospital', value: 'HOSPITAL' },
  { label: 'System', value: 'SYSTEM' },
];

const NOTIFICATION_ICON_MAP: Record<
  string,
  { icon: typeof Bell; colorClass: string; bgClass: string }
> = {
  EMERGENCY: {
    icon: AlertTriangle,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
  },
  AMBULANCE: {
    icon: Ambulance,
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-100 dark:bg-sky-900/30',
  },
  HOSPITAL: {
    icon: Building2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  SYSTEM: {
    icon: Settings2,
    colorClass: 'text-gray-500 dark:text-gray-400',
    bgClass: 'bg-gray-100 dark:bg-gray-800/40',
  },
};

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const notifications = useUIStore((s) => s.notifications);
  const markAsRead = useUIStore((s) => s.markAsRead);
  const markAllAsRead = useUIStore((s) => s.markAllAsRead);
  const unreadCount = useUIStore((s) => s.unreadCount);

  const filteredNotifications =
    activeFilter === 'ALL'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] p-0">
        <SheetHeader className="px-6 pt-6 pb-0 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs px-2 py-0.5 rounded-full"
                >
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
              >
                <CheckCheck className="size-3.5" />
                Mark All Read
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-border overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
                activeFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <ScrollArea className="flex-1 h-[calc(100dvh-11rem)]">
          <div className="px-4 py-2">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              >
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Bell className="size-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">
                  {activeFilter !== 'ALL'
                    ? `No ${activeFilter.toLowerCase()} notifications found`
                    : "You're all caught up!"}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification, index) => {
                  const iconConfig = NOTIFICATION_ICON_MAP[notification.type] || NOTIFICATION_ICON_MAP.SYSTEM;
                  const IconComp = iconConfig.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.04,
                        layout: { duration: 0.2 },
                      }}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-lg cursor-pointer transition-colors group',
                        'hover:bg-accent/50',
                        !notification.isRead && 'bg-accent/30',
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex items-center justify-center rounded-full size-9 shrink-0 mt-0.5',
                          iconConfig.bgClass,
                        )}
                      >
                        <IconComp className={cn('size-4', iconConfig.colorClass)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm leading-snug truncate',
                              !notification.isRead
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground',
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="shrink-0 mt-1.5 size-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
