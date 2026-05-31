'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Siren,
  Navigation,
  Building2,
  FileHeart,
  QrCode,
  Bell,
  MessageSquare,
  UserCircle,
  ClipboardList,
  Map,
  AlertTriangle,
  BedDouble,
  UserPlus,
  BarChart3,
  Users,
  Truck,
  Bot,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  Activity,
  IndianRupee,
  History,
  Car,
  Stethoscope,
  Pill,
  TrendingUp,
  FileBarChart,
  Settings,
  Calendar,
  HelpCircle,
  ShoppingBag,
  PackageOpen,
  CalendarCheck,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore, useUIStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import type { NavItem, PageRoute, Role } from '@/types';
import { cn } from '@/lib/utils';

// Icon map for string-based icon references from constants
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Siren,
  Navigation,
  Building2,
  FileHeart,
  QrCode,
  Bell,
  MessageSquare,
  UserCircle,
  ClipboardList,
  Map,
  AlertTriangle,
  BedDouble,
  UserPlus,
  BarChart3,
  Users,
  Truck,
  Bot,
  IndianRupee,
  History,
  Car,
  Stethoscope,
  Pill,
  TrendingUp,
  FileBarChart,
  Settings,
  Calendar,
  HelpCircle,
  ShoppingBag,
  PackageOpen,
  CalendarCheck,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Banknote,
};

const ROLE_COLORS: Record<Role, { bg: string; text: string; dot: string }> = {
  PATIENT: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  DRIVER: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  HOSPITAL_STAFF: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
  ADMIN: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  UNASSIGNED: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted' },
};

const ROLE_LABELS: Record<Role, string> = {
  PATIENT: 'Patient',
  DRIVER: 'Ambulance Driver',
  HOSPITAL_STAFF: 'Hospital Staff',
  ADMIN: 'System Admin',
  UNASSIGNED: 'Unassigned',
};

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-orange-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Categorize nav items into sections
function categorizeNavItems(items: NavItem[]): { label: string; items: NavItem[] }[] {
  const sections: { label: string; items: NavItem[] }[] = [];
  const mainItems = items.filter((item) => !item.emergency);
  const emergencyItems = items.filter((item) => item.emergency);

  if (mainItems.length > 0) {
    sections.push({ label: 'Main', items: mainItems });
  }
  if (emergencyItems.length > 0) {
    sections.push({ label: 'Emergency', items: emergencyItems });
  }

  return sections;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const { currentPage, sidebarOpen, toggleSidebar, setCurrentPage } = useNavigationStore();
  const { data: session } = useSession();
  const user = session?.user;
  const unreadCount = useUIStore((s) => s.unreadCount);
  const router = useRouter();

  const isCollapsed = controlledCollapsed ?? !sidebarOpen;

  const navSections = useMemo(() => {
    if (!user) return [];
    const items = NAVIGATION_ITEMS[user.role] ?? [];
    return categorizeNavItems(items);
  }, [user]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    useNavigationStore.getState().setCurrentPage('landing');
    router.push('/');
  };

  const handleNavClick = (route: PageRoute) => {
    setCurrentPage(route);
    router.push(`/?page=${route}`);
  };

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role];
  const avatarColor = getAvatarColor(user.name || 'User');
  const initials = getInitials(user.name || 'U');

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen bg-gradient-to-b from-muted/50 to-background border-r border-border fixed left-0 top-0 z-30"
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0 shadow-sm">
            <Heart className="size-5 text-primary-foreground" fill="currentColor" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap flex flex-col"
              >
                <span className="text-base font-bold leading-tight">LifeLink</span>
                <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                  <Activity className="size-2.5 text-primary" />
                  Every Second Matters
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Card */}
        <div className={cn('px-3 py-4 border-b border-border shrink-0', isCollapsed ? 'px-2' : 'px-3')}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="relative shrink-0">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full text-white text-sm font-bold ring-2 ring-background',
                  isCollapsed ? 'size-10' : 'size-11',
                  avatarColor,
                )}
              >
                {initials}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-background rounded-full flex items-center justify-center">
                <div className="size-2.5 rounded-full bg-emerald-500 ring-1 ring-background" />
              </div>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden min-w-0"
                >
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={cn('size-1.5 rounded-full', roleColor.dot)} />
                    <span
                      className={cn(
                        'inline-block px-1.5 py-px text-[10px] font-semibold rounded-full',
                        roleColor.bg,
                        roleColor.text,
                      )}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label} className="mb-3 last:mb-0">
              {/* Section Divider Label */}
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <Separator className="flex-1" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {section.label}
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              {isCollapsed && (
                <Separator className="mb-2" />
              )}

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const isActive = currentPage === item.route;
                  const isEmergency = item.emergency;
                  const isNotifications = item.route === 'notifications';

                  const navButton = (
                    <button
                      onClick={() => handleNavClick(item.route)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group',
                        isCollapsed && 'justify-center px-0',
                        isActive
                          ? isEmergency
                            ? 'bg-destructive/10 text-destructive font-bold border-l-[3px] border-destructive'
                            : 'bg-primary/10 text-primary font-bold border-l-[3px] border-primary'
                          : isEmergency
                            ? 'text-destructive/80 hover:bg-destructive/5 hover:text-destructive hover:translate-x-0.5'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5',
                        isCollapsed && isActive && (isEmergency ? 'bg-destructive/10' : 'bg-primary/10'),
                        isCollapsed && !isActive && 'hover:bg-accent/50',
                      )}
                    >
                      {/* Active indicator bar for collapsed mode */}
                      {isCollapsed && isActive && (
                        <motion.div
                          layoutId={`sidebar-active-collapsed-${item.route}`}
                          className={cn(
                            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full',
                            isEmergency ? 'bg-destructive' : 'bg-primary',
                          )}
                          initial={{ height: 0 }}
                          animate={{ height: 24 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      <Icon
                        className={cn(
                          'size-5 shrink-0 transition-colors',
                          isActive && (isEmergency ? 'text-destructive' : 'text-primary'),
                          isEmergency && !isActive && 'text-destructive/70',
                        )}
                      />

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden whitespace-nowrap truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Notification Badge */}
                      {isNotifications && unreadCount > 0 && (
                        <span
                          className={cn(
                            'flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[10px] font-bold shrink-0',
                            isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto',
                          )}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}

                      {/* Badge count for other items */}
                      {!isNotifications && item.badge && item.badge > 0 && !isCollapsed && (
                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-1.5">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );

                  // Tooltip for collapsed state
                  if (isCollapsed) {
                    return (
                      <li key={item.route}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {navButton}
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.route}>{navButton}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border shrink-0 p-2 space-y-1">
          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-200 hover:translate-x-0.5',
                  isCollapsed && 'justify-center px-0',
                )}
              >
                <LogOut className="size-5 shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Logout
              </TooltipContent>
            )}
          </Tooltip>

          <Separator />

          {/* Collapse Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle ?? toggleSidebar}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 hover:translate-x-0.5',
                  isCollapsed && 'justify-center px-0',
                )}
              >
                {isCollapsed ? (
                  <ChevronsRight className="size-5 shrink-0" />
                ) : (
                  <>
                    <ChevronsLeft className="size-5 shrink-0" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Expand Sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
